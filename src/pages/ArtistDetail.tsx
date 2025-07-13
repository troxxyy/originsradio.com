import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Music, 
  Calendar, 
  ExternalLink, 
  Play, 
  Pause,
  Instagram,
  Youtube,
  Facebook,
  Star,
  Heart,
  Share2,
  Clock,
  Users
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useArtistBySlug, useTracksByArtist, useEventsByArtist, useSetsByArtist } from '@/hooks/use-supabase';
import ArtistSetItem, { ArtistSetEvent } from '@/components/music/ArtistSetItem';
import ProgressBar from '@/components/music/ProgressBar';

const ArtistDetail = () => {
  const { artistSlug } = useParams<{ artistSlug: string }>();
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [isLiked, setIsLiked] = useState(() => {
    // Check if this artist is liked in localStorage
    const likedArtists = JSON.parse(localStorage.getItem('likedArtists') || '[]');
    return likedArtists.includes(artistSlug);
  });

  // Add audio player state for sets
  const [audioRefSet, setAudioRefSet] = useState<HTMLAudioElement | null>(null);
  const [isPlayingSet, setIsPlayingSet] = useState(false);
  const [currentSetIndex, setCurrentSetIndex] = useState<number | null>(null);
  const [trackProgressSet, setTrackProgressSet] = useState<{ [key: number]: number }>({});
  const [isSeekingSet, setIsSeekingSet] = useState(false);
  const lastUpdateRefSet = useRef(0);

  // Fetch artist from Supabase using slug
  const { data: artist, isLoading, error } = useArtistBySlug(artistSlug || '');
  const { data: tracks } = useTracksByArtist(artist?.id || '');
  const { data: events } = useEventsByArtist(artist?.id || '');
  const { data: sets } = useSetsByArtist(artist?.id || '');

  const setsEvents: ArtistSetEvent[] = (sets || []).map((set, index) => ({
    title: set.title,
    artist: artist?.name || 'Unknown Artist',
    date: set.release_date ? new Date(set.release_date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '',
    delay: `${index * 0.2}s`,
    audioSrc: set.audio_url,
    artistPhoto: artist?.photo_url || undefined,
    setNumber: set.set_number,
    artistSlug: artist?.name ? artistSlug : undefined,
    artistLocation: artist?.location || undefined
  }));

  const handlePlaySet = async (index: number) => {
    if (!setsEvents[index]) return;
    
    // Pause any other audio elements on the page
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
      if (audio !== audioRefSet) {
        audio.pause();
      }
    });

    if (audioRefSet) {
      if (isPlayingSet && currentSetIndex === index) {
        // Pause current set, but do not reset currentSetIndex
        audioRefSet.pause();
        setIsPlayingSet(false);
      } else {
        // Play new set or resume current set
        if (currentSetIndex !== index) {
          // Load new set
          audioRefSet.src = setsEvents[index].audioSrc;
          setCurrentSetIndex(index);
          // Reset progress for new set
          setTrackProgressSet(prev => ({ ...prev, [index]: 0 }));
          // Wait for audio to load
          try {
            await audioRefSet.load();
          } catch (error) {
            console.error('Error loading audio:', error);
            return;
          }
        }
        // Resume playback from current position
        try {
          await audioRefSet.play();
          setIsPlayingSet(true);
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    } else {
      // Create new audio element if none exists
      const audio = new Audio(setsEvents[index].audioSrc);
      audio.addEventListener('ended', () => {
        setIsPlayingSet(false);
      });
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlayingSet(false);
      });
      setAudioRefSet(audio);
      setCurrentSetIndex(index);
      setTrackProgressSet(prev => ({ ...prev, [index]: 0 }));
      try {
        await audio.play();
        setIsPlayingSet(true);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleSeekSet = (percentage: number) => {
    if (
      audioRefSet &&
      currentSetIndex !== null &&
      audioRefSet.duration &&
      !isNaN(audioRefSet.duration) &&
      audioRefSet.duration > 0
    ) {
      setIsSeekingSet(true);
      const newTime = (percentage / 100) * audioRefSet.duration;
      audioRefSet.currentTime = newTime;
      setTrackProgressSet(prev => ({ ...prev, [currentSetIndex]: percentage }));
      setTimeout(() => {
        setIsSeekingSet(false);
      }, 100);
    }
  };

  // Add useEffect for progress updates
  useEffect(() => {
    const audio = audioRefSet;
    if (!audio) return;

    const updateProgress = () => {
      // Don't update progress if we're currently seeking
      if (isSeekingSet || currentSetIndex === null) return;
      const now = Date.now();
      // Only update every 100ms
      if (now - lastUpdateRefSet.current >= 100) {
        if (audio.duration && !isNaN(audio.duration)) {
          const currentProgress = (audio.currentTime / audio.duration) * 100;
          setTrackProgressSet(prev => ({ ...prev, [currentSetIndex]: currentProgress }));
        }
        lastUpdateRefSet.current = now;
      }
    };

    const handleEnded = () => {
      setIsPlayingSet(false);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setIsPlayingSet(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioRefSet, currentSetIndex, isSeekingSet]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlayTrack = (track: any) => {
    if (audioRef) {
      audioRef.pause();
    }

    const audio = new Audio(track.audio_url);
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    });

    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentTrack(track.id);
      setAudioRef(audio);
    }).catch(error => {
      console.error('Error playing track:', error);
    });
  };

  const handlePauseTrack = () => {
    if (audioRef) {
      audioRef.pause();
      setIsPlaying(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'soundcloud':
        return <ExternalLink className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white text-xl font-medium">Loading artist...</div>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  if (error || !artist) {
    return (
      <PageLayout>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Artist not found</h1>
            <p className="text-gray-400 mb-8">The artist you're looking for doesn't exist or has been removed.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/artists')}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all shadow-lg"
            >
              Back to Artists
            </motion.button>
          </motion.div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="pt-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            onClick={() => navigate('/artists')}
            className="flex items-center gap-3 text-white/80 hover:text-white transition-all duration-300 mb-8 group"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Artists</span>
          </motion.button>
        </div>

        {/* Hero Section */}
        <div className="pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Card */}
            <div className="glass backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu">
              {/* Cover Image with Enhanced Overlay */}
            <div className="relative h-96 lg:h-[500px] overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                src={artist.photo_url || '/placeholder.svg'}
                alt={artist.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 15%' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
                
                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-blue-500/20" />
                
                {/* Floating Action Buttons */}
                <div className="absolute top-6 right-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newLikedState = !isLiked;
                      setIsLiked(newLikedState);
                      
                      // Update localStorage
                      const likedArtists = JSON.parse(localStorage.getItem('likedArtists') || '[]');
                      if (newLikedState) {
                        if (!likedArtists.includes(artistSlug)) {
                          likedArtists.push(artistSlug);
                        }
                      } else {
                        const index = likedArtists.indexOf(artistSlug);
                        if (index > -1) {
                          likedArtists.splice(index, 1);
                        }
                      }
                      localStorage.setItem('likedArtists', JSON.stringify(likedArtists));
                    }}
                    className={`w-12 h-12 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all ${
                      isLiked ? 'bg-red-500/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: artist?.name || 'Artist',
                          text: `Check out ${artist?.name} on Origins Radio`,
                          url: window.location.href,
                        }).catch((error) => {
                          console.log('Error sharing:', error);
                        });
                      } else {
                        // Fallback for browsers that don't support Web Share API
                        navigator.clipboard.writeText(window.location.href).then(() => {
                          // You could add a toast notification here
                          alert('Link copied to clipboard!');
                        }).catch(() => {
                          // Fallback for older browsers
                          const textArea = document.createElement('textarea');
                          textArea.value = window.location.href;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                          alert('Link copied to clipboard!');
                        });
                      }
                    }}
                    className="w-12 h-12 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              
              {/* Featured Badge */}
              {artist.featured && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="absolute top-4 left-4 z-20"
                  >
                    <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 text-black px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg border border-white/20 backdrop-blur-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span>FEATURED ARTIST</span>
                    </div>
                  </motion.div>
              )}
            </div>

              {/* Artist Info with Enhanced Layout */}
            <div className="p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                    >
                    {artist.name}
                    </motion.h1>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-6 mb-8"
                    >
                    {artist.location && (
                        <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                          <MapPin className="w-4 h-4" />
                          <span className="font-medium">{artist.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <Music className="w-4 h-4" />
                        <span className="font-medium">{tracks?.length || 0} track{(tracks?.length || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{events?.length || 0} event{(events?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                    </motion.div>

                  {artist.genre && artist.genre.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-3 mb-8"
                      >
                        {artist.genre.map((genre, index) => (
                          <motion.span
                          key={genre}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full text-sm text-white font-medium border border-blue-500/30 backdrop-blur-sm"
                        >
                          {genre}
                          </motion.span>
                      ))}
                      </motion.div>
                  )}

                  {artist.bio && (
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-gray-300 text-lg leading-relaxed mb-8"
                      >
                      {artist.bio}
                      </motion.p>
                  )}

                  {/* Social Links */}
                  {artist.social_links && Object.keys(artist.social_links).length > 0 && (
                       <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.7 }}
                         className="flex gap-3 mb-6"
                       >
                         {Object.entries(artist.social_links)
                           .filter(([platform]) => platform === 'instagram' || platform === 'soundcloud')
                           .slice(0, 2)
                           .map(([platform, url]) => (
                             <motion.a
                          key={platform}
                               whileHover={{ scale: 1.05 }}
                               whileTap={{ scale: 0.95 }}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
                        >
                          {getSocialIcon(platform)}
                             </motion.a>
                      ))}
                       </motion.div>
                  )}
                </div>

                                     {/* Stats Card */}
                <div className="space-y-6">
                     <motion.div
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.8 }}
                       className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu"
                     >
                    <h3 className="text-xl font-semibold text-white mb-4">Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tracks</span>
                        <span className="text-white font-semibold">{tracks?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Events</span>
                        <span className="text-white font-semibold">{events?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Genres</span>
                        <span className="text-white font-semibold">{artist.genre?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Member since</span>
                        <span className="text-white font-semibold">
                          {new Date(artist.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                     </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tracks Section */}
        {tracks && tracks.length > 0 ? (
          <div className="pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Tracks</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                {tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                      initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu"
                  >
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{track.title}</h3>
                          <p className="text-gray-400 mb-3 font-medium">{artist.name}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            {track.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                              </div>
                            )}
                            {track.release_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(track.release_date).toLocaleDateString()}</span>
                              </div>
                            )}
                        </div>
                      </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (currentTrack === track.id && isPlaying) {
                            handlePauseTrack();
                          } else {
                            handlePlayTrack(track);
                          }
                        }}
                          className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
                      >
                        {currentTrack === track.id && isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Tracks</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Music className="w-12 h-12 text-gray-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">No tracks available</h3>
                <p className="text-gray-400 text-lg">Tracks will be added soon</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Sets Section */}
        {sets && sets.length > 0 ? (
          <div className="pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Sets</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              <div className="space-y-4">
                {setsEvents.map((event, index) => (
                  <ArtistSetItem
                    key={index}
                    event={event}
                    index={index}
                    onPlay={handlePlaySet}
                    onSeek={handleSeekSet}
                    isPlaying={isPlayingSet && currentSetIndex === index}
                    progress={trackProgressSet[index] || 0}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Sets</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Music className="w-12 h-12 text-gray-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">No sets available</h3>
                <p className="text-gray-400 text-lg">Sets will be added soon</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Events Section */}
        {events && events.length > 0 ? (
          <div className="pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Events</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu"
                  >
                      <div className="relative h-56 overflow-hidden">
                      <img
                        src={event.image_url || '/placeholder.svg'}
                        alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                        {/* Event Status Badge */}
                        {event.upcoming && (
                          <div className="absolute top-4 right-4">
                            <span className="px-4 py-2 bg-green-500/90 text-white text-sm font-bold rounded-full backdrop-blur-sm">
                            Upcoming
                          </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
                        <p className="text-gray-300 mb-4 font-medium">{event.location}</p>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">{event.description}</p>
                      
                      {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                          {event.tags.map(tag => (
                            <span
                              key={tag}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full text-xs text-white font-medium border border-blue-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="pb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h2 className="text-4xl font-bold text-white">Events</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Calendar className="w-12 h-12 text-gray-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">No events available</h3>
                <p className="text-gray-400 text-lg">Events will be added soon</p>
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ArtistDetail; 
