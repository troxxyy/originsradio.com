import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface LivePlayerProps {
  streamUrl?: string;
  currentArtist: string;
  currentSet: string;
  isLive?: boolean;
}

const LivePlayer: React.FC<LivePlayerProps> = ({ 
  // For Google Drive links, use the direct download format:
  // https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
  // Get the FILE_ID from the shareable link: https://drive.google.com/file/d/FILE_ID/view
  streamUrl = "/sets/AL2 Origins Radio.mp3", // Fallback if no URL provided
  currentArtist,
  currentSet,
  isLive = true 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use provided streamUrl or fallback to default
  const audioSrc = streamUrl || "/sets/AL2 Origins Radio.mp3";

  // Calculate the current position within the hour
  const getCurrentPositionInHour = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return (minutes * 60) + seconds; // Total seconds elapsed in current hour
  };

  // Auto-play when component mounts with correct time position
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const startPlayback = async () => {
      setIsLoading(true);
      try {
        // Wait for audio to load enough data
        await new Promise((resolve) => {
          const handleCanPlay = () => {
            audio.removeEventListener('canplay', handleCanPlay);
            resolve(void 0);
          };
          audio.addEventListener('canplay', handleCanPlay);
          
          // Fallback timeout in case canplay doesn't fire
          setTimeout(resolve, 3000);
        });

        // Set the current time based on position within the hour
        const positionInHour = getCurrentPositionInHour();
        
        // For a typical 1-hour set, we want to sync with the hour
        // If the audio is shorter, we'll loop it within the hour
        if (audio.duration && !isNaN(audio.duration)) {
          // If we know the duration, calculate the correct position
          const loopPosition = positionInHour % audio.duration;
          audio.currentTime = loopPosition;
        } else {
          // If duration is unknown, use a reasonable approach
          // Assume most sets are around 60 minutes (3600 seconds)
          const estimatedDuration = 3600; // 1 hour
          const loopPosition = positionInHour % estimatedDuration;
          audio.currentTime = Math.min(loopPosition, audio.duration || loopPosition);
        }

        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Auto-play failed:', error);
        // Auto-play might be blocked by browser, but that's okay
      } finally {
        setIsLoading(false);
      }
    };

    startPlayback();
  }, [streamUrl]); // Re-run when stream URL changes (new artist)

  // Update position when artist changes (new hour)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying) return;

    const updatePosition = async () => {
      try {
        const positionInHour = getCurrentPositionInHour();
        
        if (audio.duration && !isNaN(audio.duration)) {
          const loopPosition = positionInHour % audio.duration;
          audio.currentTime = loopPosition;
        }
      } catch (error) {
        console.error('Error updating position:', error);
      }
    };

    updatePosition();
  }, [currentArtist, currentSet]); // Update when artist/set changes

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      // Unmute if volume is changed from 0
      if (newVolume > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setIsLoading(false);
      console.error('Audio loading error');
    };

    // Handle when audio ends - restart with current hour position
    const handleEnded = () => {
      const positionInHour = getCurrentPositionInHour();
      if (audio.duration && !isNaN(audio.duration)) {
        const loopPosition = positionInHour % audio.duration;
        audio.currentTime = loopPosition;
        audio.play().catch(console.error);
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    // Set initial volume
    audio.volume = volume;

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume]);

  return (
    <div className="bg-gray-950/90 rounded-lg p-6">
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="auto"
        loop={false} // We handle looping manually for proper sync
        autoPlay
      />
      
      {/* Live Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-bold text-sm uppercase tracking-wide">LIVE</span>
            </div>
          )}
          <div className="text-white">
            <p className="font-bold">{currentArtist}</p>
            <p className="text-sm text-gray-400">{currentSet}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            {isPlaying ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Playing</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Loading...</span>
              </>
            )}
          </div>
          <div className="w-px h-3 bg-gray-600"></div>
          <span>Origins Radio</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex items-center gap-4">
        {/* Mute/Unmute Button */}
        <button
          onClick={toggleMute}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
            isMuted 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-white hover:bg-gray-200 text-black'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 flex-1">
          <span className="text-gray-400 text-sm min-w-[40px]">Volume</span>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume control"
            className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
            }}
          />
          
          <span className="text-gray-400 text-sm min-w-[35px] font-mono">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Quality Indicator */}
        <div className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
          320kbps
        </div>
      </div>

      {/* Stream Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {isLive ? '🔴 Live streaming from Ankara' : 'Pre-recorded set'}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default LivePlayer; 