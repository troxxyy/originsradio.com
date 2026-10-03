'use client';

import { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '@/lib/media-url';
import { compactWaveformPeaks, compactWaveformUrl } from '@/lib/waveform-peaks';

export interface WaveformPreviewProps {
  audioUrl: string;
  className?: string;
  height?: number;
  barWidth?: number;
  barRadius?: number;
  peaksUrl?: string;
  progress?: number;
  onSeek?: (percentage: number) => void;
  interactive?: boolean;
  variant?: 'framed' | 'transparent';
}

// The parent owns playback. Previews read peaks, never the entire recording.
export default function WaveformPreview({ audioUrl, className, height = 64, barWidth = 2, barRadius = 2, peaksUrl, progress = 0, onSeek, interactive = false, variant = 'framed' }: WaveformPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<{ source: string; peaks: number[] | null; error: boolean } | null>(null);
  const source = resolveMediaUrl(peaksUrl || '');
  const current = result?.source === source ? result : null;
  const peaks = current?.peaks;
  const percentage = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    const cacheKey = `wf:compact-v1:${source || audioUrl}`;
    const timer = setTimeout(() => controller.abort(), 15000);
    let cancelled = false;
    const load = async () => {
      try {
        let compact: number[] | null = null;
        try { const cached = localStorage.getItem(cacheKey); if (cached) compact = compactWaveformPeaks(JSON.parse(cached)); } catch { /* Optional cache. */ }
        if (!compact) {
          if (!source) throw new Error('No waveform data');
          for (const url of [...new Set([compactWaveformUrl(source), source])]) {
            const response = await fetch(url, { cache: 'force-cache', signal: controller.signal });
            if (response.ok) compact = compactWaveformPeaks(await response.json());
            if (compact) break;
          }
          if (!compact) throw new Error('Waveform unavailable');
          try { localStorage.setItem(cacheKey, JSON.stringify(compact)); } catch { /* Storage is optional. */ }
        }
        if (!cancelled) setResult({ source, peaks: compact, error: false });
      } catch { if (!cancelled) setResult({ source, peaks: null, error: true }); }
      finally { clearTimeout(timer); }
    };
    void load();
    return () => { cancelled = true; controller.abort(); clearTimeout(timer); };
  }, [visible, source, audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current, container = containerRef.current;
    if (!canvas || !container || !peaks) return;
    const draw = () => {
      const width = container.clientWidth;
      if (!width) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.scale(ratio, ratio);
      const step = Math.max(1, barWidth) + 1, bars = Math.max(1, Math.floor(width / step));
      const maximum = Math.max(...peaks, 0.001);
      for (let bar = 0; bar < bars; bar++) {
        const from = Math.floor(bar * peaks.length / bars), to = Math.max(from + 1, Math.floor((bar + 1) * peaks.length / bars));
        let amplitude = 0;
        for (let i = from; i < Math.min(to, peaks.length); i++) amplitude = Math.max(amplitude, peaks[i]);
        const barHeight = Math.max(2, amplitude / maximum * (height - 2));
        ctx.fillStyle = bar * step < width * percentage / 100 ? '#e5e7eb' : '#3b3b3b';
        ctx.beginPath();
        ctx.roundRect(bar * step, (height - barHeight) / 2, Math.max(1, barWidth), barHeight, Math.min(barRadius, barHeight / 2, barWidth / 2)); ctx.fill();
      }
    };
    draw(); const observer = new ResizeObserver(draw); observer.observe(container);
    return () => observer.disconnect();
  }, [peaks, percentage, height, barWidth, barRadius]);

  const canSeek = interactive && !!onSeek;
  return <div className={className} data-waveform-state={peaks ? 'ready' : current?.error ? 'unavailable' : 'loading'}>
    <div className="relative">
      <div ref={containerRef} className={`w-full rounded-md overflow-hidden ${variant === 'framed' ? 'bg-black/50 border border-white/10' : 'bg-transparent'} ${canSeek ? 'cursor-pointer' : ''}`} style={{ height }}
        role={canSeek ? 'slider' : undefined} tabIndex={canSeek ? 0 : undefined} aria-label={canSeek ? 'Seek in DJ set' : undefined} aria-valuemin={canSeek ? 0 : undefined} aria-valuemax={canSeek ? 100 : undefined} aria-valuenow={canSeek ? percentage : undefined}
        onClick={event => { if (!canSeek) return; const rect = event.currentTarget.getBoundingClientRect(); if (rect.width) onSeek?.(Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))); }}
        onKeyDown={event => {
          if (!canSeek) return;
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? 100 : event.key === 'ArrowLeft' ? percentage - 5 : event.key === 'ArrowRight' ? percentage + 5 : null;
          if (next !== null) { event.preventDefault(); onSeek?.(Math.max(0, Math.min(100, next))); }
        }}>
        <canvas ref={canvasRef} aria-hidden="true" className="block w-full h-full" />
      </div>
      {peaks && <><div className="absolute inset-y-0 left-0 bg-white/15 pointer-events-none" style={{ width: `${percentage}%` }} /><div className="absolute top-0 h-full w-0.5 bg-white/80 pointer-events-none" style={{ left: `${percentage}%` }} /></>}
    </div>
    {!peaks && !current?.error && <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/3 bg-white/30 rounded-full animate-pulse" /></div>}
    {current?.error && <div className="mt-1 text-xs text-white/50">Waveform unavailable</div>}
  </div>;
}
