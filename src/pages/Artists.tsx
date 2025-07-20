import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
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

  // SEO Data
  const seoData = {
    title: "Artists & DJs - Origins Radio | Ankara's Underground Music Scene",
    description: "Discover talented DJs and music producers from Ankara's underground music scene. Listen to the latest tracks, sets, and performances from featured artists on Origins Radio.",
    keywords: "DJs, music producers, Ankara, underground music, techno, house, electronic music, Origins Radio, Turkey, artists, musicians",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Artists & DJs",
      "description": "Featured DJs and music producers from Ankara's underground music scene",
      "url": "https://originsradio.com/artists",
      "numberOfItems": artists?.length || 0,
      "itemListElement": artists?.map((artist, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Person",
          "name": artist.name,
          "description": artist.bio || `Professional DJ ${artist.name}`,
          "url": `https://originsradio.com/artists/${generateSlug(artist.name)}`,
          "image": artist.photo_url || "/placeholder.svg",
          "jobTitle": "DJ & Music Producer",
          "worksFor": {
            "@type": "Organization",
            "name": "Origins Radio"
          }
        }
      })) || []
    }
  };

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:url" content="https://originsradio.com/artists" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/originslogo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content="/originslogo.png" />
        <link rel="canonical" href="https://originsradio.com/artists" />
      </Helmet>

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              {/* Featured Filter */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                  className={`px-4 py-3 rounded-lg transition-all flex items-center gap-2 ${
                    showFeaturedOnly
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Featured Only
                </button>
              </div>
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
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {artist.name}
                      </h3>
                      
                      {artist.location && (
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{artist.location}</span>
                        </div>
                      )}

                      {artist.genre && artist.genre.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {artist.genre.slice(0, 3).map((genre, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}

                      {artist.bio && (
                        <p className="text-gray-400 text-sm leading-relaxed flex-1">
                          {artist.bio.length > 100 ? `${artist.bio.slice(0, 100)}...` : artist.bio}
                        </p>
                      )}

                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>View Profile</span>
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Artists; 