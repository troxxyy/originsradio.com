import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Music, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { useArtists } from '@/hooks/use-supabase';
import { generateSlug } from '@/lib/supabase-utils';

const Artists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch artists from Supabase
  const { data: artists, isLoading, error } = useArtists();

  // Filter artists based on search and featured filter
  const filteredArtists = useMemo(() => {
    if (!artists) return [];
    
    let filtered = artists.filter(artist => 
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.bio && artist.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Apply featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(artist => artist.featured);
    }
    
    return filtered;
  }, [artists, searchTerm, showFeaturedOnly]);

  const handleArtistClick = (artist: any) => {
    const slug = generateSlug(artist.name);
    navigate(`/artists/${slug}`);
  };

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
                Artists
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Discover the talented artists behind the music that defines Origins Radio
              </p>
            </motion.div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                />
              </div>
              
              {/* Featured Filter Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  showFeaturedOnly 
                    ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 text-black border-yellow-400/50 shadow-lg' 
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <Star className={`w-4 h-4 ${showFeaturedOnly ? 'fill-current' : ''}`} />
                <span className="font-medium text-sm">
                  {showFeaturedOnly ? 'Featured Only' : 'Show All'}
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Loading artists...</h3>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">Error loading artists</h3>
              <p className="text-gray-400">{error.message}</p>
            </motion.div>
          ) : filteredArtists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No artists found</h3>
              <p className="text-gray-400">Try adjusting your search</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {filteredArtists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleArtistClick(artist)}
                  className="group cursor-pointer h-full"
                >
                  <div className="glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu hover:scale-105 h-full flex flex-col">
                    {/* Artist Image */}
                    <div className="relative h-64 overflow-hidden flex-shrink-0">
                      <img
                        src={artist.photo_url || '/placeholder.svg'}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Featured Badge on Photo */}
                      {artist.featured && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.8 }}
                          className="absolute top-3 left-3 z-10"
                        >
                          <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg border border-white/20">
                            <Star className="w-3 h-3 fill-current" />
                            <span>FEATURED</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Artist Info */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                        {artist.name}
                      </h3>
                      
                      {artist.bio && (
                        <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-1">
                          {artist.bio}
                        </p>
                      )}

                      {/* Artist details */}
                      <div className="mt-auto pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {artist.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {artist.location}
                            </span>
                          )}
                        </div>
                        {artist.genre && artist.genre.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {artist.genre.slice(0, 3).map(genre => (
                              <span
                                key={genre}
                                className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80"
                              >
                                {genre}
                              </span>
                            ))}
                            {artist.genre.length > 3 && (
                              <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80">
                                +{artist.genre.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Results Info */}
          <div className="text-center mt-8 text-gray-400">
            Showing {filteredArtists.length} of {artists?.length || 0} artists
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Artists; 