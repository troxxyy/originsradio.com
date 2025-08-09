import React, { useState } from 'react';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';

interface ProcessingStatus {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  peaksCount?: number;
}

const WaveformGenerator = () => {
  const [sets, setSets] = useState<ProcessingStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();



  // Load sets without peaks
  const loadSetsWithoutPeaks = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('sets')
        .select('id, title, audio_url, peaks_url')
        .is('peaks_url', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const statusList: ProcessingStatus[] = (data || []).map(set => ({
        id: set.id,
        title: set.title,
        status: 'pending'
      }));

      setSets(statusList);
      toast({
        title: "Sets loaded",
        description: `Found ${statusList.length} sets without waveform peaks`,
      });
    } catch (error) {
      console.error('Error loading sets:', error);
      toast({
        title: "Error loading sets",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compute peaks directly using Web Audio API (more reliable than WaveSurfer PCM)
  const computePeaksFromUrl = async (audioUrl: string): Promise<number[]> => {
    try {
      // Ensure we have a complete URL, not a relative path
      const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : 
        audioUrl.startsWith('/') ? `${window.location.origin}${audioUrl}` : audioUrl;

      console.log(`🔍 Processing audio with Web Audio API: ${fullAudioUrl}`);
      
      // Check if it's a large file
      const isLargeFile = fullAudioUrl.includes('.m4a') || fullAudioUrl.includes('.wav') || fullAudioUrl.includes('.flac');
      
      // Fetch the audio file
      console.log(`📥 Fetching audio file...`);
      const response = await fetch(fullAudioUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log(`✅ Audio file loaded: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
      
      // Decode audio using Web Audio API
      console.log(`🔊 Decoding audio with Web Audio API...`);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      console.log(`✅ Audio decoded: ${audioBuffer.duration.toFixed(1)}s, ${audioBuffer.numberOfChannels} channels, ${audioBuffer.sampleRate}Hz`);
      
      // Get the first channel data
      const channelData = audioBuffer.getChannelData(0);
      console.log(`📊 Raw audio data: ${channelData.length} samples`);
      
      // Calculate target peaks for 1-hour sets
      const targetPeaks = 60000;
      const peaks = downsampleAudioData(channelData, targetPeaks);
      
      console.log(`✅ Generated ${peaks.length} peaks using Web Audio API`);
      
      // Clean up
      audioContext.close();
      
      return peaks;
    } catch (error) {
      console.error('Web Audio API error:', error);
      throw error;
    }
  };

  // Downsample audio data efficiently for waveform display
  const downsampleAudioData = (data: Float32Array, targetLength: number): number[] => {
    if (data.length <= targetLength) return Array.from(data);
    
    const blockSize = Math.floor(data.length / targetLength);
    const result: number[] = [];
    
    console.log(`📉 Downsampling audio: ${data.length} samples -> ${targetLength} peaks (${blockSize} samples per peak)`);
    
    for (let i = 0; i < targetLength; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, data.length);
      
      // Find the maximum absolute value in this block to preserve peaks
      let maxVal = 0;
      let maxAbsVal = 0;
      for (let j = start; j < end; j++) {
        const val = data[j];
        const absVal = val < 0 ? -val : val;
        if (absVal > maxAbsVal) {
          maxAbsVal = absVal;
          maxVal = val;
        }
      }
      result.push(maxVal);
    }
    
    console.log(`✅ Downsampling complete: ${result.length} peaks, sample: [${result.slice(0, 10).map(v => v.toFixed(3)).join(', ')}...]`);
    return result;
  };

  // Generate peaks filename from audio URL
  const generatePeaksFilename = (audioUrl: string): string => {
    try {
      const url = new URL(audioUrl, window.location.origin);
      const parts = url.pathname.split('/');
      const fileName = parts[parts.length - 1];
      // Decode any URL encoding in the filename to avoid double encoding
      const decodedFileName = decodeURIComponent(fileName);
      const baseName = decodedFileName.replace(/\.[^.]+$/, '');
      // Clean filename for storage (replace spaces and special chars)
      const cleanBaseName = baseName.replace(/[^a-zA-Z0-9.-]/g, '_');
      return `${cleanBaseName}.json`;
    } catch {
      return `peaks_${Date.now()}.json`;
    }
  };

  // Upload peaks to waveforms bucket and update database
  const uploadPeaksAndUpdate = async (setId: string, audioUrl: string, peaks: number[]) => {
    const supabase = getSupabaseAdminClient();
    
    // Upload to storage
    const filename = generatePeaksFilename(audioUrl);
    const peaksBlob = new Blob([JSON.stringify({ peaks })], { type: 'application/json' });
    
    const { data, error: uploadError } = await supabase.storage
      .from('waveforms')
      .upload(filename, peaksBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/json'
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('waveforms')
      .getPublicUrl(filename);

    // Update database
    const { error: updateError } = await supabase
      .from('sets')
      .update({ peaks_url: urlData.publicUrl })
      .eq('id', setId);

    if (updateError) throw updateError;

    return urlData.publicUrl;
  };

  // Process a single set
  const processSingleSet = async (setData: any) => {
    const setId = setData.id;
    
    // Update status to processing
    setSets(prev => prev.map(set => 
      set.id === setId ? { ...set, status: 'processing' } : set
    ));

    try {
      // Compute peaks
      const peaks = await computePeaksFromUrl(setData.audio_url);
      
      if (peaks.length === 0) {
        throw new Error('No peaks generated - audio might be invalid');
      }

      // Upload and update database
      await uploadPeaksAndUpdate(setId, setData.audio_url, peaks);

      // Update status to success
      setSets(prev => prev.map(set => 
        set.id === setId 
          ? { ...set, status: 'success', peaksCount: peaks.length } 
          : set
      ));

      return true;
    } catch (error) {
      // Update status to error
      setSets(prev => prev.map(set => 
        set.id === setId 
          ? { ...set, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
          : set
      ));
      return false;
    }
  };

  // Process all sets
  const processAllSets = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const supabase = getSupabaseAdminClient();
      
      // Ensure waveforms bucket exists
      try {
        await supabase.storage.createBucket('waveforms', { 
          public: true, 
          fileSizeLimit: '5MB', 
          allowedMimeTypes: ['application/json'] 
        });
      } catch (e) {
        // Bucket might already exist, ignore error
        console.log('Waveforms bucket already exists or could not be created');
      }
      
      const { data: setsData, error } = await supabase
        .from('sets')
        .select('id, title, audio_url')
        .is('peaks_url', null);

      if (error) throw error;

      if (!setsData || setsData.length === 0) {
        toast({
          title: "No sets to process",
          description: "All sets already have waveform peaks",
        });
        return;
      }

      let successful = 0;
      let failed = 0;

      for (const setData of setsData) {
        const success = await processSingleSet(setData);
        if (success) successful++;
        else failed++;
        
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Processing complete",
        description: `✓ ${successful} successful, ✗ ${failed} failed`,
      });
    } catch (error) {
      console.error('Error processing sets:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Test processing a single set
  const testSingleSet = async (setData: any) => {
    const setId = setData.id;
    
    setSets(prev => prev.map(set => 
      set.id === setId ? { ...set, status: 'processing' } : set
    ));

    try {
      console.log(`🔄 Testing single set: ${setData.title} (${setData.audio_url})`);
      
      // First test if the audio URL is accessible
      const fullAudioUrl = setData.audio_url.startsWith('http') ? setData.audio_url : 
        setData.audio_url.startsWith('/') ? `${window.location.origin}${setData.audio_url}` : setData.audio_url;
      
      console.log(`🌐 Testing audio accessibility: ${fullAudioUrl}`);
      
      // Test audio accessibility
      try {
        const response = await fetch(fullAudioUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Audio file not accessible: ${response.status} ${response.statusText}`);
        }
        console.log(`✅ Audio file is accessible`);
      } catch (fetchError) {
        throw new Error(`Audio file fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
      
      // Compute peaks
      const peaks = await computePeaksFromUrl(setData.audio_url);
      
      if (peaks.length === 0) {
        throw new Error('No peaks generated - this could be due to: 1) Audio codec not supported by browser, 2) Corrupted audio file, 3) WaveSurfer unable to decode the file, 4) CORS or network issues');
      }

      console.log(`✅ Successfully generated ${peaks.length} peaks for ${setData.title}`);

      // Save the peaks to storage and update database during testing
      console.log(`💾 Saving peaks to storage for ${setData.title}...`);
      await uploadPeaksAndUpdate(setId, setData.audio_url, peaks);
      console.log(`✅ Peaks saved to storage for ${setData.title}`);

      // Update status to success
      setSets(prev => prev.map(set => 
        set.id === setId 
          ? { ...set, status: 'success', peaksCount: peaks.length } 
          : set
      ));

      toast({
        title: "Test successful", 
        description: `Generated ${peaks.length} peaks for ${setData.title}`,
      });

      return true;
    } catch (error) {
      console.error(`❌ Test failed for ${setData.title}:`, error);
      
      // Enhanced error logging
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Detailed error info:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        console.error('Non-standard error object:', error);
        errorMessage = `Unexpected error type: ${typeof error}`;
      }
      
      // Update status to error
      setSets(prev => prev.map(set => 
        set.id === setId 
          ? { ...set, status: 'error', error: errorMessage }
          : set
      ));
      
      toast({
        title: "Test failed",
        description: `${setData.title}: ${errorMessage}`,
        variant: "destructive"
      });

      return false;
    }
  };

  const getStatusIcon = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-white">Waveform Generator</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={loadSetsWithoutPeaks}
            disabled={isLoading || isProcessing}
            variant="outline"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Load Sets Without Peaks
          </Button>
          
          <Button
            onClick={processAllSets}
            disabled={isProcessing || sets.length === 0}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Generate All Waveforms
          </Button>
        </div>

        {sets.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">Sets ({sets.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {sets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded border border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(set.status)}
                    <div>
                      <p className="text-sm font-medium text-white">{set.title}</p>
                      {set.peaksCount && (
                        <p className="text-xs text-green-400">Generated {set.peaksCount} peaks</p>
                      )}
                      {set.error && (
                        <p className="text-xs text-red-400">{set.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Test button for individual sets */}
                  <Button
                    onClick={async () => {
                      const supabase = getSupabaseAdminClient();
                      const { data: setData } = await supabase
                        .from('sets')
                        .select('id, title, audio_url')
                        .eq('id', set.id)
                        .single();
                      
                      if (setData) {
                        await testSingleSet(setData);
                      }
                    }}
                    disabled={set.status === 'processing' || isProcessing}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveformGenerator;
