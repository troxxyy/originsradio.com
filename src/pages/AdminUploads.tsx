import { useState, useRef } from 'react';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileAudio, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface UploadStatus {
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  setNumber?: number; // Add setNumber property
}

const AdminUploads = () => {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

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
      return {
        file,
        status: 'uploading',
        progress: 0,
        setNumber,
      };
    });

    setUploads(prev => [...prev, ...newUploads]);
    uploadFiles(audioFiles);
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const supabase = getSupabaseAdminClient();

      for (const file of files) {
        try {
          // Generate a unique filename
          const timestamp = Date.now();
          const fileExtension = file.name.split('.').pop();
          const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `sets/${fileName}`;

          // Upload to Supabase storage
          const { data, error } = await supabase.storage
            .from('sets')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            throw error;
          }

          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('sets')
            .getPublicUrl(filePath);

          // Update upload status
          setUploads(prev => prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'success' as const, progress: 100 }
              : upload
          ));

          toast({
            title: "Upload successful",
            description: `${file.name} has been uploaded successfully`,
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
        description: "Please set VITE_SUPABASE_SERVICE_ROLE_KEY environment variable for admin uploads",
        variant: "destructive"
      });
    }

    setIsUploading(false);
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

          {/* Upload Area */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 mb-8 border border-gray-700">
            <div className="text-center">
              <div className="mb-6">
                <FileAudio className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Upload Audio Files</h2>
                <p className="text-gray-400">
                  Drag and drop audio files here or click to browse
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
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
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
        </div>
      </div>
    </div>
  );
};

export default AdminUploads; 