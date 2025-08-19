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
export const ProgressBar = ({ progress, onSeek, className = "", thumbSize = "w-2 h-2" }: ProgressBarProps) => {
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
      className={`${mobileBarHeight} w-full mx-auto mt-4 bg-[#383838] relative overflow-visible rounded-full cursor-pointer select-none touch-none ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#383838] to-[#d1d1d1] transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
      <div 
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)] ${mobileThumbSize}`}
        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
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
      className={`group relative bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 transition-colors ${
        isPlaying ? 'bg-black/55 border-white/20' : 'hover:bg-black/50'
      }`}
    >
      {/* Header - Art + Info */}
      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
        {/* Artwork with overlayed play */}
        {event.artistPhoto ? (
          <button
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Pause set' : 'Play set'}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
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
                <Pause className="w-5 h-5 text-black" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </div>
          </button>
        ) : (
          <button
            onClick={handlePlayClick}
            aria-label={isPlaying ? 'Pause set' : 'Play set'}
            className={`w-12 h-12 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors border flex-shrink-0 ${
              isPlaying
                ? 'bg-white text-black border-white/80'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
        )}

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-white font-semibold text-base sm:text-lg truncate">
              {event.title}
            </h3>
            {event.setNumber && (
              <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white/70 rounded-md font-mono tracking-tight">
                #{event.setNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-white/60 mb-1">
            <span className="truncate max-w-[40vw] sm:max-w-none">{event.artist}</span>
            {event.artistLocation && (
              <>
                <span className="opacity-50">•</span>
                <span className="flex items-center gap-1 truncate">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.artistLocation}
                </span>
              </>
            )}
            <span className="opacity-50">•</span>
            <span>{formatDate(event.date)}</span>
          </div>

          {hasArtistSlug && (
            <a
              href={`/artists/${event.artistSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full text-[10px] font-medium text-blue-300 hover:text-blue-200 hover:border-blue-300/50 transition-all duration-300 group/link touch-manipulation"
            >
              <span>View Artist</span>
              <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Waveform + timecodes */}
      <div className="mb-1 sm:mb-2">
        <div className="rounded-xl bg-black/30 border border-white/10 p-3 sm:p-4">
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
            console.error('Error loading audio:', error);
            return;
          }
        }
        // Resume playback from current position
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing audio:', error);
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
      console.error('Audio error:', e);
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
const UpNextSection = () => {
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

  const setsToShow = showAll ? upcomingEvents : upcomingEvents.slice(0, 5);

  const handlePlayTrack = (trackIndex: number) => {
    handlePlay(trackIndex, upcomingEvents[trackIndex].audioSrc);
  };

  return (
    <section className="relative mt-4 sm:mt-4 w-full max-w-4xl mx-auto px-3 sm:px-6 py-12 sm:py-16">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="absolute -top-10 -left-20 w-64 h-64 bg-[#363636]/20 rounded-full filter blur-3xl animate-slow-pulse"></div>
      <div className="absolute -bottom-10 -right-20 w-128 h-128 bg-[#787878]/20 rounded-full filter blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }}></div>
      
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-center leading-tight">Special Sets</h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-8 sm:mb-10">
        <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-[#363636] to-[#787878]"></div>
        <p className="text-base sm:text-xl text-center text-white/80 px-2">Pre-recorded Sets Just For Origins Radio</p>
        <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-[#787878] to-[#d1d1d1]"></div>
      </div>
      
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
          {/* Anniversary Event Card */}
          <div className="mb-8">
            <a 
              href="/anniversary"
              className="block group relative overflow-hidden"
            >
              <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-white/5">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full text-xs font-medium text-red-300">
                      Past Event
                    </span>
                    <h2 className="text-2xl font-bold text-white">3 Years of Origins - Full Event Recording</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-gray-300">Experience our epic 24-hour anniversary celebration featuring amazing sets from our talented artists.</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>24 Hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <span>24 Artists</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span>Full Recording</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium group-hover:bg-white/20 transition-all duration-300">
                        Listen to Full Event
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Regular Sets */}
          <div className="space-y-4 sm:space-y-6">
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
          {!showAll && upcomingEvents.length > 5 && (
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
      
      <audio ref={audioRef} preload="metadata" />
    </section>
  );
};

export default UpNextSection; 