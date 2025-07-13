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
  Users,
  Headphones,
  Mic,
  TrendingUp,
  Globe,
  Disc3,
  Zap,
  Eye
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useArtistBySlug, useTracksByArtist, useEventsByArtist, useSetsByArtist, useArtistLikeCount, useArtistLikeStatus, useToggleArtistLike } from '@/hooks/use-supabase';
import ArtistSetItem, { ArtistSetEvent } from '@/components/music/ArtistSetItem';
import ProgressBar from '@/components/music/ProgressBar';
import { getSupabaseClient } from '@/lib/supabase';

const ArtistDetail = () => {
  const { artistSlug } = useParams<{ artistSlug: string }>();
  const navigate = useNavigate();
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  // Audio player state for sets
  const [audioRefSet, setAudioRefSet] = useState<HTMLAudioElement | null>(null);
  const [isPlayingSet, setIsPlayingSet] = useState(false);
  const [currentSetIndex, setCurrentSetIndex] = useState<number | null>(null);
  const [trackProgressSet, setTrackProgressSet] = useState<{ [key: number]: number }>({});
  const [isSeekingSet, setIsSeekingSet] = useState(false);
  const lastUpdateRefSet = useRef(0);

  // Fetch data
  const { data: artist, isLoading, error } = useArtistBySlug(artistSlug || '');
  const { data: tracks } = useTracksByArtist(artist?.id || '');
  const { data: events } = useEventsByArtist(artist?.id || '');
  const { data: sets } = useSetsByArtist(artist?.id || '');

  // Like functionality
  const { data: likeCount = 0 } = useArtistLikeCount(artist?.id || '');
  const { data: isLiked = false } = useArtistLikeStatus(artist?.id || '');
  const toggleLikeMutation = useToggleArtistLike();

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

  // DJ-specific stats calculations
  const totalTracks = tracks?.length || 0;
  const totalSets = sets?.length || 0;
  const totalEvents = events?.length || 0;
  const totalDuration = tracks?.reduce((acc, track) => acc + (track.duration || 0), 0) || 0;
  const averageTrackLength = totalTracks > 0 ? Math.round(totalDuration / totalTracks) : 0;
  const upcomingEvents = events?.filter(event => event.upcoming) || [];
  const pastEvents = events?.filter(event => !event.upcoming) || [];
  
  // Use real data from database
  const artistViews = artist?.views_count || 0;
  const artistExperience = artist?.years_experience || 1;
  
  // Calculate total plays from real track and set views
  const trackViews = tracks?.reduce((acc, track) => acc + (track.views_count || 0), 0) || 0;
  const setViews = sets?.reduce((acc, set) => acc + (set.views_count || 0), 0) || 0;
  const totalPlays = trackViews + setViews + artistViews;
  
  // Calculate followers based on real engagement
  const baseFollowers = 1000;
  const engagementMultiplier = (totalPlays / 100) + (totalEvents * 50) + (totalTracks * 20);
  const calculatedFollowers = Math.max(baseFollowers, Math.floor(engagementMultiplier));
  
  // DJ-specific data calculated from real metrics
  const djStats = {
    experience: `${artistExperience}+ years`,
    genres: artist?.genre || ['House', 'Techno', 'Progressive'],
    equipment: ['Pioneer CDJ-3000', 'DJM-900NXS2', 'Serato DJ Pro'],
    mixingStyle: 'Harmonic mixing with smooth transitions',
    residency: artist?.location ? `${artist.location} Underground` : 'Freelance',
    followers: calculatedFollowers,
    totalPlays: totalPlays,
    certifications: ['Ableton Certified', 'Pioneer DJ School'],
    awards: ['Best Underground DJ 2023', 'Local Hero Award']
  };

  const handlePlaySet = async (index: number) => {
    if (!setsEvents[index]) return;
    
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
      if (audio !== audioRefSet) {
        audio.pause();
      }
    });

    if (audioRefSet) {
      if (isPlayingSet && currentSetIndex === index) {
        audioRefSet.pause();
        setIsPlayingSet(false);
      } else {
        if (currentSetIndex !== index) {
          audioRefSet.src = setsEvents[index].audioSrc;
          setCurrentSetIndex(index);
          setTrackProgressSet(prev => ({ ...prev, [index]: 0 }));
          try {
            await audioRefSet.load();
          } catch (error) {
            console.error('Error loading audio:', error);
            return;
          }
        }
        try {
          await audioRefSet.play();
          setIsPlayingSet(true);
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    } else {
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

  useEffect(() => {
    const audio = audioRefSet;
    if (!audio) return;

    const updateProgress = () => {
      if (isSeekingSet || currentSetIndex === null) return;
      const now = Date.now();
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

  // Increment views when profile is visited
  useEffect(() => {
    if (artist && artist.id) {
      const incrementViews = async () => {
        try {
          const supabase = getSupabaseClient();
          const { error } = await supabase
            .from('artists')
            .update({ views_count: (artist.views_count || 0) + 1 })
            .eq('id', artist.id);
          
          if (error) {
            console.error('Error incrementing views:', error);
          }
        } catch (error) {
          console.error('Error incrementing views:', error);
        }
      };
      
      incrementViews();
    }
  }, [artist?.id]);

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

  const handleToggleLike = () => {
    if (artist?.id) {
      toggleLikeMutation.mutate({ artistId: artist.id });
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
            <div className="text-white text-xl font-medium">Loading DJ profile...</div>
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
              <Headphones className="w-12 h-12 text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">DJ not found</h1>
            <p className="text-gray-400 mb-8">The DJ you're looking for doesn't exist or has been removed.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/artists')}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all shadow-lg"
            >
              Back to DJs
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
              <span className="font-medium">Back to DJs</span>
            </motion.button>
          </div>

          {/* Hero Section */}
          <div className="pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="glass backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu">
                <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
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
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 to-blue-500/20" />
                  
                  {/* Action Buttons - Mobile Optimized */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleToggleLike}
                        disabled={toggleLikeMutation.isPending}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all touch-manipulation ${
                          isLiked ? 'bg-red-500/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                        } ${toggleLikeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
                      </motion.button>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black/50 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium border border-white/20"
                      >
                        {likeCount.toLocaleString()}
                      </motion.div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: artist?.name || 'DJ',
                            text: `Check out ${artist?.name} on Origins Radio`,
                            url: window.location.href,
                          }).catch((error) => {
                            console.log('Error sharing:', error);
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href).then(() => {
                            alert('Link copied to clipboard!');
                          }).catch(() => {
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
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full backdrop-blur-sm bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all touch-manipulation"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
                        <span>FEATURED DJ</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* DJ Info */}
                <div className="p-6 sm:p-8 lg:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                      >
                        {artist.name}
                      </motion.h1>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6"
                      >
                        {artist.location && (
                          <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 sm:px-4 py-2 rounded-full border border-white/10">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="font-medium text-sm sm:text-base">{artist.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 sm:px-4 py-2 rounded-full border border-white/10">
                          <Headphones className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium text-sm sm:text-base">{djStats.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-3 sm:px-4 py-2 rounded-full border border-white/10">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="font-medium text-sm sm:text-base">{artistViews.toLocaleString()}</span>
                        </div>
                      </motion.div>

                      {artist.genre && artist.genre.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex flex-wrap gap-3 mb-6"
                        >
                          {artist.genre.slice(0, 3).map((genre, index) => (
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
                          className="text-gray-300 text-lg leading-relaxed mb-6"
                        >
                          {artist.bio}
                        </motion.p>
                      )}

                      {/* DJ Equipment */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mb-6"
                      >
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <Mic className="w-5 h-5" />
                          Equipment
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {djStats.equipment.slice(0, 2).map((item, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/10"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </motion.div>

                      {/* Social Links */}
                      {artist.social_links && Object.keys(artist.social_links).length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="flex gap-3"
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

                    {/* DJ Stats Card */}
                    <div className="space-y-4 sm:space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="glass backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          DJ Stats
                        </h3>
                        <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tracks</span>
                            <span className="text-white font-semibold">{totalTracks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sets</span>
                            <span className="text-white font-semibold">{totalSets}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Events</span>
                            <span className="text-white font-semibold">{totalEvents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Profile Views</span>
                            <span className="text-white font-semibold">{artistViews.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Avg Track Length</span>
                            <span className="text-white font-semibold">{Math.floor(averageTrackLength / 60)}:{(averageTrackLength % 60).toString().padStart(2, '0')}</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Plays</span>
                            <span className="text-white font-semibold">{djStats.totalPlays.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>


                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sets Section */}
          {sets && sets.length > 0 ? (
            <div className="pb-12 sm:pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest Sets</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
                <div className="space-y-4">
                  {setsEvents.slice(0, 3).map((event, index) => (
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
          ) : null}

          {/* Tracks Section */}
          {tracks && tracks.length > 0 ? (
            <div className="pb-12 sm:pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest Tracks</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
                
                <div className="space-y-4">
                  <AnimatePresence>
                    {tracks.slice(0, 5).map((track, index) => (
                                             <motion.div
                         key={track.id}
                         initial={{ opacity: 0, x: -30 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ duration: 0.6, delay: index * 0.1 }}
                         whileHover={{ scale: 1.02, x: 5 }}
                         className="glass backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu"
                       >
                         <div className="flex items-center gap-4 sm:gap-6">
                           <div className="flex-1 min-w-0">
                             <h3 className="text-lg sm:text-xl font-bold text-white mb-2 truncate">{track.title}</h3>
                             <p className="text-gray-400 mb-3 font-medium text-sm sm:text-base">{artist.name}</p>
                             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500">
                               {track.duration && (
                                 <div className="flex items-center gap-2">
                                   <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                   <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                                 </div>
                               )}
                               {track.release_date && (
                                 <div className="flex items-center gap-2">
                                   <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
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
                             className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-lg touch-manipulation flex-shrink-0"
                           >
                             {currentTrack === track.id && isPlaying ? (
                               <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                             ) : (
                               <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5 sm:ml-1" />
                             )}
                           </motion.button>
                         </div>
                       </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          ) : null}

          {/* Upcoming Events Section */}
          {upcomingEvents.length > 0 ? (
            <div className="pb-12 sm:pb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Upcoming Events</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
                
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                   <AnimatePresence>
                     {upcomingEvents.slice(0, 4).map((event, index) => (
                       <motion.div
                         key={event.id}
                         initial={{ opacity: 0, y: 30 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.6, delay: index * 0.1 }}
                         whileHover={{ scale: 1.02, y: -5 }}
                         className="glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu"
                       >
                         <div className="relative h-40 sm:h-48 overflow-hidden">
                           <img
                             src={event.image_url || '/placeholder.svg'}
                             alt={event.title}
                             className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                             onError={(e) => {
                               (e.target as HTMLImageElement).src = '/placeholder.svg';
                             }}
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                           
                           <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                             <span className="px-3 sm:px-4 py-1 sm:py-2 bg-green-500/90 text-white text-xs sm:text-sm font-bold rounded-full backdrop-blur-sm">
                               Upcoming
                             </span>
                           </div>
                         </div>
                         
                         <div className="p-4 sm:p-6">
                           <div className="flex items-center gap-3 mb-3">
                             <div className="flex items-center gap-2 text-gray-400 bg-white/5 px-2 sm:px-3 py-1 rounded-full">
                               <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                               <span className="text-xs sm:text-sm font-medium">{new Date(event.date).toLocaleDateString()}</span>
                             </div>
                           </div>
                           
                           <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{event.title}</h3>
                           <p className="text-gray-300 mb-3 font-medium text-sm sm:text-base">{event.location}</p>
                           <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{event.description?.slice(0, 100)}...</p>
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                 </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </div>
    </PageLayout>
  );
};

export default ArtistDetail; 
