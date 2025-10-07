import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  UserPlus,
  FileText,
  BookOpen,
  Tag
} from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import BlogManagement from '@/components/admin/BlogManagement';
import { 
  getPaginatedArtists, 
  getArtistStats, 
  addArtist,
  updateArtist,
  deleteArtist,
  bulkUpdateArtists,
  bulkDeleteArtists,
  exportArtistsData,
  type Artist,
  type ArtistInsert,
  type ArtistUpdate
} from '@/data/artists-supabase';

const AdminArtists = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'artists' | 'blogs'>('artists');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    location: string;
    bio: string;
    genre: string[];
    photo_url: string;
    featured: boolean;
    social_links: Record<string, any>;
  }>({
    name: '',
    location: '',
    bio: '',
    genre: [],
    photo_url: '',
    featured: false,
    social_links: {},
  });

  // Image upload states
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const itemsPerPage = 12;
  const queryClient = useQueryClient();

  // Get paginated and filtered artists
  const { data: artistsData, isLoading: artistsLoading, error: artistsError } = useQuery({
    queryKey: ['artists', currentPage, searchTerm, selectedLocation, selectedGenre],
    queryFn: () => getPaginatedArtists(currentPage, itemsPerPage, {
      featured: undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      genre: selectedGenre !== 'all' ? selectedGenre : undefined,
      search: searchTerm || undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const { artists = [], total = 0, pages = 0 } = artistsData || {};

  // Get stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['artist-stats'],
    queryFn: getArtistStats,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const addArtistMutation = useMutation({
    mutationFn: addArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artist-stats'] });
    },
  });

  const updateArtistMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ArtistUpdate }) => updateArtist(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artist-stats'] });
    },
  });

  const deleteArtistMutation = useMutation({
    mutationFn: deleteArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artist-stats'] });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: ArtistUpdate }) => 
      bulkUpdateArtists(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artist-stats'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteArtists,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artist-stats'] });
    },
  });

  // Get unique locations and genres for filters
  const locations = useMemo(() => {
    const locationSet = new Set<string>();
    artists.forEach(artist => {
      if (artist.location) {
        const location = artist.location.split(',')[0].trim();
        locationSet.add(location);
      }
    });
    return Array.from(locationSet).sort();
  }, [artists]);

  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    artists.forEach(artist => {
      if (artist.genre) {
        artist.genre.forEach(genre => genreSet.add(genre));
      }
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

  const handleBulkAction = async (action: 'feature' | 'unfeature' | 'delete') => {
    if (selectedArtists.length === 0) return;
    
    try {
      switch (action) {
        case 'feature':
          await bulkUpdateMutation.mutateAsync({ ids: selectedArtists, updates: { featured: true } });
          alert(`Marked ${selectedArtists.length} resident artist${selectedArtists.length !== 1 ? 's' : ''}`);
          break;
        case 'unfeature':
          await bulkUpdateMutation.mutateAsync({ ids: selectedArtists, updates: { featured: false } });
          alert(`Removed resident status from ${selectedArtists.length} artist${selectedArtists.length !== 1 ? 's' : ''}`);
          break;
        case 'delete':
          const deletedCount = await bulkDeleteMutation.mutateAsync(selectedArtists);
          alert(`Deleted ${deletedCount} artists`);
          break;
      }
      setSelectedArtists([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    }
  };

  const exportArtists = async () => {
    try {
      const dataStr = await exportArtistsData();
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
  const handleViewArtist = (artist: Artist) => {
    const slug = artist.name.toLowerCase().replace(/[^a-z0-9\s]+/g, '').replace(/\s+/g, '').trim();
    window.open(`/artists/${slug}`, '_blank');
  };

  const handleEditArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setFormData({
      name: artist.name,
      location: artist.location || '',
      bio: artist.bio || '',
      genre: artist.genre || [],
      photo_url: artist.photo_url || '',
      featured: artist.featured,
      social_links: artist.social_links || {},
    });
    setShowEditModal(true);
    console.log('Edit Modal Opened. Body classes:', document.body.className);
  };

  const handleDeleteArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setShowDeleteModal(true);
  };

  const handleAddArtist = () => {
    setFormData({
      name: '',
      location: '',
      bio: '',
      genre: [],
      photo_url: '',
      featured: false,
      social_links: {},
    });
    setShowAddModal(true);
    console.log('Add Modal Opened. Body classes:', document.body.className);
  };

  const handleSaveArtist = async (isEdit: boolean) => {
    try {
      if (isEdit && selectedArtist) {
        const updateData: ArtistUpdate = {
          name: formData.name,
          bio: formData.bio,
          photo_url: formData.photo_url,
          location: formData.location,
          genre: formData.genre,
          featured: formData.featured,
          social_links: formData.social_links,
        };
        
        const updated = await updateArtistMutation.mutateAsync({ id: selectedArtist.id, data: updateData });
        if (updated) {
          alert(`Updated artist: ${formData.name}`);
          setShowEditModal(false);
          setSelectedArtist(null);
          console.log('Edit Modal Closed. Body classes:', document.body.className);
        } else {
          alert('Error updating artist');
        }
      } else {
        const artistData: ArtistInsert = {
          name: formData.name,
          bio: formData.bio,
          photo_url: formData.photo_url,
          location: formData.location,
          genre: formData.genre,
          featured: formData.featured,
          social_links: formData.social_links,
        };
        
        const newArtist = await addArtistMutation.mutateAsync(artistData);
        if (newArtist) {
          alert(`Added artist: ${newArtist.name}`);
          setShowAddModal(false);
          console.log('Add Modal Closed. Body classes:', document.body.className);
        } else {
          alert('Error adding artist');
        }
      }
    } catch (error) {
      console.error('Error saving artist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error saving artist: ${errorMessage}`);
    }
  };

  const handleSelectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    // Enforce 5MB limit
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setImageError('Image exceeds 5MB limit');
      event.target.value = '';
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are allowed');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingImage(true);
      // Generate a path for Supabase Storage
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `artists/${Date.now()}-${safeName}`;

      // Lazy import to avoid circulars
      const { uploadImageFile } = await import('@/lib/supabase-utils');
      const publicUrl = await uploadImageFile(file, path);
      if (!publicUrl) {
        setImageError('Failed to upload image');
        return;
      }
      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
    } catch (err) {
      setImageError('Unexpected error uploading image');
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedArtist) {
      try {
        const success = await deleteArtistMutation.mutateAsync(selectedArtist.id);
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

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        
        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('artists')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'artists'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Artists
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'blogs'
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              Blog Posts
            </button>
          </div>
        </div>

        {activeTab === 'artists' ? (
          <div>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Artist Management</h1>
                  <p className="text-gray-400">
                    {artistsLoading ? 'Loading artists...' : `Manage ${total} artists in your database`}
                  </p>
                  {artistsError && (
                    <p className="text-red-400 text-sm mt-1">Error loading artists: {artistsError.message}</p>
                  )}
                </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAddArtist}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Artist
              </button>
                  <a
                    href="/artistcontrolsecret/schedule"
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Manage Weekly Radio Schedule
                  </a>
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
                    <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Artists</p>
                    <p className="text-2xl font-bold text-white">{stats?.active || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Resident Artists</p>
                    <p className="text-2xl font-bold text-white">{stats?.featured || 0}</p>
                  </div>
                  <Star className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Inactive</p>
                    <p className="text-2xl font-bold text-white">{stats?.inactive || 0}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
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
                    onClick={() => handleBulkAction('feature')}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                  >
                    Mark Resident
                  </button>
                  <button
                    onClick={() => handleBulkAction('unfeature')}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                  >
                    Unfeature
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                  >
                    Delete
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
                        aria-label="Select all artists"
                        title="Select all artists"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Artist</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Location</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Genres</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Created</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artistsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          <p className="text-gray-400">Loading artists...</p>
                        </div>
                      </td>
                    </tr>
                  ) : artistsError ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Music className="w-12 h-12 text-red-400" />
                          <p className="text-red-400">Error loading artists: {artistsError.message}</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : artists.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Music className="w-12 h-12 text-gray-500" />
                          <p className="text-gray-400">No artists found</p>
                          <p className="text-gray-500 text-sm">Add your first artist to get started</p>
                          <button 
                            onClick={handleAddArtist}
                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Artist
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    artists.map((artist, index) => (
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
                            aria-label={`Select ${artist.name}`}
                            title={`Select ${artist.name}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={artist.photo_url || '/placeholder.svg'}
                              alt={artist.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-white">{artist.name}</div>
                              <div className="text-sm text-gray-400">
                                {artist.genre && artist.genre.length > 0 
                                  ? artist.genre.slice(0, 2).join(', ') 
                                  : 'No genres'
                                }
                              </div>
                            </div>
                            {artist.featured && (
                              <Star className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white">{artist.location || 'No location'}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {artist.featured ? (
                              <span className="px-2 py-1 bg-red-500/20 rounded-full text-xs text-red-400 border border-red-500/20">
                                Resident
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-500/10 rounded-full text-xs text-gray-400 border border-gray-500/20">
                                Regular
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-white">{artist.genre?.length || 0} genres</td>
                        <td className="px-6 py-4 text-white">{new Date(artist.created_at).toLocaleDateString()}</td>
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
                    ))
                  )}
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
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {showAddModal ? <UserPlus className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
                  {showAddModal ? 'Add New Artist' : 'Edit Artist'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="artist-name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                      id="artist-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter artist name"
                      title="Artist name"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="artist-location" className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      id="artist-location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter artist location"
                      title="Artist location"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    placeholder="Enter artist bio..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Artist Photo</label>
                  {/* Preview */}
                  {formData.photo_url && (
                    <div className="mb-3">
                      <img
                        src={formData.photo_url}
                        alt="Artist preview"
                        className="w-24 h-24 rounded-lg object-cover border border-white/10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                  {/* Upload controls */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectImage}
                    aria-label="Select artist image to upload"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      {isUploadingImage ? 'Uploading…' : 'Upload Image (max 5MB)'}
                    </button>
                    <span className="text-xs text-gray-500">or paste a URL</span>
                  </div>
                  {/* Optional URL input fallback */}
                  <input
                    id="photo_url"
                    type="text"
                    value={formData.photo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                    placeholder="https://…"
                    className="mt-2 w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                  {imageError && (
                    <p className="text-xs text-red-400 mt-1">{imageError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Abstract',
                      'Acid House',
                      'Acid Techno',
                      'Afrobeat',
                      'Afrobeats',
                      'Amapiano',
                      'Ambient / Drone',
                      'Atmospheric',
                      'Baile Funk',
                      'Balearic',
                      'Ballroom',
                      'Bass',
                      'Batida',
                      'Big Room',
                      'Blend',
                      'Breaks',
                      'Changa Tuki / Bubbling',
                      'Chicago House',
                      'Dancehall / Reggae',
                      'Dark Disco',
                      'Dark Wave',
                      'Deconstructed Club',
                      'Deep Electro',
                      'Deep House',
                      'Deep Techno',
                      'Detroit House',
                      'Detroit Techno',
                      'Disco / Nu-Disco',
                      'Downtempo',
                      'Driving',
                      'Drum & Bass / Jungle',
                      'Dub',
                      'Dub Techno',
                      'Dubstep',
                      'Easy Listening',
                      'EBM (Electronic Body Music)',
                      'Electro',
                      'Electroclash',
                      'Electronica',
                      'Euro Dance',
                      'Euro House',
                      'Euro Trance',
                      'Experimental',
                      'Footwork',
                      'Fundraising',
                      'Funk / Soul',
                      'G House',
                      'G Tech',
                      'Gabber',
                      'Garage House',
                      'Glitch',
                      'Goth',
                      'Gqom',
                      'Grime',
                      'Hard Dance',
                      'Hard Groove',
                      'Hard House',
                      'Hard Techno',
                      'Hardcore',
                      'Hi-NRG',
                      'Hip Hop / R&B',
                      'Hip House',
                      'House',
                      'Hybrid Show',
                      'Hyperpop',
                      'Hypnotic',
                      'IDM (Intelligent Dance Music)',
                      'Indie Dance',
                      'Industrial',
                      'Industrial Techno',
                      'Italo Body Music',
                      'Italo Disco',
                      'Italo House',
                      'Jackin House',
                      'Jazz / World',
                      'Jersey / Baltimore Club',
                      'Leftfield',
                      'Liquid House',
                      'Live Show',
                      'Metal',
                      'Middle Eastern',
                      'Minimal',
                      'Minimal House',
                      'Minimal Techno',
                      'Neo Soul',
                      'New Beat',
                      'New Wave',
                      'Noise',
                      'Old School',
                      'Post Punk',
                      'Power Electronics',
                      'Power House',
                      'Psy / Goa Trance',
                      'Rave',
                      'Raw',
                      'Reggaeton',
                      'Schranz',
                      'Slow Burners',
                      'Slow Jamz',
                      'Soulful House',
                      'Soundtrack',
                      'Speed Garage',
                      'Street Soul',
                      'Synth Pop',
                      'Synth Wave',
                      'Talks',
                      'Tech House',
                      'Techno',
                      'Trance',
                      'Trap',
                      'Tribal',
                      'Trip Hop',
                      'UK Bass',
                      'UK Funky',
                      'UK Garage',
                      'Zouk',
                    ].map(genre => (
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Resident Artist</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-white/20 bg-white/10"
                    />
                    <label htmlFor="featured" className="text-sm text-gray-300">
                      Mark as resident artist
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Social Links</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="instagram" className="block text-xs text-gray-400 mb-1">Instagram</label>
                      <input
                        id="instagram"
                        type="url"
                        inputMode="url"
                        placeholder="https://instagram.com/artist"
                        value={(formData.social_links as any)?.instagram || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social_links: { ...(prev.social_links || {}), instagram: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="soundcloud" className="block text-xs text-gray-400 mb-1">SoundCloud</label>
                      <input
                        id="soundcloud"
                        type="url"
                        inputMode="url"
                        placeholder="https://soundcloud.com/artist"
                        value={(formData.social_links as any)?.soundcloud || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social_links: { ...(prev.social_links || {}), soundcloud: e.target.value }
                        }))}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Paste full profile URLs. Only Instagram and SoundCloud are needed.</p>
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
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    console.log('Add/Edit Modal Cancelled. Body classes:', document.body.className);
                  }}
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
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ touchAction: 'auto' }}
            onTouchStart={(e) => { e.stopPropagation(); }}
            onTouchMove={(e) => { e.stopPropagation(); }}
            onTouchEnd={(e) => { e.stopPropagation(); }}
            onPointerDown={(e) => { e.stopPropagation(); }}
            onPointerMove={(e) => { e.stopPropagation(); }}
            onMouseDown={(e) => { e.stopPropagation(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ touchAction: 'auto' }}
              onTouchStart={(e) => { e.stopPropagation(); }}
              onTouchMove={(e) => { e.stopPropagation(); }}
              onTouchEnd={(e) => { e.stopPropagation(); }}
              onPointerDown={(e) => { e.stopPropagation(); }}
              onPointerMove={(e) => { e.stopPropagation(); }}
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
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <BlogManagement />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default AdminArtists; 