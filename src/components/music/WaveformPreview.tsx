import { useEffect, useRef, useState, useCallback } from 'react';
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
  variant?: 'framed' | 'transparent';
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
    variant = 'framed',
}: WaveformPreviewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const onSeekRef = useRef(onSeek);
  const seekTimeoutRef = useRef<NodeJS.Timeout>();
  const clickCleanupRef = useRef<(() => void) | null>(null);
  
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

      // Build options - fix waveform display and interaction
      const baseOptions = {
        container: containerRef.current,
        url: audioUrl,
        height,
        normalize: true,
        barWidth,
        barGap: 1,
        barRadius,
         waveColor: '#3b3b3b',
         progressColor: '#e5e7eb',
        cursorColor: interactive ? 'rgba(255, 255, 255, 0.6)' : 'transparent',
        interact: interactive,
        autoCenter: false,
        // Remove minPxPerSec to let it auto-fit the container width
        autoScroll: false,
        hideScrollbar: true,
        fillParent: true,
        // Ensure the waveform fills the entire container width
        responsive: true,
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
          
          // Debug container size
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            console.log(`📏 WaveformPreview ready: ${rect.width}x${rect.height}px, duration=${ws.getDuration?.()?.toFixed(2)}s`);
          }
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

      // Add optimized click handler for seeking if interactive
      if (interactive && onSeekRef.current) {
        const handleSeek = (relativeX: number) => {
          const percentage = Math.max(0, Math.min(100, relativeX * 100));
          console.log(`🖱️ WaveformPreview click: relativeX=${relativeX.toFixed(3)}, percentage=${percentage.toFixed(2)}%`);
          
          if (seekTimeoutRef.current) {
            clearTimeout(seekTimeoutRef.current);
          }
          
          // Immediate seeking, no debounce delay for direct clicks
          onSeekRef.current?.(percentage);
        };
        
        ws.on('click', handleSeek);
        
        // Backup manual click handler in case WaveSurfer's click detection fails
        const manualClickHandler = (e: MouseEvent) => {
          if (!containerRef.current) return;
          
          const rect = containerRef.current.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const relativeX = Math.max(0, Math.min(1, clickX / rect.width));
          const percentage = relativeX * 100;
          
          console.log(`🖱️ Manual click: x=${clickX.toFixed(1)}px of ${rect.width.toFixed(1)}px, relativeX=${relativeX.toFixed(3)}, percentage=${percentage.toFixed(2)}%`);
          
          if (seekTimeoutRef.current) {
            clearTimeout(seekTimeoutRef.current);
          }
          
          onSeekRef.current?.(percentage);
        };
        
        containerRef.current.addEventListener('click', manualClickHandler);
        
        // Store cleanup function
        clickCleanupRef.current = () => {
          if (containerRef.current) {
            containerRef.current.removeEventListener('click', manualClickHandler);
          }
        };
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
      
      // Clear any pending seek timeout
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
      
      // Clean up manual click handler
      if (clickCleanupRef.current) {
        clickCleanupRef.current();
        clickCleanupRef.current = null;
      }
      
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
          className={`w-full rounded-md overflow-hidden ${
            variant === 'framed' ? 'bg-black/50 border border-white/10' : 'bg-transparent'
          } ${interactive && isReady ? 'cursor-pointer' : ''}`}
          style={{ height: `${height}px` }}
        />
        
        {/* Filled progress overlay */}
        {isReady && (
          <>
            <div
              className="absolute inset-y-0 left-0 bg-white/15 pointer-events-none"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-white/80 pointer-events-none"
              style={{ left: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </>
        )}
      </div>
      
      {/* Simplified status indicators */}
      {!isReady && !error && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 bg-white/30 rounded-full animate-pulse" />
        </div>
      )}
      {error && (
        <div className="mt-1 text-xs text-red-400/70">Failed to load</div>
      )}
    </div>
  );
};

export default WaveformPreview;
