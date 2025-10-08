'use client'

import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import PageLayout from "@/components/layout/PageLayout";
import Navigation from "@/components/Navigation";
import { Clock, Radio, Calendar, Music, Sparkles, Play } from "lucide-react";
import ParticlesHeader from "@/components/ui/ParticlesHeader";

interface ArtistSchedule {
  hour: number;
  artist: string;
  setTitle: string;
  genre: string;
  streamUrl?: string;
}

const Anniversary = () => {
  const [currentHour, setCurrentHour] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Schedule remains the same...
  const schedule: ArtistSchedule[] = [
    { 
      hour: 0, 
      artist: "FURK", 
      setTitle: "Midnight Opening Set", 
      genre: "Electronic", 
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//TIDE%20-%20Furk%20-%20SoundLoadMate.com.mp3" // Paste FURK's Google Drive link here (2-hour set: use SAME link for hour 1)
    },
    { 
      hour: 1, 
      artist: "FURK", 
      setTitle: "Deep Night Vibes", 
      genre: "Electronic",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//TIDE%20-%20Furk%20-%20SoundLoadMate.com.mp3" // Use SAME link as hour 0 (FURK's 2-hour set continues)
    },
    { 
      hour: 2, 
      artist: "S.L Jeme", 
      setTitle: "Early Night Mix", 
      genre: "Deep House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//S.L.%20Jeme.mp3" // Paste S.L Jeme's Google Drive link here (1-hour set)
    },
    { 
      hour: 3, 
      artist: "Ar4t", 
      setTitle: "Deep Dawn Session", 
      genre: "Minimal",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//01%20AR4T,%20ORIGINSRADIO%203RD%20ANNIVERSARY%20SET.mp3" // Paste Ar4t's Google Drive link here (1-hour set)
    },
    { 
      hour: 4, 
      artist: "N1nja", 
      setTitle: "Morning Ambient", 
      genre: "Minimal",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//ninja%20settt%20-%20ninja%20-%20SoundLoadMate.com.mp3" // Paste N1nja's Google Drive link here (1-hour set)
    },
    { 
      hour: 5, 
      artist: "SINERGY", 
      setTitle: "Sunrise Energy", 
      genre: "Progressive",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//Fragments%20Podcast.m4a" // Paste SINERGY's Google Drive link here (1-hour set)
    },
    { 
      hour: 6, 
      artist: "Adens", 
      setTitle: "Daybreak Mix", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//Adens%20(1).mp3" // Paste Adens's Google Drive link here (1-hour set)
    },
    { 
      hour: 7, 
      artist: "Görkem Polat", 
      setTitle: "Morning Grooves", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//REC003%20(1).m4a" // Paste Görkem Polat's Google Drive link here (3-hour set: use SAME link for hours 8 & 9)
    },
    { 
      hour: 8, 
      artist: "Görkem Polat", 
      setTitle: "Mid-Morning Session", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//REC003%20(1).m4a" // Use SAME link as hour 7 (Görkem Polat's 3-hour set continues)
    },
    { 
      hour: 9, 
      artist: "Görkem Polat", 
      setTitle: "Late Morning Vibes", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//REC003%20(1).m4a" // Use SAME link as hour 7 (Görkem Polat's 3-hour set continues)
    },
    { 
      hour: 10, 
      artist: "Fate", 
      setTitle: "Pre-Noon Mix", 
      genre: "Techno",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//Radio%20-%20Fate..%20-%20SoundLoadMate.com.mp3" // Paste Fate's Google Drive link here (1-hour set)
    },
    { 
      hour: 11, 
      artist: "B Hayri", 
      setTitle: "Noon Special", 
      genre: "Techno",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//B_HAYRI%20HOUSE%20DEEP%20TECH%20SET%20-%20B_HAYRI%20-%20SoundLoadMate.com.mp3" // Paste B Hayri's Google Drive link here (1-hour set)
    },
    { 
      hour: 12, 
      artist: "CASTOR", 
      setTitle: "Early Afternoon", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//01%20castor%203rd.m4a" // Paste CASTOR's Google Drive link here (2-hour set: use SAME link for hour 13)
    },
    { 
      hour: 13, 
      artist: "CASTOR", 
      setTitle: "Afternoon Energy", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//01%20castor%203rd.m4a" // Use SAME link as hour 12 (CASTOR's 2-hour set continues)
    },
    { 
      hour: 14, 
      artist: "MIRAI", 
      setTitle: "Mid-Day Mix", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//B_HAYRI%20HOUSE%20DEEP%20TECH%20SET%20-%20B_HAYRI%20-%20SoundLoadMate.com.mp3" // Paste MIRAI's Google Drive link here (1-hour set)
    },
    { 
      hour: 15, 
      artist: "STEREOCATT", 
      setTitle: "Late Afternoon", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//StereoCatt-Origins-01.m4a" // Paste STEREOCATT's Google Drive link here (1-hour set)
    },
    { 
      hour: 16, 
      artist: "Karbo", 
      setTitle: "Evening Warm-up", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//Karbo.m4a" // Paste Karbo's Google Drive link here (1-hour set)
    },
    { 
      hour: 17, 
      artist: "MYK", 
      setTitle: "Sunset Session", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//MYK!.m4a" // Paste MYK's Google Drive link here (1-hour set)
    },
    { 
      hour: 18, 
      artist: "MYK", 
      setTitle: "Evening Grooves", 
      genre: "House",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//MYK!.m4a" // Use SAME link as hour 17 (MYK's set continues)
    },
    { 
      hour: 19, 
      artist: "EGEMEN ALPAY", 
      setTitle: "Prime Time Mix", 
      genre: "Progressive",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//TDJ2-Recording_2025-07-24_2140-2241%202.m4a" // Paste EGEMEN ALPAY's Google Drive link here (1-hour set)
    },
    { 
      hour: 20, 
      artist: "Bitter Mind", 
      setTitle: "Night Begins", 
      genre: "Techno",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//OriginsRadio_Bittermind.mp3" // Paste Bitter Mind's Google Drive link here (1-hour set)
    },
    { 
      hour: 21, 
      artist: "Techno Ballet", 
      setTitle: "Late Night Energy", 
      genre: "Techno",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//IREM%20-%20ORIGINS%20RADIO.mp3" // Direct download URL for Techno Ballet's set
    },
    { 
      hour: 22, 
      artist: "UMUT SEFILOGLU", 
      setTitle: "Deep Night Session", 
      genre: "Techno",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//uut.m4a" // Paste UMUT SEFILOGLU's Google Drive link here (1-hour set)
    },
    { 
      hour: 23, 
      artist: "LOTS OFF", 
      setTitle: "Final Hour Celebration", 
      genre: "Electronic",
      streamUrl: "https://azfazwgrfazdaunigqbd.supabase.co/storage/v1/object/public/anniversary//off.m4a" // Paste LOTS OFF's Google Drive link here (1-hour set)
    },
  ];

  // Get current artist
  const currentArtist = schedule.find(s => s.hour === currentHour) || schedule[0];

  // Handle set selection
  const handleSetSelect = (hour: number) => {
    setCurrentHour(hour);
    // Reset and play the new set
    // no imperative ref; MusicPlayer single mode will autoPlay on source change
  };

  // Handle playback start
  const handlePlaybackStart = () => {
    setIsPlaying(true);
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>3 Years of Origins - Full Recording | Origins Radio</title>
        <meta name="description" content="Experience our epic 24-hour anniversary celebration featuring amazing sets from our talented artists." />
      </Helmet>
      
      <PageLayout customBackground="bg-gradient-to-br from-blue-950 via-gray-900 to-cyan-950">
        <ParticlesHeader />
        <Navigation />
        
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-sky-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        {/* Event Header */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-8 relative z-10">
          <div className="text-center mb-16">
            {/* Event Status */}
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-8">
              <Play className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-semibold text-sm uppercase tracking-wide">Full Recording</span>
            </div>
            
            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight">
                3 Years of Origins
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-4"></div>
              <p className="text-2xl md:text-3xl text-gray-300 font-light">Origins Radio</p>
            </div>
            
            {/* Event Description */}
            <div className="max-w-2xl mx-auto">
              <p className="text-xl text-gray-400 mb-6 leading-relaxed">
                Experience our epic 24-hour anniversary celebration featuring amazing sets from our talented artists
              </p>
              
              {/* Event Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">24 Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  <span className="font-medium">24 Artists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5" />
                  <span className="font-medium">Full Recording</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Set Section */}
          <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl hover:shadow-white/5 transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Currently Playing</h2>
                  <p className="text-gray-400 font-mono">Hour {String(currentHour).padStart(2, '0')}:00 - {String((currentHour + 1) % 24).padStart(2, '0')}:00</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white mb-2 tracking-tight">{currentArtist.artist}</h3>
                  <p className="text-xl text-gray-300 font-light">{currentArtist.setTitle}</p>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {currentArtist.genre}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Interface - HIDDEN */}
          {/* <div className="relative group mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl hover:shadow-purple-500/5 transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-white font-semibold text-lg">Anniversary Recording</span>
                </div>
              </div>
              
              <MusicPlayer
                showMain={true}
                mode="single"
                sourceUrl={currentArtist.streamUrl}
                sourceTitle={currentArtist.setTitle}
                sourceArtist={currentArtist.artist}
                startAtSeconds={0}
                autoPlay={true}
                showFloating={false}
              />
            </div>
          </div> */}

          {/* 24-Hour Schedule */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl hover:shadow-white/5 transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Full Event Schedule</h2>
                <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="grid gap-2 max-h-[70vh] md:max-h-96 overflow-y-auto custom-scrollbar">
                {schedule.map((slot, index) => (
                  <button
                    key={slot.hour}
                    onClick={() => handleSetSelect(slot.hour)}
                    className={`w-full text-left group/item flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 rounded-lg border transition-all duration-300 hover:scale-[1.01] ${
                      slot.hour === currentHour
                        ? 'bg-white/10 border-white/30 shadow-lg shadow-white/5'
                        : 'bg-gray-800/30 border-gray-600/50 hover:bg-gray-700/40 hover:border-gray-500/50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between md:justify-start gap-4 mb-2 md:mb-0">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-white font-medium min-w-[60px]">
                          {String(slot.hour).padStart(2, '0')}:00
                        </span>
                      </div>
                      {slot.hour === currentHour && (
                        <div className="relative md:hidden">
                          <span className="text-xs text-purple-400 font-medium uppercase tracking-wider flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            Playing
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 mb-2 md:mb-0 md:mx-4">
                      <p className="text-white font-semibold truncate">{slot.artist}</p>
                      <p className="text-gray-400 text-sm truncate">{slot.setTitle}</p>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-3">
                      <span className="bg-gray-700/70 text-gray-300 px-2 md:px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm whitespace-nowrap">
                        {slot.genre}
                      </span>
                      {slot.hour === currentHour && (
                        <div className="hidden md:block text-xs text-purple-400 font-medium uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            Playing
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );
};

export default Anniversary; 