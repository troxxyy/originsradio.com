import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Song {
  title: string;
  artist: string;
  path: string;
  coverArt: string;
}

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [hasSkipped, setHasSkipped] = useState(false);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [songs] = useState<Song[]>
  ([  


    {
      title: "Stop Talking (Ledi Cannit Remix)",
      artist: "Graumann, Erdem Yetim, Ledi Cannit",
      path: "/songs/ Stop Talking - Ledi Cannit Remix - Graumann.mp3",
      coverArt: "/album-art/Stop.jpg"
  },
  {
    title: "Lost Avenue",
    artist: "Overhard,Redein",
    path: "/songs/lostavenue.mp3",
    coverArt: "/album-art/lost.jpg"
  },
  {
    title: "Amaya ",
    artist: "The Cet",
    path: "/songs/amaya.mp3",
    coverArt: "/album-art/amaya.jpg"
  },




    {
      title: "3210 (Ross from Friends Remix)",
      artist: "Jeshi",
      path: "/songs/Jeshi - 3210 (Ross from Friends Remix).mp3",
      coverArt: "/album-covers/3210.jpg"
    },


    
    
  ]);
  const navigate = useNavigate();

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextSong = () => {
    if (!hasSkipped) {
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
      setHasSkipped(true);
      
      // Clear any existing timer
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
      
      // Set new timer to reset skip state after 40 seconds
      skipTimerRef.current = setTimeout(() => {
        setHasSkipped(false);
      }, 40000);
    }
  };

  const playPreviousSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = songs[currentSongIndex].path;
      audioRef.current.currentTime = 20;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSongIndex, songs]);

  useEffect(() => {
    const handleEnded = () => {
      setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
      // Reset skip state when song naturally ends
      setHasSkipped(false);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 mb-8 sm:mt-8 sm:mb-16 px-2 sm:px-4">
      <div className="glass p-3 sm:p-8 rounded-xl flex flex-col sm:flex-row items-center gap-3 sm:gap-8">
        {/* Album Cover */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0 mb-3 sm:mb-0">
          <div className="w-full h-full rounded-lg overflow-hidden shadow-2xl">
            <img
              src={songs[currentSongIndex].coverArt}
              alt={`${songs[currentSongIndex].title} album cover`}
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
          <div className="text-center sm:text-left mb-3 sm:mb-8">
            <h3 className="text-lg sm:text-2xl font-semibold text-white mb-1 sm:mb-2 truncate">
              {songs[currentSongIndex].title}
            </h3>
            <p className="text-sm sm:text-lg text-white/70 truncate">
              {songs[currentSongIndex].artist}
            </p>
          </div>
          
          <div className="flex items-center justify-between sm:justify-start sm:gap-6 sm:relative">
            

            <button
              onClick={togglePlayPause}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={20} className="text-white sm:w-8 sm:h-8" />
              ) : (
                <Play size={20} className="text-white ml-1 sm:w-8 sm:h-8" />
              )}
            </button>
            
            <button
              onClick={playNextSong}
              className={`text-white/80 hover:text-white transition-colors ${hasSkipped ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Next song"
              disabled={hasSkipped}
              title={hasSkipped ? "Skip limit reached" : "Next song"}
            >
              <SkipForward size={20} className="sm:w-7 sm:h-7" />
            </button>
            
            <button
              onClick={() => navigate('/gocrazy')}
              className="p-2 sm:p-3 rounded-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white flex items-center justify-center hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-200 group sm:absolute sm:bottom-0 sm:right-0"
              aria-label="Go Crazy visualization"
            >
              <img 
                src="/gocrzazy.png" 
                alt="Go Crazy" 
                className="w-8 h-8 sm:w-16 sm:h-16 object-contain opacity-90 group-hover:opacity-100 transition-opacity" 
              />
            </button>
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayer; 