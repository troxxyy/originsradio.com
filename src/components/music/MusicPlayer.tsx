import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, X, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Song {
  title: string;
  artist: string;
  path: string;
  coverArt: string;
}

interface MusicPlayerProps {
  showMain?: boolean;
  showFloating?: boolean;
}

const MusicPlayer = ({ showMain = false, showFloating = true }: MusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [isClickLoading, setIsClickLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFloatingHidden, setIsFloatingHidden] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const navigate = useNavigate();

  const songs: Song[] = [
    {
      title: "Stop Talking (Ledi Cannit Remix)",
      artist: "Graumann, Erdem Yetim, Ledi Cannit",
      path: "/songs/ Stop Talking - Ledi Cannit Remix - Graumann.mp3",
      coverArt: "/album-art/Stop.jpg"
    },
    {
      title: "Amaya",
      artist: "The Cet",
      path: "/songs/amaya.mp3",
      coverArt: "/album-art/amaya.jpg"
    },
    {
      title: "Tomorrow Is Another Day",
      artist: "M-High",
      path: "/songs/tomorow.mp3",
      coverArt: "/album-art/anot.jpg"
    },
    {
      title: "3210 (Ross from Friends Remix)",
      artist: "Jeshi",
      path: "/songs/Jeshi - 3210 (Ross from Friends Remix).mp3",
      coverArt: "/album-art/super.jpg"
    },
  ];

  const currentSong = songs[currentSongIndex];

  // Load hidden state from localStorage
  useEffect(() => {
    const hidden = localStorage.getItem('or_player_hidden');
    if (hidden === '1') setIsFloatingHidden(true);
  }, []);

  const hideFloating = () => {
    setIsFloatingHidden(true);
    localStorage.setItem('or_player_hidden', '1');
  };

  const unhideFloating = () => {
    setIsFloatingHidden(false);
    localStorage.removeItem('or_player_hidden');
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Ensure audio source is set and loaded
      if (!audio.src || audio.src !== currentSong.path) {
        audio.src = currentSong.path;
        audio.currentTime = 20;
        audio.load(); // Force reload the audio
      }
      
      // Wait for audio to be ready, then play
      const playAudio = () => {
        setIsAudioLoading(false);
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error playing audio:', error);
          setIsAudioLoading(false);
        });
      };

      if (audio.readyState >= 2) {
        // Audio is already loaded
        playAudio();
      } else {
        // Wait for audio to load
        setIsAudioLoading(true);
        audio.addEventListener('canplay', playAudio, { once: true });
      }
    }
  };

  const handleGoCrazyClick = () => {
    setIsClickLoading(true);
    setTimeout(() => {
      navigate('/gocrazy');
      setIsClickLoading(false);
    }, 1000);
  };

  const playNextSong = () => {
    if (hasSkipped) return;
    
    const randomIndex = Math.floor(Math.random() * songs.length);
    setCurrentSongIndex(randomIndex);
    setHasSkipped(true);
    
    setTimeout(() => setHasSkipped(false), 40000);
  };

  // Initialize audio when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.path;
    audio.currentTime = 20;
    audio.load(); // Force load the audio
  }, [currentSongIndex, currentSong]);

  // Initialize audio on component mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.path;
    audio.currentTime = 20;
    audio.load();
  }, []);

  // Handle song end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSongIndex(randomIndex);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [songs.length]);

  return (
    <div className="w-full max-w-7xl mx-auto mt-6 sm:mt-10 mb-28 sm:mb-36 px-2 sm:px-4">
      {showMain && (
        <div className="p-4 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-3 sm:gap-8 glass bg-white/[0.03] border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          {/* Album Cover */}
          <div className="relative w-48 h-48 sm:w-48 sm:h-48 flex-shrink-0 mb-4 sm:mb-0 transform -mt-8 sm:mt-0 shadow-xl">
            <div className="w-full h-full rounded-lg overflow-hidden border-2 border-white/10">
              <img
                src={currentSong?.coverArt}
                alt={`${currentSong?.title} album cover`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/album-covers/default.jpg';
                }}
              />
            </div>
            <div className="absolute inset-0 rounded-lg ring-1 ring-white/20"></div>
          </div>

          {/* Player Controls */}
          <div className="flex-1 w-full">
            <div className="text-center sm:text-left mb-4 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-1 sm:mb-2 truncate">
                {currentSong?.title}
              </h3>
              <p className="text-sm sm:text-lg text-white/70 truncate">
                {currentSong?.artist}
              </p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-start sm:gap-6 sm:relative pt-2 pb-1 sm:py-0">
              <div className="w-10 h-10 sm:hidden"></div>

              <button
                onClick={togglePlayPause}
                disabled={isAudioLoading}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shadow-md border border-white/10 backdrop-blur disabled:opacity-50"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isAudioLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} className="text-white sm:w-8 sm:h-8" />
                ) : (
                  <Play size={24} className="text-white ml-1 sm:w-8 sm:h-8" />
                )}
              </button>
              
              <button
                onClick={playNextSong}
                className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-800/50 text-white/80 hover:text-white transition-colors border border-white/10 ${hasSkipped ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Next song"
                disabled={hasSkipped}
                title={hasSkipped ? "Skip limit reached" : "Next song"}
              >
                <SkipForward size={20} className="sm:w-7 sm:h-7" />
              </button>
              
              <button
                onClick={handleGoCrazyClick}
                disabled={isClickLoading}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="hidden sm:flex p-2 sm:p-3 rounded-xl glass backdrop-blur-sm text-white/90 font-medium border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] items-center justify-center group sm:absolute sm:bottom-0 sm:right-0 relative"
                aria-label="Go Crazy visualization"
              >
                <img 
                  src="/gocrzazy.png" 
                  alt="Go Crazy" 
                  className="w-8 h-8 sm:w-16 sm:h-16 object-contain opacity-80 group-hover:opacity-100 transition-opacity brightness-0 invert" 
                />
                {isClickLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {showTooltip && (
                  <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs p-2 rounded-md whitespace-nowrap z-50">
                    This feature is currently in beta and only a few capabilities are online.
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Mini Player */}
      {showFloating && !isFloatingHidden && (
        <div className="fixed left-0 right-0 bottom-10 z-160 flex justify-center pointer-events-auto pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <div className="w-[100%] sm:w-[768px] max-w-[100%]">
            <div className="relative glass rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.35)] h-14 sm:h-16 px-4 sm:px-6 grid items-center grid-cols-[1fr_auto_1fr] bg-white/[0.03] border-white/5">
              {/* Left: Title + Artist */}
              <div className="flex items-center min-w-0 justify-self-start">
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-white/90 text-sm sm:text-base truncate max-w-[46vw] sm:max-w-[340px]">
                    {currentSong?.title}
                  </span>
                  <span className="text-white/60 text-xs sm:text-sm truncate max-w-[46vw] sm:max-w-[340px]">
                    {currentSong?.artist}
                  </span>
                </div>
              </div>

              {/* Center: Play/Pause */}
              <div className="flex items-center justify-center justify-self-center">
                <button
                  onClick={togglePlayPause}
                  disabled={isAudioLoading}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center shadow-md disabled:opacity-50"
                  aria-label={isPlaying ? "Pause" : "Play"}
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

              {/* Right: Next + Hide */}
              <div className="flex items-center justify-end justify-self-end">
                <button
                  onClick={playNextSong}
                  disabled={hasSkipped}
                  className={`w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center ${hasSkipped ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Next"
                  title={hasSkipped ? 'Skip limit reached' : 'Next'}
                >
                  <SkipForward size={16} className="text-white" />
                </button>
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
      {showFloating && isFloatingHidden && (
        <div className="fixed left-0 right-0 bottom-10 z-160 flex justify-center pb-[calc(env(safe-area-inset-bottom)+8px)]">
          <button
            onClick={unhideFloating}
            className="w-14 h-14 rounded-full glass bg-white/[0.03] border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-white/10 transition-all duration-300 flex items-center justify-center group"
            aria-label="Show music player"
            title="Show music player"
          >
            <Music size={20} className="text-white group-hover:text-white/90 transition-colors" />
          </button>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayer;