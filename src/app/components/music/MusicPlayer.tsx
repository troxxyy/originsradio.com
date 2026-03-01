'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, VolumeX, Volume2 } from 'lucide-react';
import { useCurrentRadioSlot } from '@/hooks/use-radio';
import { useSets } from '@/hooks/use-supabase';
import { buildProxiedUrl } from '@/lib/audioProxy';
import { useAudioVisualizer } from '@/contexts/AudioVisualizerContext';

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { registerAudioElement, setGlobalVolume } = useAudioVisualizer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { currentSlot, isLoading: isScheduleLoading } = useCurrentRadioSlot(5000);
  const { data: sets, isLoading: isSetsLoading } = useSets();
  const pathname = usePathname();
  const latestSet = sets && sets.length > 0 ? sets[0] : null;
  const [onDemandSetUrl, setOnDemandSetUrl] = useState<string | undefined>(undefined);
  const [onDemandTitle, setOnDemandTitle] = useState<string>('');
  const [onDemandArtist, setOnDemandArtist] = useState<string>('');
  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  // Check for both streamUrl (direct stream) and set.audio_url (scheduled set)
  // Prioritize streamUrl over set.audio_url for live streams
  const scheduledUrl = currentSlot?.item
    ? ((currentSlot.item.streamUrl && currentSlot.item.streamUrl.trim()) || (currentSlot.item as any).set?.audio_url)
    : undefined;
  // Live mode logic:
  // 1. Must NOT be in "on demand" override mode
  // 2. Must have a valid scheduled URL from current slot (either streamUrl or set.audio_url)
  // 3. Require active slot and schedule loaded
  const isLive = !onDemandSetUrl && !!scheduledUrl && !isScheduleLoading && !!currentSlot?.isLiveStream;
  const rawStreamUrl = onDemandSetUrl || scheduledUrl;
  // Proxy all URLs through the audio proxy
  const streamUrl = rawStreamUrl ? buildProxiedUrl(rawStreamUrl) : undefined;
  const setDurationSeconds = onDemandSetUrl
    ? (latestSet as any)?.duration ?? undefined
    : ((currentSlot?.item as any)?.set?.duration ?? undefined);
  const startOffsetSeconds = onDemandSetUrl ? 0 : (currentSlot?.secondsSinceStart ?? 0);
  const nowTitle = onDemandSetUrl ? onDemandTitle : (currentSlot?.item?.title ?? 'Radio');
  const nowArtist = onDemandSetUrl ? onDemandArtist : ((currentSlot?.item as any)?.set?.artists?.name ?? 'Origins Radio');
  const nowDate = onDemandSetUrl
    ? formatDate((latestSet as any)?.release_date)
    : (currentSlot?.startedAtUtc ? formatDate(currentSlot.startedAtUtc.toISOString()) : '');
  const isPlayDisabled = isAudioLoading || !streamUrl;

  const artistSlug = useMemo(() => {
    // Keep slug logic consistent with the rest of the app (see `generateSlug` in `supabase-utils.ts`)
    const name = (nowArtist || '').trim()
    if (!name || name.toLowerCase() === 'origins radio') return null
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, '')
      .replace(/\s+/g, '')
      .trim() || null
  }, [nowArtist]);

  // Load mute state from localStorage
  useEffect(() => {
    const muted = localStorage.getItem('or_player_muted');
    if (muted === '1') setIsMuted(true);
  }, []);

  // Apply mute state to the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    audio.volume = isMuted ? 0 : 1;

    // Web Audio API custom source bypasses HTMLMediaElement volume/muting, so we apply gain globally
    setGlobalVolume(isMuted ? 0 : 1);
  }, [isMuted, setGlobalVolume]);

  // Register audio element with visualizer context
  useEffect(() => {
    if (audioRef.current) {
      registerAudioElement(audioRef.current);
    }
  }, [registerAudioElement]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // No pause UX: if already playing, toggle mute immediately
    if (isPlaying) {
      toggleMute();
    } else {
      try {
        setIsAudioLoading(true);
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Playback toggle error', e);
      } finally {
        setIsAudioLoading(false);
      }
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    // Always use React state as source of truth, not audio.muted
    const next = !isMuted;
    // Some browsers can get "stuck" silent if volume is 0; keep both in sync.
    if (audio) {
      audio.muted = next;
      audio.volume = next ? 0 : 1;
    }
    setIsMuted(next);
    localStorage.setItem('or_player_muted', next ? '1' : '0');
  };

  // Apply source and initial position when the URL or slot changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    let cancelled = false;

    const setup = async () => {
      try {
        if (audio.src !== streamUrl) {
          audio.crossOrigin = 'anonymous';
          audio.src = streamUrl;
          audio.load();
        }

        await new Promise<void>((resolve) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            resolve();
          };
          audio.addEventListener('canplay', onCanPlay, { once: true });
          // Fallback
          setTimeout(() => resolve(), 1500);
        });

        if (!cancelled) {
          if (isLive) {
            // Initial setup for live
            const dur = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : (setDurationSeconds ?? 0);
            const seekTime = dur > 0 ? (startOffsetSeconds % dur) : 0;
            audio.currentTime = seekTime;
            audio.play().then(() => {
              setIsPlaying(true);
              console.log('[MusicPlayer] Live stream started:', streamUrl);
            }).catch((err) => {
              console.warn('[MusicPlayer] Auto-play failed (may require user interaction):', err);
            });
          } else {
            // On-demand playback
            const dur = isFinite(audio.duration) ? audio.duration : (setDurationSeconds ?? undefined);
            const clamped = dur ? Math.min(Math.max(0, startOffsetSeconds), Math.max(0, dur - 1)) : Math.max(0, startOffsetSeconds);
            audio.currentTime = clamped;
          }
        }
      } catch (e) {
        console.error('[MusicPlayer] Setup error:', e);
      }
    };

    setup();
    return () => { cancelled = true; };
  }, [streamUrl, isLive, startOffsetSeconds, setDurationSeconds]); // Re-run setup when URL, live status, or timing changes

  // Effect to handle time sync without reloading audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isLive || !streamUrl) return;

    const dur = (isFinite(audio.duration) && audio.duration > 0) ? audio.duration : (setDurationSeconds ?? 0);
    const seekTime = dur > 0 ? (startOffsetSeconds % dur) : 0;

    // Sync time if drifted
    if (Math.abs(audio.currentTime - seekTime) > 4) {
      audio.currentTime = seekTime;
    }

    // Ensure playing if live
    if (audio.paused && !isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => { });
    }
  }, [isLive, startOffsetSeconds, setDurationSeconds, streamUrl, isPlaying]);

  // Attach media event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (isLive) {
        // For live, loop back to start
        audio.currentTime = 0;
        audio.play().catch(() => { });
      } else {
        setIsPlaying(false);
      }
    };
    const onError = () => setIsAudioLoading(false);
    const onWaiting = () => setIsAudioLoading(true);
    const onCanPlay = () => setIsAudioLoading(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [isLive, currentSlot]);

  // Do not auto-select latest set; require explicit user action when off-air

  return (
    <>
      {/* Floating Mini Player */}
      <div className="fixed left-0 right-0 bottom-2 sm:bottom-4 md:bottom-10 z-[200] flex justify-center pointer-events-auto px-2 sm:px-4 pb-[calc(env(safe-area-inset-bottom)+4px)] sm:pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <div className="w-full sm:w-[768px] max-w-full">
          <div className="relative glass rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] bg-white/[0.03] border-white/5">
            {/* Offline fallback content inside music bar */}
            {!streamUrl && !isScheduleLoading ? (
              <div className="h-12 sm:h-14 md:h-16 px-3 sm:px-4 md:px-6 grid items-center grid-cols-[auto_minmax(0,1fr)_auto] gap-2 sm:gap-4 w-full">
                {/* Left: Not Live Badge */}
                <div className="flex items-center justify-start flex-shrink-0 w-[60px] sm:w-[80px]">
                  <div className="flex items-center gap-1 bg-transparent border border-white/20 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                    <span className="text-white/60 text-[9px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Not Live</span>
                  </div>
                </div>

                {/* Center: Latest Set Info - minmax(0, 1fr) ensures it truncates instead of pushing out grid boundaries */}
                <div className="flex flex-col items-center justify-center text-center w-full min-w-0 px-2 overflow-hidden">
                  {latestSet ? (
                    <>
                      <div className="text-white/90 text-[10px] sm:text-xs md:text-sm truncate w-full pointer-events-auto leading-tight">
                        {(latestSet as any).title || 'Latest Set'}
                      </div>
                      <div className="text-white/60 text-[9px] sm:text-[10px] md:text-xs truncate w-full pointer-events-auto leading-tight">
                        {(latestSet as any).artists?.name || 'Origins Radio'}
                      </div>
                    </>
                  ) : (
                    <div className="text-white/60 text-[10px] sm:text-xs truncate w-full pointer-events-auto leading-tight">No sets available</div>
                  )}
                </div>

                {/* Right: Play Button */}
                <div className="flex items-center justify-end flex-shrink-0 w-[60px] sm:w-[80px]">
                  <button
                    disabled={!latestSet || isSetsLoading}
                    onClick={async () => {
                      if (!latestSet) return;
                      setOnDemandSetUrl(latestSet.audio_url);
                      setOnDemandTitle((latestSet as any).title || 'Latest Set');
                      const artistName = (latestSet as any).artists?.name || 'Origins Radio';
                      setOnDemandArtist(artistName);
                      setTimeout(async () => {
                        const audio = audioRef.current;
                        if (!audio) return;
                        try {
                          await audio.play();
                          setIsPlaying(true);
                        } catch (e) {
                          // eslint-disable-next-line no-console
                          console.error('Failed to start latest set', e);
                        }
                      }, 0);
                    }}
                    className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/15 border border-white/10 flex items-center justify-center shadow-md disabled:opacity-50 touch-manipulation flex-shrink-0"
                    aria-label="Play latest set"
                  >
                    {isSetsLoading ? (
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play size={16} className="sm:w-[18px] sm:h-[18px] text-white ml-0.5 flex-shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-12 sm:h-14 md:h-16 px-3 sm:px-4 md:px-6 grid items-center grid-cols-[auto_minmax(0,1fr)_auto] gap-2 sm:gap-4 w-full">
                {/* Left: Live Badge */}
                <div className="flex items-center justify-start flex-shrink-0 w-[60px] sm:w-[80px]">
                  {isLive ? (
                    <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                      <span className="text-green-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Live</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-transparent border border-white/20 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                      <span className="text-white/60 text-[9px] sm:text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Not Live</span>
                    </div>
                  )}
                </div>

                {/* Center: Title + Artist */}
                <div className="flex flex-col items-center justify-center text-center w-full min-w-0 px-2 overflow-hidden">
                  {artistSlug ? (
                    <Link
                      href={`/artists/${artistSlug}`}
                      className="text-white/90 text-[10px] sm:text-xs md:text-sm block truncate w-full hover:text-white underline-offset-4 hover:underline pointer-events-auto leading-tight"
                      title={`Go to ${nowArtist} profile`}
                    >
                      {nowArtist}
                    </Link>
                  ) : (
                    <div className="text-white/90 text-[10px] sm:text-xs md:text-sm truncate w-full pointer-events-auto leading-tight">
                      {nowArtist}
                    </div>
                  )}
                </div>

                {/* Right: Play (starts audio) / Mute (while playing) */}
                <div className="flex items-center justify-end flex-shrink-0 w-[60px] sm:w-[80px]">
                  <button
                    onClick={togglePlayPause}
                    disabled={isPlayDisabled}
                    className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/15 border border-white/10 flex items-center justify-center shadow-md disabled:opacity-50 touch-manipulation flex-shrink-0"
                    aria-label={isPlaying ? (isMuted ? "Unmute" : "Mute") : "Play"}
                    title={!streamUrl ? 'Go live or select a set to play' : undefined}
                  >
                    {isAudioLoading ? (
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : isPlaying ? (
                      isMuted ? (
                        <VolumeX size={16} className="sm:w-[18px] sm:h-[18px] text-white shrink-0" />
                      ) : (
                        <Volume2 size={16} className="sm:w-[18px] sm:h-[18px] text-white shrink-0" />
                      )
                    ) : (
                      <Play size={16} className="sm:w-[18px] sm:h-[18px] text-white ml-0.5 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
    </>
  );
};

export default MusicPlayer;