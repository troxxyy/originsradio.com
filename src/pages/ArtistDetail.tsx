import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Star
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { getArtistById } from '@/data/artists';
import { Artist, Track, Event } from '@/types/artist';

const ArtistDetail = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (artistId) {
      const foundArtist = getArtistById(artistId);
      if (foundArtist) {
        setArtist(foundArtist);
      }
      setIsLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlayTrack = (track: Track) => {
    if (audioRef) {
      audioRef.pause();
    }

    const audio = new Audio(track.path);
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
      case 'spotify':
        return <ExternalLink className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </PageLayout>
    );
  }

  if (!artist) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Artist not found</h1>
            <button
              onClick={() => navigate('/artists')}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              Back to Artists
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/artists')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Artists
          </motion.button>
        </div>

        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10"
          >
            {/* Cover Image */}
            <div className="relative h-96 lg:h-[500px] overflow-hidden">
              <img
                src={artist.coverImage || artist.photo}
                alt={artist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Featured Badge */}
              {artist.featured && (
                <div className="absolute top-6 right-6">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Featured Artist
                  </div>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2">
                  <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                    {artist.name}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                      <span>{artist.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Music className="w-5 h-5" />
                      <span>{artist.tracks.length} track{artist.tracks.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {artist.genre.map(genre => (
                      <span
                        key={genre}
                        className="px-4 py-2 bg-white/10 rounded-full text-sm text-white/80 border border-white/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <p className="text-gray-300 text-lg leading-relaxed mb-8">
                    {artist.bio}
                  </p>

                  {/* Social Links */}
                  {artist.socialLinks && Object.keys(artist.socialLinks).length > 0 && (
                    <div className="flex gap-4">
                      {Object.entries(artist.socialLinks).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
                        >
                          {getSocialIcon(platform)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-6">
                  <div className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tracks</span>
                        <span className="text-white font-semibold">{artist.tracks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Events</span>
                        <span className="text-white font-semibold">{artist.events.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Genres</span>
                        <span className="text-white font-semibold">{artist.genre.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tracks Section */}
        {artist.tracks.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Tracks</h2>
              <div className="space-y-4">
                {artist.tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={track.coverArt}
                          alt={track.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">{track.title}</h3>
                        <p className="text-gray-400 mb-2">{track.artist}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {track.duration && <span>{track.duration}</span>}
                          {track.releaseDate && <span>{track.releaseDate}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (currentTrack === track.id && isPlaying) {
                            handlePauseTrack();
                          } else {
                            handlePlayTrack(track);
                          }
                        }}
                        className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                      >
                        {currentTrack === track.id && isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Events Section */}
        {artist.events.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8">Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artist.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{event.date}</span>
                        {event.upcoming && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Upcoming
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">{event.title}</h3>
                      <p className="text-gray-400 mb-3">{event.location}</p>
                      <p className="text-gray-300 text-sm line-clamp-3">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {event.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ArtistDetail; 