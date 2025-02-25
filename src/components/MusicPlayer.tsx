
import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass px-6 py-3 rounded-full flex items-center gap-6 animate-float">
        <button className="text-white/70 hover:text-white transition-colors">
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white translate-x-0.5" />
          )}
        </button>
        
        <button className="text-white/70 hover:text-white transition-colors">
          <SkipForward className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-white/70" />
          <div className="w-24 h-1 bg-white/20 rounded-full">
            <div className="w-1/2 h-full bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
