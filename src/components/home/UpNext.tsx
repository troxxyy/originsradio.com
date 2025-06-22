import { useRef, useState, useEffect } from 'react';

interface UpNextItemProps {
  title: string;
  artist: string;
  date: string;
  delay?: string;
  audioSrc: string;
  onPlay: () => void;
  onSeek: (percentage: number) => void;
  isPlaying: boolean;
  progress: number;
}

const UpNextItem = ({ title, artist, date, delay, audioSrc, onPlay, onSeek, isPlaying, progress }: UpNextItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const calculatePercentage = (clientX: number) => {
    if (!progressBarRef.current) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    const percentage = calculatePercentage(e.clientX);
    onSeek(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const percentage = calculatePercentage(e.clientX);
      onSeek(percentage);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="glass rounded-xl p-6 animate-scale-in transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(150,150,150,0.4)] relative group cursor-pointer"
      style={delay ? { animationDelay: delay } : undefined}
      onClick={onPlay}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-bold group-hover:text-shadow-glow transition-all duration-300">{title}</h3>
          <p className="text-lg text-white/80 mt-1">{artist}</p>
        </div>
        <div className="font-mono text-xl sm:text-2xl text-white/60 border-l-2 border-white/10 pl-4">
          {date}
        </div>
      </div>
      <div 
        ref={progressBarRef}
        className="h-0.5 w-full mx-auto mt-4 bg-[#383838] relative overflow-visible rounded-full cursor-pointer select-none"
        onMouseDown={handleMouseDown}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#383838] to-[#d1d1d1] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      {isPlaying && (
        <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-white/60 animate-pulse" />
      )}
    </div>
  );
};

const UpNextSection = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const lastUpdateRef = useRef(0);

  const handlePlay = (trackIndex: number) => {
    // Pause any other audio elements on the page
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
      if (audio !== audioRef.current) {
        audio.pause();
      }
    });

    // Play the set
    if (audioRef.current) {
      if (isPlaying && currentTrackIndex === trackIndex) {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentTrackIndex(null);
      } else {
        // Change audio source if different track
        if (currentTrackIndex !== trackIndex) {
          audioRef.current.src = upcomingEvents[trackIndex].audioSrc;
          setCurrentTrackIndex(trackIndex);
        }
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (percentage: number) => {
    if (audioRef.current) {
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const now = Date.now();
      // Only update every 100ms
      if (now - lastUpdateRef.current >= 100) {
        const currentProgress = (audio.currentTime / audio.duration) * 100;
        setProgress(currentProgress);
        lastUpdateRef.current = now;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTrackIndex(null);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const upcomingEvents = [
    {
      title: 'Lina Palamarchuk - #58',
      artist: 'Kiev',
      date: 'June 22, 2025',
      delay: '0.001s',
      audioSrc: '/sets/Lina-Palamarchuk-_58.opus'
    },
    {
      title: 'AL2 OriginsRadio Set - #57',
      artist: 'Ankara',
      date: 'June 17, 2025',
      delay: '0.2s',
      audioSrc: '/sets/AL2 Origins Radio.mp3'
    }
  ];

  return (
    <section className="relative mt-4 sm:mt-4 w-full max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="absolute -top-10 -left-20 w-64 h-64 bg-[#363636]/20 rounded-full filter blur-3xl animate-slow-pulse"></div>
      <div className="absolute -bottom-10 -right-20 w-128 h-128 bg-[#787878]/20 rounded-full filter blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }}></div>
      
      <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-center">Special Sets</h1>
      <div className="flex items-center justify-center gap-2 mb-10">
        <div className="h-0.5 w-12 bg-gradient-to-r from-[#363636] to-[#787878]"></div>
        <p className="text-xl text-center text-white/80">Pre-recorded Sets Just For Origins Radio</p>
        <div className="h-0.5 w-12 bg-gradient-to-r from-[#787878] to-[#d1d1d1]"></div>
      </div>
      
      <div className="   ace-y-4">
        {upcomingEvents.map((event, index) => (
          <UpNextItem 
            key={index}
            title={event.title}
            artist={event.artist}
            date={event.date}
            delay={event.delay}
            audioSrc={event.audioSrc}
            onPlay={() => handlePlay(index)}
            onSeek={handleSeek}
            isPlaying={isPlaying && currentTrackIndex === index}
            progress={progress}
          />
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <a 
          href="https://www.youtube.com/@originsradiotr" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass backdrop-blur-sm text-white/90 font-medium border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Subscribe to our channel
        </a>
      </div>

      <audio 
        ref={audioRef} 
        className="hidden"
      />
    </section>
  );
};

export default UpNextSection; 