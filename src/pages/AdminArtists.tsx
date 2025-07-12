import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Calendar,
  MapPin,
  Music,
  Users,
  TrendingUp,
  Download,
  Upload,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Save,
  UserPlus
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { 
  getPaginatedArtists, 
  getArtistStats, 
  ARTIST_CATEGORIES,
  addArtist,
  updateArtist,
  deleteArtist,
  bulkUpdateArtists,
  bulkDeleteArtists,
  exportArtistsData,
  type ManagedArtist,
  type ArtistCategory 
} from '@/data/artists';

const AdminArtists = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArtistCategory | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'views' | 'createdAt'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ManagedArtist | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    photo: '',
    coverImage: '',
    genre: [] as string[],
    location: '',
    category: [] as ArtistCategory[],
    priority: 5,
    status: 'active' as 'active' | 'inactive' | 'pending',
    featured: false,
    tracks: [],
    events: [],
    socialLinks: {
      instagram: '',
      soundcloud: '',
      spotify: '',
    }
  });

  const itemsPerPage = 12;

  // Get paginated and filtered artists
  const { artists, total, pages } = useMemo(() => {
    return getPaginatedArtists(currentPage, itemsPerPage, {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      genre: selectedGenre !== 'all' ? selectedGenre : undefined,
      search: searchTerm || undefined,
    });
  }, [currentPage, searchTerm, selectedCategory, selectedLocation, selectedGenre, itemsPerPage]);

  // Get stats
  const stats = useMemo(() => getArtistStats(), []);

  // Get unique locations and genres for filters
  const locations = useMemo(() => {
    const locationSet = new Set<string>();
    artists.forEach(artist => {
      const location = artist.location.split(',')[0].trim();
      locationSet.add(location);
    });
    return Array.from(locationSet).sort();
  }, [artists]);

  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    artists.forEach(artist => {
      artist.genre.forEach(genre => genreSet.add(genre));
    });
    return Array.from(genreSet).sort();
  }, [artists]);

  const handleSelectArtist = (artistId: string) => {
    setSelectedArtists(prev => 
      prev.includes(artistId) 
        ? prev.filter(id => id !== artistId)
        : [...prev, artistId]
    );
  };

  const handleSelectAll = () => {
    if (selectedArtists.length === artists.length) {
      setSelectedArtists([]);
    } else {
      setSelectedArtists(artists.map(artist => artist.id));
    }
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete') => {
    if (selectedArtists.length === 0) return;
    
    try {
      switch (action) {
        case 'activate':
          bulkUpdateArtists(selectedArtists, { status: 'active' });
          alert(`Activated ${selectedArtists.length} artists`);
          break;
        case 'deactivate':
          bulkUpdateArtists(selectedArtists, { status: 'inactive' });
          alert(`Deactivated ${selectedArtists.length} artists`);
          break;
        case 'feature':
          bulkUpdateArtists(selectedArtists, { featured: true });
          alert(`Featured ${selectedArtists.length} artists`);
          break;
        case 'unfeature':
          bulkUpdateArtists(selectedArtists, { featured: false });
          alert(`Unfeatured ${selectedArtists.length} artists`);
          break;
        case 'delete':
          const deletedCount = bulkDeleteArtists(selectedArtists);
          alert(`Deleted ${deletedCount} artists`);
          break;
      }
      setSelectedArtists([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    }
  };

  const exportArtists = () => {
    try {
      const dataStr = exportArtistsData();
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'artists-export.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting artists:', error);
      alert('Error exporting artists');
    }
  };

  // Action handlers
  const handleViewArtist = (artist: ManagedArtist) => {
    // Navigate to artist detail page
    window.open(`/artists/${artist.id}`, '_blank');
  };

  const handleEditArtist = (artist: ManagedArtist) => {
    setSelectedArtist(artist);
    setFormData({
      name: artist.name,
      bio: artist.bio,
      photo: artist.photo,
      coverImage: artist.coverImage,
      genre: artist.genre,
      location: artist.location,
      category: artist.category,
      priority: artist.priority,
      status: artist.status,
      featured: artist.featured,
      tracks: artist.tracks,
      events: artist.events,
      socialLinks: {
        instagram: artist.socialLinks.instagram || '',
        soundcloud: artist.socialLinks.soundcloud || '',
        spotify: artist.socialLinks.spotify || '',
      }
    });
    setShowEditModal(true);
  };

  const handleDeleteArtist = (artist: ManagedArtist) => {
    setSelectedArtist(artist);
    setShowDeleteModal(true);
  };

  const handleAddArtist = () => {
    setFormData({
      name: '',
      bio: '',
      photo: '',
      coverImage: '',
      genre: [],
      location: '',
      category: [],
      priority: 5,
      status: 'active',
      featured: false,
      tracks: [],
      events: [],
      socialLinks: {
        instagram: '',
        soundcloud: '',
        spotify: '',
      }
    });
    setShowAddModal(true);
  };

  const handleSaveArtist = (isEdit: boolean) => {
    try {
      if (isEdit && selectedArtist) {
        // Update existing artist
        const updated = updateArtist(selectedArtist.id, formData);
        if (updated) {
          alert(`Updated artist: ${formData.name}`);
          setShowEditModal(false);
          setSelectedArtist(null);
        } else {
          alert('Error updating artist');
        }
      } else {
        // Add new artist
        const newArtist = addArtist(formData);
        alert(`Added artist: ${newArtist.name}`);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error saving artist:', error);
      alert('Error saving artist');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedArtist) {
      try {
        const success = deleteArtist(selectedArtist.id);
        if (success) {
          alert(`Deleted artist: ${selectedArtist.name}`);
          setShowDeleteModal(false);
          setSelectedArtist(null);
        } else {
          alert('Error deleting artist');
        }
      } catch (error) {
        console.error('Error deleting artist:', error);
        alert('Error deleting artist');
      }
    }
  };

  const handleGenreChange = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }));
  };

  const handleCategoryChange = (category: ArtistCategory) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Artist Management</h1>
              <p className="text-gray-400">Manage {total} artists in your database</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAddArtist}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Artist
              </button>
              <button 
                onClick={exportArtists}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        {showStats && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Artists</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Artists</p>
                    <p className="text-2xl font-bold text-white">{stats.active}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Featured Artists</p>
                    <p className="text-2xl font-bold text-white">{stats.featured}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Top Viewed</p>
                    <p className="text-2xl font-bold text-white">{stats.topViewed[0]?.views || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ArtistCategory | 'all')}
                  className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                  title="Filter by category"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(ARTIST_CATEGORIES).map(([key, value]) => (
                    <option key={value} value={value}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                  title="Filter by location"
                  aria-label="Filter by location"
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Genre Filter */}
              <div className="relative">
                <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                  title="Filter by genre"
                  aria-label="Filter by genre"
                >
                  <option value="all">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'inactive' | 'pending')}
                  className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                  title="Filter by status"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedArtists.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="glass backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-white">
                  {selectedArtists.length} artist{selectedArtists.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction('feature')}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-500/30 transition-all"
                  >
                    Feature
                  </button>
                  <button
                    onClick={() => setSelectedArtists([])}
                    className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Artists Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="glass backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedArtists.length === artists.length && artists.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-white/20 bg-white/10"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Artist</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Location</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Views</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Priority</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map((artist, index) => (
                    <motion.tr
                      key={artist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedArtists.includes(artist.id)}
                          onChange={() => handleSelectArtist(artist.id)}
                          className="rounded border-white/20 bg-white/10"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={artist.photo}
                            alt={artist.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div>
                            <div className="font-semibold text-white">{artist.name}</div>
                            <div className="text-sm text-gray-400">{artist.genre.slice(0, 2).join(', ')}</div>
                          </div>
                          {artist.featured && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">{artist.location}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {artist.category.slice(0, 2).map(cat => (
                            <span
                              key={cat}
                              className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20"
                            >
                              {cat}
                            </span>
                          ))}
                          {artist.category.length > 2 && (
                            <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/80 border border-white/20">
                              +{artist.category.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          artist.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : artist.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {artist.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{artist.views.toLocaleString()}</td>
                      <td className="px-6 py-4 text-white">{artist.priority}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewArtist(artist)}
                            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                            title="View Artist"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditArtist(artist)}
                            className="p-1 text-green-400 hover:text-green-300 transition-colors"
                            title="Edit Artist"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteArtist(artist)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete Artist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} artists
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-white">
                Page {currentPage} of {pages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pages, prev + 1))}
                disabled={currentPage === pages}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {showAddModal ? <UserPlus className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                  {showAddModal ? 'Add New Artist' : 'Edit Artist'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false) || setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Photo URL</label>
                    <input
                      type="text"
                      value={formData.photo}
                      onChange={(e) => setFormData(prev => ({ ...prev, photo: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image URL</label>
                    <input
                      type="text"
                      value={formData.coverImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {['Techno', 'House', 'Electronic', 'Ambient', 'Deep House', 'Progressive', 'Industrial Techno', 'Atmospheric'].map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleGenreChange(genre)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          formData.genre.includes(genre)
                            ? 'bg-blue-500/20 text-blue-400 border-blue-400/30'
                            : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ARTIST_CATEGORIES).map(([key, value]) => (
                      <button
                        key={value}
                        onClick={() => handleCategoryChange(value)}
                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                          formData.category.includes(value)
                            ? 'bg-green-500/20 text-green-400 border-green-400/30'
                            : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'pending' }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Social Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Instagram"
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <input
                      type="text"
                      placeholder="SoundCloud"
                      value={formData.socialLinks.soundcloud}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, soundcloud: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                    <input
                      type="text"
                      placeholder="Spotify"
                      value={formData.socialLinks.spotify}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, spotify: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleSaveArtist(showEditModal)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {showEditModal ? 'Update Artist' : 'Add Artist'}
                </button>
                <button
                  onClick={() => setShowAddModal(false) || setShowEditModal(false)}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedArtist && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Delete Artist</h2>
              </div>
              
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">{selectedArtist.name}</span>? 
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                >
                  Delete Artist
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminArtists; 