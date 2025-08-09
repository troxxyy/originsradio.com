import { useEffect, useRef, useState } from 'react';
import WaveSurfer, { WaveSurferOptions } from 'wavesurfer.js';
import { getSupabaseClient } from '@/lib/supabase';

export interface WaveformPreviewProps {
  audioUrl: string;
  className?: string;
  height?: number;
  barWidth?: number;
  barRadius?: number;
  peaksUrl?: string; // direct JSON URL if available
  progress?: number; // progress percentage (0-100) for overlay
  onSeek?: (percentage: number) => void; // callback for seeking
  interactive?: boolean; // whether the waveform should be interactive
}

// Lightweight, non-interactive SoundCloud-like waveform preview.
// Attempts to fetch precomputed peaks from Supabase Storage first for instant render,
// then falls back to client decoding if peaks are unavailable.
const WaveformPreview = ({
  audioUrl,
  className,
  height = 64,
  barWidth = 2,
  barRadius = 2,
  peaksUrl,
  progress = 0,
  onSeek,
  interactive = false,
}: WaveformPreviewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const onSeekRef = useRef(onSeek);
  
  // Update ref when onSeek changes
  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);
  const [isReady, setIsReady] = useState(false);
  const [hadPeaks, setHadPeaks] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [canInit, setCanInit] = useState(false);

  // Lazy-init when visible to speed up first paint
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setCanInit(true);
          observer.disconnect();
          break;
        }
      }
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const initWaveform = async () => {
      if (!containerRef.current) return;
      if (!canInit) return;

      // 1) Try localStorage cache first (zero network)
      let peaks: number[] | undefined;
      const cacheKey = `wf:${peaksUrl || audioUrl}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            peaks = parsed as number[];
            setHadPeaks(true);
          } else if (Array.isArray(parsed?.peaks)) {
            peaks = parsed.peaks as number[];
            setHadPeaks(true);
          }
        }
      } catch {}

      // 2) If not cached, prefer direct peaksUrl (tiny JSON)
      if (!peaks && peaksUrl) {
        try {
          console.log(`🔍 WaveformPreview: Fetching peaks from ${peaksUrl}`);
          const res = await fetch(peaksUrl, { cache: 'force-cache' });
          if (res.ok) {
            const data = await res.json();
            console.log(`📊 WaveformPreview: Received peaks data:`, data);
            if (Array.isArray(data?.peaks)) {
              peaks = data.peaks as number[];
              setHadPeaks(true);
              console.log(`✅ WaveformPreview: Loaded ${peaks.length} peaks from data.peaks`);
              try { localStorage.setItem(cacheKey, JSON.stringify(peaks)); } catch {}
            } else if (Array.isArray(data)) {
              peaks = data as number[];
              setHadPeaks(true);
              console.log(`✅ WaveformPreview: Loaded ${peaks.length} peaks from data array`);
              try { localStorage.setItem(cacheKey, JSON.stringify(peaks)); } catch {}
            }
          } else {
            console.warn(`⚠️ WaveformPreview: Failed to fetch peaks, status: ${res.status}`);
          }
        } catch (err) {
          console.error(`❌ WaveformPreview: Error fetching peaks:`, err);
        }
      }

      if (!peaks) setHadPeaks(false);

      // Build options
      const baseOptions = {
        container: containerRef.current,
        url: audioUrl,
        height,
        normalize: true,
        barWidth,
        barGap: Math.max(1, Math.floor(barWidth / 2)),
        barRadius,
        waveColor: '#6b7280', // gray-500
        progressColor: 'transparent', // We'll use our own progress overlay
        cursorColor: interactive ? '#ffffff' : 'transparent',
        interact: interactive,
        autoCenter: true,
        minPxPerSec: 25, // Optimized for 1-hour sets with 4000-6000 peaks
        autoScroll: false
      };

      // Add peaks only if available to avoid type issues
      const options = peaks && peaks.length > 0 
        ? { ...baseOptions, peaks: [peaks] } // WaveSurfer expects an array of channel data
        : baseOptions;

      const ws = WaveSurfer.create(options);
      wavesurferRef.current = ws;

      ws.on('ready', async () => {
        if (!isCancelled) {
          setIsReady(true);
          setError(null);
        }
        // If we had to decode client-side (no peaks), cache the computed peaks for next time
        try {
          if (!isCancelled && hadPeaks === false) {
            const anyWs = ws as unknown as { 
              getDecodedData?: () => Float32Array | number[]; 
              exportPCM?: (length?: number, accuracy?: number, noWindow?: boolean) => Float32Array | number[] 
            };
            // Try to get decoded data for caching
            const decoded = anyWs.getDecodedData?.() ?? anyWs.exportPCM?.(2000, 1000, true);
            if (decoded && (decoded as any).length > 0) {
              try { 
                localStorage.setItem(cacheKey, JSON.stringify(Array.from(decoded as any))); 
                console.log(`✓ Cached ${decoded.length} peaks for ${audioUrl.split('/').pop()}`);
              } catch (e) {
                console.warn('Failed to cache peaks:', e);
              }
            }
          }
        } catch (e) {
          console.warn('Error processing decoded data:', e);
        }
      });

      // Add click handler for seeking if interactive
      if (interactive && onSeekRef.current) {
        ws.on('click', (relativeX) => {
          // relativeX is between 0 and 1
          const percentage = relativeX * 100;
          onSeekRef.current?.(percentage);
        });
      }
      
      ws.on('error', (err) => {
        if (!isCancelled) {
          setIsReady(true);
          setError('Failed to load audio');
          console.error('WaveSurfer error:', err);
        }
      });

      ws.on('loading', (percent) => {
        // Could add loading percentage if needed
      });
    };

    initWaveform();

    return () => {
      isCancelled = true;
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (_) {
          // no-op
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl, height, barWidth, barRadius, peaksUrl, canInit, interactive]);

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={containerRef}
          className={`w-full rounded-md overflow-hidden border border-white/10 bg-gradient-to-b from-black/40 to-black/20 ${
            onSeek && isReady ? 'cursor-pointer' : ''
          }`}
          style={{ height: `${height}px` }}
        />
        
        {/* Progress overlay */}
        {isReady && progress > 0 && (
          <>
            {/* Progress fill indicator */}
            <div
              className="absolute top-0 left-0 h-full bg-white/10 transition-all duration-150 rounded-md pointer-events-none z-10"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
            
            {/* Progress line */}
            <div
              className="absolute top-0 h-full w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-150 pointer-events-none z-10"
              style={{ left: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </>
        )}
      </div>
      
      {!isReady && !error && (
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
          aria-hidden="true"
        >
          <div className="h-full w-1/3 animate-pulse rounded-full bg-white/30" />
        </div>
      )}
      {error && (
        <div className="mt-2 text-xs text-red-400">⚠️ {error}</div>
      )}
      {isReady && hadPeaks === false && !error && (
        <div className="mt-2 text-xs text-yellow-400">⚡ Computing waveform...</div>
      )}
      {isReady && hadPeaks === true && !error && (
        <div className="mt-2 text-xs text-green-400">✓ Precomputed waveform</div>
      )}
    </div>
  );
};

export default WaveformPreview;
