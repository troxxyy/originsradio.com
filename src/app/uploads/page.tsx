'use client'

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileAudio, Loader2, CheckCircle, XCircle, Plus, User } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import WaveformGenerator from '@/components/admin/WaveformGenerator';

interface UploadStatus {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  setNumber?: number; // Add setNumber property
  artistId?: string; // Add artistId property
  artistName?: string; // Add artistName property
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showMetaDialog, setShowMetaDialog] = useState(false);
  const [pendingMetaFile, setPendingMetaFile] = useState<File | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaSetNumber, setMetaSetNumber] = useState<string>('');
  const [metaReleaseDate, setMetaReleaseDate] = useState<string>('');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch artists for dropdown
  const { data: artists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const { getArtists } = await import('@/lib/supabase-utils');
      return getArtists();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (!selectedArtistId) {
      toast({
        title: "No artist selected",
        description: "Please select an artist before uploading files",
        variant: "destructive"
      });
      return;
    }

    // Filter for audio files
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a|opus)$/i)
    );

    if (audioFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only audio files are allowed",
        variant: "destructive"
      });
    }

    const newUploads: UploadStatus[] = audioFiles.map(file => {
      // Try to extract set number from file name (first number found)
      const match = file.name.match(/(\d+)/);
      const setNumber = match ? parseInt(match[1], 10) : undefined;
      const selectedArtist = artists.find(a => a.id === selectedArtistId);
      return {
        file,
        status: 'uploading',
        progress: 0,
        setNumber,
        artistId: selectedArtistId,
        artistName: selectedArtist?.name,
      };
    });

    setUploads(prev => [...prev, ...newUploads]);
    // Prompt metadata for the first file; process sequentially
    if (audioFiles.length > 0) {
      const first = audioFiles[0];
      setPendingMetaFile(first);
      const guessTitle = first.name.replace(/\.[^/.]+$/, '');
      setMetaTitle(guessTitle);
      const match = first.name.match(/(\d+)/);
      setMetaSetNumber(match ? String(parseInt(match[1], 10)) : '');
      setMetaReleaseDate(new Date().toISOString().split('T')[0]);
      setShowMetaDialog(true);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const supabase = getSupabaseAdminClient();
      // Ensure waveforms bucket exists and is public
      // Buckets should be provisioned in Supabase; avoid runtime create/update to prevent 400s

      for (const file of files) {
        try {
          // Generate a unique filename
          const timestamp = Date.now();
          const fileExtension = file.name.split('.').pop();
          const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${fileName}`;

          // Try signed upload first; if it fails, fall back to direct upload
          const storageRef = supabase.storage.from('sets');
          let uploadedOk = false;
          try {
            const { data: signed, error: signErr } = await storageRef.createSignedUploadUrl(filePath);
            if (signErr || !signed?.token) throw signErr || new Error('Failed to create signed upload URL');
            const { error: uploadErr } = await storageRef.uploadToSignedUrl(filePath, signed.token, file, {
              contentType: file.type || 'application/octet-stream',
              upsert: false
            });
            if (uploadErr) throw uploadErr;
            uploadedOk = true;
          } catch (signedErr) {
            // Fallback to standard upload
            const { error: directErr } = await storageRef.upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || 'application/octet-stream'
            });
            if (directErr) {
              throw directErr;
            }
            uploadedOk = true;
          }

          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('sets')
            .getPublicUrl(filePath);

          // Compute peaks client-side using WaveSurfer and upload JSON to waveforms bucket
          const peaks = await computePeaksFromFile(file);
          const baseName = fileName.replace(/\.[^.]+$/, '');
          const peaksPath = `${baseName}.json`;
          const peaksBlob = new Blob([JSON.stringify({ peaks })], { type: 'application/json' });
          const { data: peaksData } = await supabase.storage
            .from('waveforms')
            .upload(peaksPath, peaksBlob, { cacheControl: '3600', upsert: true, contentType: 'application/json' });

          // Get peaks URL
          const { data: peaksUrlData } = supabase.storage
            .from('waveforms')
            .getPublicUrl(peaksPath);

          // Find the upload to get artist info
          const currentUpload = uploads.find(upload => upload.file === file);
          if (currentUpload?.artistId) {
            // Create set in database using MCP
            try {
              const { createSetAdmin } = await import('@/lib/supabase-utils');
              const setData = {
                title: file === pendingMetaFile && metaTitle ? metaTitle : file.name.replace(/\.[^/.]+$/, ''),
                artist_id: currentUpload.artistId,
                audio_url: urlData.publicUrl,
                peaks_url: peaksUrlData.publicUrl,
                duration: null, // Could be calculated from peaks if needed
                release_date: file === pendingMetaFile && metaReleaseDate ? metaReleaseDate : new Date().toISOString().split('T')[0],
                set_number: file === pendingMetaFile && metaSetNumber ? parseInt(metaSetNumber, 10) : currentUpload?.setNumber ?? null,
                views_count: 0,
              };
              
              const newSet = await createSetAdmin(setData);
              if (newSet) {
                console.log('Set created successfully:', newSet);
              }
            } catch (dbError) {
              console.error('Error creating set in database:', dbError);
              // Continue with upload success even if DB creation fails
            }
          }

          // Update upload status
          setUploads(prev => prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'success' as const, progress: 100 }
              : upload
          ));

          toast({
            title: "Upload successful",
            description: `${file.name} has been uploaded and linked to ${currentUpload?.artistName || 'selected artist'}`,
          });

        } catch (error) {
          console.error('Upload error:', error);
          setUploads(prev => prev.map(upload => 
            upload.file === file 
              ? { 
                  ...upload, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : upload
          ));

          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Supabase admin client error:', error);
      toast({
        title: "Configuration Error",
        description: "Please set NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY environment variable for admin uploads",
        variant: "destructive"
      });
    }

    setIsUploading(false);
  };

  const handleMetaCancel = () => {
    setShowMetaDialog(false);
    // Proceed with upload for all files with defaults
    if (pendingMetaFile) {
      uploadFiles([pendingMetaFile]);
    }
    setPendingMetaFile(null);
  };

  const handleMetaConfirm = () => {
    setShowMetaDialog(false);
    if (pendingMetaFile) {
      uploadFiles([pendingMetaFile]);
    }
    setPendingMetaFile(null);
  };

  // Compute PCM peaks via WaveSurfer without rendering
  const computePeaksFromFile = async (file: File): Promise<number[]> => {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-99999px';
    tempContainer.style.width = '0px';
    tempContainer.style.height = '0px';
    document.body.appendChild(tempContainer);

    const objectUrl = URL.createObjectURL(file);
    const ws = WaveSurfer.create({
      container: tempContainer,
      url: objectUrl,
      interact: false,
      waveColor: '#000',
      progressColor: '#000',
      cursorColor: 'transparent',
      height: 0,
      minPxPerSec: 20,
      autoCenter: false,
    });

    const peaks = await new Promise<number[]>((resolve, reject) => {
      const onReady = () => {
        try {
          const anyWs = ws as unknown as { exportPCM?: (length?: number, accuracy?: number, noWindow?: boolean) => Float32Array | number[] };
          const pcm = anyWs.exportPCM?.(2000, 1000, true) as Float32Array | number[] | undefined;
          const arr = pcm ? Array.from(pcm) : [];
          resolve(arr);
        } catch (e) {
          resolve([]);
        }
      };
      const onError = (e: unknown) => resolve([]);
      ws.on('ready', onReady);
      ws.on('error', onError);
    });

    try { ws.destroy(); } catch {}
    URL.revokeObjectURL(objectUrl);
    document.body.removeChild(tempContainer);
    return peaks;
  };

  const removeUpload = (file: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  };

  const clearAll = () => {
    setUploads([]);
  };

  const getStatusIcon = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Admin Uploads</h1>
            <p className="text-gray-400 text-lg">
              Upload audio files directly to the sets storage bucket
            </p>
          </div>

          {/* Waveform Generator */}
          <WaveformGenerator />

          {/* Artist Selection */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Select Artist
              </h2>
              <Link
                href="/artistcontrolsecret"
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create New Artist
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={selectedArtistId}
                onChange={(e) => setSelectedArtistId(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                disabled={artistsLoading}
                aria-label="Select artist for upload"
                title="Select artist for upload"
              >
                <option value="">Choose an artist...</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
              {selectedArtistId && (
                <div className="text-sm text-gray-400">
                  Selected: {artists.find(a => a.id === selectedArtistId)?.name}
                </div>
              )}
            </div>
            
            {!selectedArtistId && (
              <p className="text-sm text-yellow-400 mt-2">
                ⚠️ Please select an artist before uploading files
              </p>
            )}
          </div>

          {/* Upload Area */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 mb-8 mt-8 border border-gray-700">
            <div className="text-center">
              <div className="mb-6">
                <FileAudio className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Upload Audio Files</h2>
                <p className="text-gray-400">
                  Drag and drop audio files here or click to browse
                  {selectedArtistId && (
                    <span className="block text-sm text-blue-400 mt-1">
                      Files will be associated with: {artists.find(a => a.id === selectedArtistId)?.name}
                    </span>
                  )}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a,.opus"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Select audio files to upload"
                title="Select audio files to upload"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !selectedArtistId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-5 w-5 mr-2" />
                {isUploading ? 'Uploading...' : 'Select Files'}
              </Button>

              <p className="text-sm text-gray-500 mt-4">
                Supported formats: MP3, WAV, FLAC, AAC, OGG, M4A, OPUS
              </p>
            </div>
          </div>

          {/* Upload List */}
          {uploads.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Upload Queue</h3>
                <Button
                  onClick={clearAll}
                  variant="outline"
                  className="text-gray-400 hover:text-white"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-3">
                {/* Sort uploads by setNumber (ascending, undefined last) */}
                {uploads
                  .slice() // copy to avoid mutating state
                  .sort((a, b) => {
                    const aNum = a.setNumber ?? Infinity;
                    const bNum = b.setNumber ?? Infinity;
                    return aNum - bNum;
                  })
                  .map((upload, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(upload.status)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{upload.file.name}</p>
                        {upload.artistName && (
                          <p className="text-xs text-blue-400">Artist: {upload.artistName}</p>
                        )}
                        {/* Show set number if available */}
                        {upload.setNumber !== undefined && (
                          <p className="text-xs text-blue-400">Set #{upload.setNumber}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {upload.status === 'uploading' && (
                          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                        )}
                        {upload.status === 'error' && upload.error && (
                          <p className="text-xs text-red-400 mt-1">{upload.error}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => removeUpload(upload.file)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Files are uploaded to: <code className="bg-gray-700 px-2 py-1 rounded">originsradio/sets/</code>
            </p>
          </div>

          <Dialog open={showMetaDialog} onOpenChange={setShowMetaDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set_number">Set number</Label>
                  <Input id="set_number" type="number" value={metaSetNumber} onChange={(e) => setMetaSetNumber(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release_date">Release date</Label>
                  <Input id="release_date" type="date" value={metaReleaseDate} onChange={(e) => setMetaReleaseDate(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={handleMetaCancel}>Skip</Button>
                <Button onClick={handleMetaConfirm}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 