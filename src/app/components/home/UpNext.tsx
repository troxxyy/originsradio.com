import { useRef, useState, useEffect } from 'react';
import { useSets } from '../../hooks/use-supabase';
import { generateSlug } from '../../lib/supabase-utils';
import { useIsMobile } from '../../hooks/use-mobile';
import { Play, Pause } from 'lucide-react';

// Add custom CSS for enhanced animations
const customStyles = `
  @keyframes playing-glow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }
    50% { 
      box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
      transform: scale(1.08);
    }
  }
  
  @keyframes text-glow {
    0%, 100% { 
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }
    50% { 
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
    }
  }
  
  .upnext-playing-animation {
    animation: playing-glow 2s ease-in-out infinite;
  }
  
  .upnext-text-glow-animation {
    animation: text-glow 2s ease-in-out infinite;
  }
`;

// Types
interface UpNextEvent {
  title: string;
  artist: string;
  date: string;
  delay?: string;
  audioSrc: string;
  artistPhoto?: string;
  setNumber?: number;
  artistSlug?: string;
  artistLocation?: string;
}

interface UpNextItemProps {
  event: UpNextEvent;
  index: number;
  onPlay: (index: number) => void;
  onSeek: (percentage: number) => void;
  isPlaying: boolean;
  progress: number;
}

interface ProgressBarProps {
  progress: number;
  onSeek: (percentage: number) => void;
  className?: string;
  thumbSize?: string;
}

// Progress Bar Component with touch support
export const ProgressBar = ({ progress, onSeek, className = "", thumbSize = "w-3 h-3" }: ProgressBarProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const calculatePercentage = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const calculatePercentageFromTouch = (touch: React.Touch) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    const percentage = calculatePercentage(e.clientX);
    onSeek(percentage);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    const touch = e.touches[0];
    const percentage = calculatePercentageFromTouch(touch);
    onSeek(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const percentage = calculatePercentage(e.clientX);
      onSeek(percentage);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0];
      const percentage = calculatePercentage(touch.clientX);
      onSeek(percentage);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      if (isMobile) {
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
      } else {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    }
    return () => {
      if (isMobile) {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isDragging, isMobile]);

  const mobileThumbSize = isMobile ? "w-4 h-4" : thumbSize;
  const mobileBarHeight = isMobile ? "h-1" : "h-0.5";

  return (
    <div 
      ref={progressBarRef}
      className={`${mobileBarHeight} w-full mx-auto mt-1 bg-white/50 relative overflow-visible rounded-full cursor-pointer select-none touch-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#383838] to-[#d1d1d1] transition-all duration-100 progress-bar-fill"
        style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
      />
      <div 
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)] ${mobileThumbSize} progress-thumb`}
        style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
      />
    </div>
  );
};

// UpNext Item Component with mobile optimizations
export const UpNextItem = ({ event, index, onPlay, onSeek, isPlaying, progress }: UpNextItemProps) => {
  const isMobile = useIsMobile();
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPlay(index);
  };

  // Check if artist has a slug to show the view artist link
  const hasArtistSlug = event.artistSlug && event.artist !== 'Unknown Artist';

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`group relative glass bg-white/[0.03] border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors ${
        isPlaying ? 'ring-1 ring-white/20' : 'hover:bg-white/[0.05]'
      }`}
    >
      {/* Header - Art + Info */}
      <div className="flex gap-4 sm:gap- mb-4">
        {/* Artwork with overlayed play */}
        {event.artistPhoto ? (
          <button
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Pause set' : 'Play set'}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 flex-shrink-0"
          >
            <img
              src={event.artistPhoto}
              alt={event.artist}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
              isPlaying ? 'bg-white/70' : 'bg-black/40 hover:bg-black/50'
            }`}>
              {isPlaying ? (
                <Pause className="w-6 h-6 text-black" />
              ) : (
                <Play className="w-6 h-6 text-white ml-0.5" />
              )}
            </div>
          </button>
        ) : (
          <button
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Pause set' : 'Play set'}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-colors border flex-shrink-0 ${
              isPlaying
                ? 'bg-white text-black border-white/80'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
        )}

        {/* Track Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Top Row: Title and Set Number */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-bold text-lg sm:text-xl truncate">
              {event.title}
            </h3>
            {event.setNumber && (
              <span className="text-xs px-2 py-1 bg-white/15 text-white/80 rounded-lg tracking-wide">
                #{event.setNumber}
              </span>
            )}
          </div>

          {/* Artist Name */}
          <div className="mb-2">
            <span className="text-white/90 text-sm sm:text-base font-medium truncate block">
              {event.artist}
            </span>
          </div>

          {/* Bottom Row: Location and Date */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
            {event.artistLocation && (
              <span className="flex items-center gap-1.5 text-xs text-white/60">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.artistLocation}
              </span>
            )}
            
            <span className="text-xs text-white/60">
              {formatDate(event.date)}
            </span>
          </div>
        </div>

        {/* Right Section - View Artist Button */}
        {hasArtistSlug && (
          <div className="flex items-center">
            <a
              href={`/artists/${event.artistSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white/80 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group/link touch-manipulation"
            >
              <span>View Artist</span>
              <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Waveform + timecodes */}
      <div className="mb-1 sm:mb-2">
        <div className="rounded-full glass bg-white/[0.03] border-white/5 p-3 sm:p-4 transition-all duration-500 ease-out group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <ProgressBar progress={progress} onSeek={onSeek} />
        </div>
      </div>
    </div>
  );
};



// Custom Hook for Audio Management
const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [trackProgress, setTrackProgress] = useState<{ [key: number]: number }>({});
  const [audioLoaded, setAudioLoaded] = useState<{ [key: number]: boolean }>({});
  const [isSeeking, setIsSeeking] = useState(false);
  const lastUpdateRef = useRef(0);

  const handlePlay = async (trackIndex: number, audioSrc: string) => {
    // Pause any other audio elements on the page
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
      if (audio !== audioRef.current) {
        audio.pause();
      }
    });

    if (audioRef.current) {
      if (isPlaying && currentTrackIndex === trackIndex) {
        // Pause current track, but do not reset currentTrackIndex
        audioRef.current.pause();
        setIsPlaying(false);
        // setCurrentTrackIndex(null); // <-- Do not reset index
      } else {
        // Play new track or resume current track
        if (currentTrackIndex !== trackIndex) {
          // Load new track
          audioRef.current.src = audioSrc;
          setCurrentTrackIndex(trackIndex);
          // Reset progress for new track
          setTrackProgress(prev => ({ ...prev, [trackIndex]: 0 }));
          // Wait for audio to load
          try {
            await audioRef.current.load();
            setAudioLoaded(prev => ({ ...prev, [trackIndex]: true }));
          } catch (error) {
            return;
          }
        }
        // Resume playback from current position
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          // Audio playback failed silently
        }
      }
    }
  };

  const handleSeek = (percentage: number) => {
    if (
      audioRef.current &&
      currentTrackIndex !== null &&
      audioRef.current.duration &&
      !isNaN(audioRef.current.duration) &&
      audioRef.current.duration > 0
    ) {
      setIsSeeking(true);
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setTrackProgress(prev => ({ ...prev, [currentTrackIndex]: percentage }));
      // Reset seeking flag after a short delay
      setTimeout(() => {
        setIsSeeking(false);
      }, 100);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      // Don't update progress if we're currently seeking
      if (isSeeking || currentTrackIndex === null) return;
      const now = Date.now();
      // Only update every 100ms
      if (now - lastUpdateRef.current >= 100) {
        if (audio.duration && !isNaN(audio.duration)) {
          const currentProgress = (audio.currentTime / audio.duration) * 100;
          setTrackProgress(prev => ({ ...prev, [currentTrackIndex]: currentProgress }));
        }
        lastUpdateRef.current = now;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // setCurrentTrackIndex(null); // <-- Do not reset index on end, let user resume if desired
    };

    const handleError = (e: Event) => {
      setIsPlaying(false);
      // setCurrentTrackIndex(null); // <-- Do not reset index on error
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  return {
    audioRef,
    isPlaying,
    currentTrackIndex,
    trackProgress,
    handlePlay,
    handleSeek
  };
};

// Main Component
type UpNextSectionProps = {
  compact?: boolean;
  maxItems?: number;
  title?: string;
}

const UpNextSection = ({ compact = false, maxItems, title }: UpNextSectionProps) => {
  const isMobile = useIsMobile();
  const [showAll, setShowAll] = useState(false);
  
  const {
    audioRef,
    isPlaying,
    currentTrackIndex,
    trackProgress,
    handlePlay,
    handleSeek
  } = useAudioPlayer();

  // Fetch sets from Supabase
  const { data: sets, isLoading, error } = useSets();

  // Transform Supabase data to match the expected format
  let upcomingEvents: UpNextEvent[] = sets?.map((set, index) => ({
    title: set.title,
    artist: set.artists?.name || 'Unknown Artist',
    date: new Date(set.release_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    delay: `${index * 0.2}s`,
    audioSrc: set.audio_url,
    artistPhoto: set.artists?.photo_url || undefined,
    setNumber: set.set_number,
    artistSlug: set.artists?.name ? generateSlug(set.artists.name) : undefined,
    artistLocation: set.artists?.location || undefined
  })) || [];

  // Sort by setNumber descending (undefined last)
  upcomingEvents = upcomingEvents.slice().sort((a, b) => {
    const aNum = a.setNumber ?? -Infinity;
    const bNum = b.setNumber ?? -Infinity;
    return bNum - aNum;
  });

  const defaultMax = compact ? 2 : 5;
  const limit = typeof maxItems === 'number' ? maxItems : defaultMax;
  const setsToShow = showAll ? upcomingEvents : upcomingEvents.slice(0, limit);

  const handlePlayTrack = (trackIndex: number) => {
    handlePlay(trackIndex, upcomingEvents[trackIndex].audioSrc);
  };

  return (
    <section className={`relative mt-4 sm:mt-4 w-full max-w-7xl mx-auto px-3 sm:px-6 ${compact ? 'py-6' : 'py-12 sm:py-16'}`}>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      {!compact && (
        <>
          <div className="absolute -top-10 -left-20 w-64 h-64 bg-[#363636]/20 rounded-full filter blur-3xl animate-slow-pulse"></div>
          <div className="absolute -bottom-10 -right-20 w-128 h-128 bg-[#787878]/20 rounded-full filter blur-3xl animate-slow-pulse animate-delay-2s"></div>
        </>
      )}
      
      <h1 className={`${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl md:text-5xl'} font-bold mb-2 text-center leading-tight`}>{title || 'Special Sets'}</h1>
      {!compact && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-8 sm:mb-10">
          <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-[#363636] to-[#787878]"></div>
          <p className="text-base sm:text-xl text-center text-white/80 px-2">Pre-recorded Sets Just For Origins Radio</p>
          <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-[#787878] to-[#d1d1d1]"></div>
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
          <p className="text-white/80 mt-4 text-sm sm:text-base">Loading sets...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-red-400 text-sm sm:text-base">Error loading sets: {error.message}</p>
        </div>
      ) : upcomingEvents.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-white/80 text-sm sm:text-base">No sets available at the moment.</p>
          <p className="text-white/60 text-xs sm:text-sm mt-2">Check back soon for new content!</p>
        </div>
      ) : (
        <>
          {/* Regular Sets - responsive grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 ${compact ? 'gap-3' : 'gap-4 md:gap-6'}`}>
            {setsToShow.map((event, index) => (
              <UpNextItem 
                key={index}
                event={event}
                index={index}
                onPlay={handlePlayTrack}
                onSeek={handleSeek}
                isPlaying={isPlaying && currentTrackIndex === index}
                progress={trackProgress[index] || 0}
              />
            ))}
          </div>
          {!compact && !showAll && upcomingEvents.length > limit && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2 rounded-lg bg-white/10 border border-white/20 text-white/80 font-semibold hover:bg-white/20 transition-all duration-300"
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
      
      {!compact && (
        <div className="mt-8 sm:mt-12 text-center">
          <a 
            href="https://www.youtube.com/@originsradiotr" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors touch-manipulation px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <span className="text-sm sm:text-base">More on YouTube</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
      )}
      
      <audio ref={audioRef} preload="metadata" />
    </section>
  );
};

export default UpNextSection; 