import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Play, Pause, X, Radio } from 'lucide-react';
import { useCurrentRadioSlot } from '@/hooks/use-radio';
import { useSets } from '@/hooks/use-supabase';
import { buildProxiedUrl } from '@/lib/audioProxy';

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFloatingHidden, setIsFloatingHidden] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
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

  const scheduledUrl = (currentSlot?.item && (currentSlot.item as any).set?.audio_url) ?? undefined;
  const isLive = false;
  const rawStreamUrl = onDemandSetUrl || scheduledUrl;
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

  // #region agent log - debug instrumentation
  const __orLog = (hypothesisId: string, location: string, message: string, data?: Record<string, unknown>) => {
    try {
      fetch("http://127.0.0.1:7242/ingest/d566a5c0-ce65-4742-a027-2a70ece3fc46", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "run1",
          hypothesisId,
          location,
          message,
          data,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    } catch {}
  };

  const __safeUrlInfo = (url?: string) => {
    if (!url) return null;
    try {
      const u = new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost");
      const parts = u.pathname.split("/").filter(Boolean);
      return { origin: u.origin, pathEnd: parts.slice(-2).join("/") || u.pathname };
    } catch {
      return { origin: null, pathEnd: String(url).slice(0, 60) };
    }
  };
  // #endregion agent log

  // Load hidden state from localStorage
  useEffect(() => {
    const hidden = localStorage.getItem('or_player_hidden');
    if (hidden === '1') setIsFloatingHidden(true);
  }, []);

  // #region agent log - debug instrumentation
  useEffect(() => {
    __orLog("C", "src/app/components/music/MusicPlayer.tsx:useEffect(mount)", "MusicPlayer mounted", {
      pathname,
    });
    return () => {
      __orLog("C", "src/app/components/music/MusicPlayer.tsx:useEffect(unmount)", "MusicPlayer unmounted", {
        pathname,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    __orLog("C", "src/app/components/music/MusicPlayer.tsx:pathname", "Route changed while MusicPlayer mounted", {
      pathname,
      isPlaying,
      audioPaused: audio ? audio.paused : null,
      audioTime: audio && Number.isFinite(audio.currentTime) ? Math.round(audio.currentTime * 1000) / 1000 : null,
      audioSrc: audio ? __safeUrlInfo(audio.currentSrc || audio.src) : null,
    });
  }, [pathname]); // intentionally only on route change
  // #endregion agent log

  const hideFloating = () => {
    setIsFloatingHidden(true);
    localStorage.setItem('or_player_hidden', '1');
  };

  const unhideFloating = () => {
    setIsFloatingHidden(false);
    localStorage.removeItem('or_player_hidden');
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsAudioLoading(true);
        await audio.play();
        setIsPlaying(true);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Playback toggle error', e);
    } finally {
      setIsAudioLoading(false);
    }
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
          if (!isLive) {
            const dur = isFinite(audio.duration) ? audio.duration : (setDurationSeconds ?? undefined);
            const clamped = dur ? Math.min(Math.max(0, startOffsetSeconds), Math.max(0, dur - 1)) : Math.max(0, startOffsetSeconds);
            audio.currentTime = clamped;
          }
          // Streams removed; seeking is always allowed within set
        }
      } catch (e) {
        // no-op
      }
    };

    setup();
    return () => { cancelled = true; };
  }, [streamUrl, isLive, startOffsetSeconds, setDurationSeconds]);

  // Attach media event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (isLive) {
        // For live, try to restart
        audio.play().catch(() => {});
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

  // #region agent log - debug instrumentation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlayDbg = () => {
      __orLog("C", "src/app/components/music/MusicPlayer.tsx:audio(play)", "Audio play event", {
        pathname,
        src: __safeUrlInfo(audio.currentSrc || audio.src),
      });
    };
    const onPauseDbg = () => {
      __orLog("C", "src/app/components/music/MusicPlayer.tsx:audio(pause)", "Audio pause event", {
        pathname,
        src: __safeUrlInfo(audio.currentSrc || audio.src),
      });
    };
    audio.addEventListener("play", onPlayDbg);
    audio.addEventListener("pause", onPauseDbg);
    return () => {
      audio.removeEventListener("play", onPlayDbg);
      audio.removeEventListener("pause", onPauseDbg);
    };
  }, [pathname]);
  // #endregion agent log

  // Do not auto-select latest set; require explicit user action when off-air

  return (
    <>
      {/* Floating Mini Player */}
      {!isFloatingHidden && (
        <div className="fixed left-0 right-0 bottom-4 sm:bottom-10 z-[200] flex justify-center pointer-events-auto pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="w-[100%] sm:w-[768px] max-w-[100%]">
            <div className="relative glass rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] h-14 sm:h-16 px-4 sm:px-6 grid items-center grid-cols-[1fr_auto_1fr] bg-white/[0.03] border-white/5">
              {/* Left: Title + Artist + Live Badge */}
              <div className="flex items-center gap-2 min-w-0 justify-self-start">
                {isLive ? (
                  <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/50 rounded-full px-2 py-1 flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-transparent border border-red-400/40 rounded-full px-2 py-1 flex-shrink-0">
                    <span className="text-red-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">Not Live</span>
                  </div>
                )}
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-white/90 text-sm sm:text-base truncate max-w-[46vw] sm:max-w-[340px]">
                    {nowArtist}
                  </span>
                  {nowDate && (
                    <span className="text-white/40 text-[10px] sm:text-xs truncate max-w-[46vw] sm:max-w-[340px]">
                      {nowDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Center: Play/Pause */}
              <div className="flex items-center justify-center justify-self-center">
                <button
                  onClick={togglePlayPause}
                  disabled={isPlayDisabled}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center shadow-md disabled:opacity-50"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={!streamUrl ? 'Go live or select a set to play' : undefined}
                >
                  {isAudioLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={18} className="text-white" />
                  ) : (
                    <Play size={18} className="text-white ml-0.5" />
                  )}
                </button>
              </div>

              {/* Right: Hide */}
              <div className="flex items-center justify-end justify-self-end">
                <button
                  onClick={hideFloating}
                  className="ml-2 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center"
                  aria-label="Hide player"
                  title="Hide player"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unhide Button */}
      {isFloatingHidden && (
        <div className="fixed left-0 right-0 bottom-10 z-[200] flex justify-center pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <button
            onClick={unhideFloating}
            className="w-14 h-14 rounded-full glass bg-white/[0.03] border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-white/10 transition-all duration-300 flex items-center justify-center group"
            aria-label="Show music player"
            title="Show music player"
          >
            <Radio size={20} className="text-white group-hover:text-white/90 transition-colors" />
          </button>
        </div>
      )}

      {/* Offline fallback: Not live with latest set option */}
      {!isFloatingHidden && !streamUrl && !isScheduleLoading && (
        <div className="fixed left-0 right-0 bottom-28 z-[190] flex justify-center pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl glass bg-white/[0.03] border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] max-w-[92%] sm:max-w-md">
            <div className="text-red-400 text-sm font-semibold uppercase tracking-wide">Not Live</div>
            <div className="text-white/80 text-center text-sm">
              We’re off-air. You can play the latest uploaded set:
            </div>
            {latestSet ? (
              <div className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white/90 text-sm truncate">{(latestSet as any).title || 'Latest Set'}</div>
                <div className="text-white/60 text-xs truncate">{(latestSet as any).artists?.name || 'Origins Radio'}</div>
                <div className="text-white/40 text-[10px] mt-1">{formatDate((latestSet as any).release_date)}</div>
              </div>
            ) : (
              <div className="text-white/60 text-sm">No sets available</div>
            )}
            <button
              disabled={!latestSet || isSetsLoading}
              onClick={async () => {
                if (!latestSet) return;
                setOnDemandSetUrl(latestSet.audio_url);
                setOnDemandTitle((latestSet as any).title || 'Latest Set');
                // artists may be joined; fall back to 'Origins Radio'
                const artistName = (latestSet as any).artists?.name || 'Origins Radio';
                setOnDemandArtist(artistName);
                // Small delay to ensure audio element binds new src
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
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 disabled:opacity-50"
            >
              {isSetsLoading ? 'Loading latest set…' : latestSet ? 'Play latest set' : 'No sets available'}
            </button>
          </div>
        </div>
      )}

      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
    </>
  );
};

export default MusicPlayer;