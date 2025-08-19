import { useIsMobile } from '../../hooks/use-mobile';
import WaveformPreview from './WaveformPreview';
import { Play, Pause } from 'lucide-react';
import { useCallback } from 'react';

export interface ArtistSetEvent {
  title: string;
  artist: string;
  date: string;
  delay?: string;
  audioSrc: string;
  peaksUrl?: string;
  artistPhoto?: string;
  setNumber?: number;
  artistSlug?: string;
  artistLocation?: string;
}

export interface ArtistSetItemProps {
  event: ArtistSetEvent;
  index: number;
  onPlay: (index: number) => void;
  onSeek: (percentage: number) => void;
  isPlaying: boolean;
  progress: number;
  elapsedSeconds?: number;
  durationSeconds?: number;
}

const ArtistSetItem = ({ event, index, onPlay, onSeek, isPlaying, progress, elapsedSeconds, durationSeconds }: ArtistSetItemProps) => {
  const isMobile = useIsMobile();
  
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPlay(index);
  }, [onPlay, index]);

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

  const formatTime = (secs?: number) => {
    if (secs == null || isNaN(secs)) return '--:--';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
            <h3 className="text-white font-semibold text-sm sm:text-base truncate">
              {event.title}
            </h3>
            {event.setNumber && (
              <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-white/70 rounded-md font-mono tracking-tight">
                #{event.setNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-white/60">
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
        </div>
      </div>

      {/* Waveform + timecodes */}
      <div className="mb-1 sm:mb-2">
        <div className="rounded-xl bg-black/30 border border-white/10 p-3 sm:p-4">
        <WaveformPreview
          audioUrl={event.audioSrc}
          peaksUrl={event.peaksUrl}
          height={isMobile ? 44 : 56}
          barWidth={2}
          barRadius={1}
          progress={progress}
          onSeek={onSeek}
          interactive={true}
          variant="transparent"
        />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/50">
        <span>{formatTime(elapsedSeconds)}</span>
        <span>{formatTime(durationSeconds)}</span>
      </div>
    </div>
  );
};

export default ArtistSetItem; 

