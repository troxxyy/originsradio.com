import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  MapPin, 
  Music, 
  Download, 
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Code
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

const ArtistManagementGuide = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BookOpen },
    { id: 'public', name: 'Public Pages', icon: Users },
    { id: 'admin', name: 'Admin Panel', icon: Settings },
    { id: 'data', name: 'Data Management', icon: Download },
    { id: 'examples', name: 'Code Examples', icon: Code }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Artist Management Guide
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Learn how to manage 100+ artists efficiently with our comprehensive system
            </p>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="glass backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">🎯 Key Features</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Manage 100+ artists efficiently</li>
                      <li>• Advanced search and filtering</li>
                      <li>• Pagination for performance</li>
                      <li>• Bulk operations</li>
                      <li>• Analytics and insights</li>
                      <li>• CSV import/export</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📊 Data Structure</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Artist profiles with photos</li>
                      <li>• Multiple categories</li>
                      <li>• Priority-based sorting</li>
                      <li>• Status management</li>
                      <li>• View tracking</li>
                      <li>• Social media links</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="glass backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Start</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Access Public Artists Page</h3>
                      <p className="text-gray-300">Visit <code className="bg-white/10 px-2 py-1 rounded">/artists</code> to see all artists</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Access Admin Panel</h3>
                      <p className="text-gray-300">Visit <code className="bg-white/10 px-2 py-1 rounded">/admin/artists</code> for management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Add Your Artists</h3>
                      <p className="text-gray-300">Use the data structure in <code className="bg-white/10 px-2 py-1 rounded">src/data/artists.ts</code></p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'public' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="glass backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Public Artists Page</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📍 URL: <code className="bg-white/10 px-2 py-1 rounded">/artists</code></h3>
                    <p className="text-gray-300">This is the public-facing page where visitors can browse all artists.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">🔍 Search & Filter</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-blue-400" />
                          <span className="text-white">Search by name, genre, location</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-green-400" />
                          <span className="text-white">Filter by category</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-purple-400" />
                          <span className="text-white">Filter by genre</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">Show featured only</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-red-400" />
                          <span className="text-white">Pagination controls</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">👤 Individual Artist Pages</h3>
                    <p className="text-gray-300">Click on any artist card to view their detailed profile at <code className="bg-white/10 px-2 py-1 rounded">/artists/[artist-id]</code></p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="glass backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Admin Panel</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📍 URL: <code className="bg-white/10 px-2 py-1 rounded">/admin/artists</code></h3>
                    <p className="text-gray-300">This is the management interface for handling 100+ artists.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📊 Dashboard Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-white">Total artists count</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white">Active artists</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">Featured artists</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                          <span className="text-white">Top viewed artists</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Download className="w-4 h-4 text-cyan-400" />
                          <span className="text-white">Export data</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">⚡ Bulk Operations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white">Activate multiple artists</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-white">Deactivate artists</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">Feature/unfeature</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-4 h-4 text-red-400" />
                          <span className="text-white">Delete artists</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="glass backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Data Management</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📁 File Structure</h3>
                    <div className="space-y-2 text-gray-300">
                      <p><code className="bg-white/10 px-2 py-1 rounded">src/data/artists.ts</code> - Main artist data</p>
                      <p><code className="bg-white/10 px-2 py-1 rounded">src/utils/artistManager.ts</code> - Management utilities</p>
                      <p><code className="bg-white/10 px-2 py-1 rounded">src/types/artist.ts</code> - TypeScript interfaces</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📤 Export Data</h3>
                    <div className="space-y-2 text-gray-300">
                      <p>• Export to CSV format</p>
                      <p>• Includes all artist fields</p>
                      <p>• Ready for spreadsheet editing</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📥 Import Data</h3>
                    <div className="space-y-2 text-gray-300">
                      <p>• Import from CSV files</p>
                      <p>• Automatic validation</p>
                      <p>• Error handling</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">🔄 Adding New Artists</h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
{`// Add to src/data/artists.ts
{
  id: 'new-artist',
  name: 'Artist Name',
  bio: 'Artist biography...',
  photo: '/team/artist.jpg',
  coverImage: '/album-art/cover.jpg',
  genre: ['Techno', 'House'],
  location: 'Ankara, Turkey',
  category: [ARTIST_CATEGORIES.LOCAL],
  priority: 5,
  status: 'active',
  createdAt: '2024-12-01',
  updatedAt: '2024-12-01',
  views: 0,
  featured: false,
  socialLinks: {
    instagram: 'https://instagram.com/artist',
    soundcloud: 'https://soundcloud.com/artist'
  },
  tracks: [],
  events: []
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'examples' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="glass backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">Code Examples</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">🔍 Search Artists</h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
{`import { searchArtists } from '@/data/artists';

// Search by name, bio, genre, location
const results = searchArtists('techno');`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📄 Pagination</h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
{`import { getPaginatedArtists } from '@/data/artists';

// Get page 1 with 12 artists, filtered by category
const { artists, total, pages } = getPaginatedArtists(1, 12, {
  category: 'featured',
  search: 'techno'
});`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📊 Analytics</h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
{`import { getArtistStats } from '@/data/artists';

// Get comprehensive statistics
const stats = getArtistStats();
console.log(stats.total); // Total artists
console.log(stats.byCategory); // Artists by category
console.log(stats.topViewed); // Top performers`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📤 Export Data</h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
{`import { exportArtistsToCSV } from '@/utils/artistManager';

// Export all artists to CSV
const csvData = exportArtistsToCSV(artists);
// Download the CSV file`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ArtistManagementGuide; 