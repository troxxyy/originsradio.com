import { useIsMobile } from '../../hooks/use-mobile';
import WaveformPreview from './WaveformPreview';

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
}

const ArtistSetItem = ({ event, index, onPlay, onSeek, isPlaying, progress }: ArtistSetItemProps) => {
  const isMobile = useIsMobile();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay(index);
  };

  return (
    <div 
      className={`glass rounded-xl p-4 sm:p-6 animate-scale-in transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_25px_rgba(150,150,150,0.4)] relative group cursor-pointer touch-manipulation ${
        isPlaying 
          ? 'upnext-playing-animation border border-white/30 bg-white/5' 
          : ''
      }`}
      style={event.delay ? { animationDelay: event.delay } : undefined}
      onClick={handleClick}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 relative z-10">
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mb-2">
            {event.setNumber && (
              <span className="inline-flex items-center px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-xs font-mono text-white/80">
                Set #{event.setNumber}
              </span>
            )}
            <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold group-hover:text-shadow-glow transition-all duration-500 leading-tight ${
              isPlaying ? 'upnext-text-glow-animation' : ''
            }`}>
              {event.title}
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 mt-1">
            {event.artistLocation && (
              <span className="text-xs sm:text-sm text-white/60 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {event.artistLocation}
              </span>
            )}
          </div>
        </div>
        <div className="font-mono text-lg sm:text-xl md:text-2xl text-white/60 border-l-0 sm:border-l-2 border-white/10 pl-0 sm:pl-4 mt-2 sm:mt-0">
          {event.date}
        </div>
      </div>
      
      <div className="mt-3">
        <WaveformPreview 
          audioUrl={event.audioSrc} 
          peaksUrl={event.peaksUrl} 
          height={72}
          progress={progress}
          onSeek={onSeek}
          interactive={true}
        />
      </div>
      
      {/* Consolidated playing indicator */}
      {isPlaying && (
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white/80 animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)] z-20" />
      )}
    </div>
  );
};

export default ArtistSetItem; 

