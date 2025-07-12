import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Music, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { getPaginatedArtists, getFeaturedArtists, ARTIST_CATEGORIES, type ManagedArtist, type ArtistCategory } from '@/data/artists';

const Artists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<ArtistCategory | 'all'>('all');

  // Get paginated artists
  const { artists: allArtists, total, pages } = useMemo(() => {
    return getPaginatedArtists(currentPage, 12, {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: searchTerm || undefined,
    });
  }, [currentPage, searchTerm, selectedCategory]);

  const featuredArtists = getFeaturedArtists();

  // Filter artists based on search and filters
  const filteredArtists = useMemo(() => {
    let filtered = showFeaturedOnly ? featuredArtists : allArtists;
    return filtered;
  }, [allArtists, featuredArtists, showFeaturedOnly]);

  const handleArtistClick = (artistId: string) => {
    navigate(`/artists/${artistId}`);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
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

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search artists or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ArtistCategory | 'all')}
                  className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all appearance-none cursor-pointer"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(ARTIST_CATEGORIES).map(([key, value]) => (
                    <option key={value} value={value}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Featured Toggle */}
              <button
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={`px-6 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                  showFeaturedOnly
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/15 hover:border-white/25'
                }`}
              >
                <Star className="w-5 h-5" />
                Featured Only
              </button>
            </div>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {filteredArtists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No artists found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleArtistClick(artist.id)}
                  className="group cursor-pointer"
                >
                  <div className="glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu hover:scale-105">
                    {/* Artist Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={artist.coverImage || artist.photo}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Featured Badge */}
                      {artist.featured && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Featured
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artist Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                        {artist.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{artist.location}</span>
                      </div>

                      <p className="text-gray-400 text-sm line-clamp-3">
                        {artist.bio}
                      </p>

                      {/* Track Count */}
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm text-gray-400">
                          <span>{artist.tracks.length} track{artist.tracks.length !== 1 ? 's' : ''}</span>
                          <span>{artist.events.length} event{artist.events.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center mt-12">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          currentPage === page
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pages, prev + 1))}
                  disabled={currentPage === pages}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="text-center mt-8 text-gray-400">
            Showing {filteredArtists.length} of {total} artists
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Artists; 