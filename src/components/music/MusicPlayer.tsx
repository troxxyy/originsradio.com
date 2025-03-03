import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

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
  const [songs] = useState<Song[]>([
    {
      title: "Superstealth",
      artist: "Cesco",
      path: "/songs/Cesco - Superstealth.mp3",
      coverArt: "/album-art/jesh1.jpg"
    },
    {
      title: "Off Wiv Ya Headz",
      artist: "Nia Archives",
      path: "/songs/Nia Archives - Off Wiv Ya Headz.mp3",
      coverArt: "/album-covers/super.jpg"
    },
    {
      title: "LEFT TO RIGHT (33 Below Remix)",
      artist: "Odd Mob",
      path: "/songs/Odd Mob - LEFT TO RIGHT (33 Below Remix).mp3",
      coverArt: "/album-covers/left-to-right.jpg"
    },
    {
      title: "Burn Dem Bridges (Nia Archives Edit)",
      artist: "Skin On Skin",
      path: "/songs/Skin On Skin - Burn Dem Bridges (Nia Archives Edit).mp3",
      coverArt: "/album-covers/burn-dem-bridges.jpg"
    },
    {
      title: "3210 (Ross from Friends Remix)",
      artist: "Jeshi",
      path: "/songs/Jeshi - 3210 (Ross from Friends Remix).mp3",
      coverArt: "/album-covers/3210.jpg"
    }
  ]);

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
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
  };

  const playPreviousSong = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = songs[currentSongIndex].path;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentSongIndex, songs]);

  useEffect(() => {
    const handleEnded = () => {
      playNextSong();
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

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-16">
      <div className="glass p-8 rounded-xl flex items-center gap-8">
        {/* Album Cover */}
        <div className="relative w-48 h-48 flex-shrink-0">
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
        <div className="flex-1">
          <div className="text-left mb-8">
            <h3 className="text-2xl font-semibold text-white mb-2">
              {songs[currentSongIndex].title}
            </h3>
            <p className="text-lg text-white/70">
              {songs[currentSongIndex].artist}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            

            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={32} className="text-white" />
              ) : (
                <Play size={32} className="text-white ml-1" />
              )}
            </button>
            
            <button
              onClick={playNextSong}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Next song"
            >
              <SkipForward size={28} />
            </button>
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayer; 