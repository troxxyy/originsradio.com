import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Save,
  FileText,
  BookOpen,
  Tag,
  Upload
} from 'lucide-react';
import {
  getPaginatedBlogs,
  getBlogStats,
  addBlog,
  updateBlog,
  deleteBlog,
  bulkDeleteBlogs,
  uploadBlogImage,
  generateSlug,
  type Blog,
  type BlogInsert,
  type BlogUpdate,
  type BlogStats
} from '@/data/blogs-supabase';

const BlogManagement = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    author: string;
    cover_image_url: string;
    status: 'draft' | 'published';
    featured: boolean;
    tags: string[];
    seo_title: string;
    seo_description: string;
  }>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: '',
    cover_image_url: '',
    status: 'draft',
    featured: false,
    tags: [],
    seo_title: '',
    seo_description: '',
  });
  
  const [tagInput, setTagInput] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const itemsPerPage = 12;

  // Queries
  const { data: blogsData, isLoading: blogsLoading, error: blogsError, refetch: refetchBlogs } = useQuery({
    queryKey: ['blogs', currentPage, searchTerm, statusFilter],
    queryFn: () => getPaginatedBlogs(currentPage, itemsPerPage, searchTerm, statusFilter),
  });

  const { data: stats } = useQuery<BlogStats>({
    queryKey: ['blogStats'],
    queryFn: getBlogStats,
  });

  const blogs = blogsData?.data || [];
  const total = blogsData?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  // Mutations
  const addMutation = useMutation({
    mutationFn: addBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogStats'] });
      setShowAddModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BlogUpdate }) => updateBlog(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogStats'] });
      setShowEditModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogStats'] });
      setShowDeleteModal(false);
      setSelectedBlog(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: bulkDeleteBlogs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogStats'] });
      setSelectedBlogs([]);
    },
  });

  // Handlers
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author: '',
      cover_image_url: '',
      status: 'draft',
      featured: false,
      tags: [],
      seo_title: '',
      seo_description: '',
    });
    setTagInput('');
    setImageError(null);
  };

  const handleAddBlog = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || '',
      author: blog.author,
      cover_image_url: blog.cover_image_url || '',
      status: blog.status,
      featured: blog.featured,
      tags: blog.tags || [],
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setShowDeleteModal(true);
  };

  const handleSubmitAdd = async () => {
    if (!formData.title || !formData.content || !formData.author) {
      alert('Please fill in all required fields');
      return;
    }

    const blogData: BlogInsert = {
      title: formData.title,
      slug: formData.slug || generateSlug(formData.title),
      content: formData.content,
      excerpt: formData.excerpt || undefined,
      author: formData.author,
      cover_image_url: formData.cover_image_url || undefined,
      status: formData.status,
      featured: formData.featured,
      tags: formData.tags,
      seo_title: formData.seo_title || undefined,
      seo_description: formData.seo_description || undefined,
    };

    await addMutation.mutateAsync(blogData);
  };

  const handleSubmitEdit = async () => {
    if (!selectedBlog || !formData.title || !formData.content || !formData.author) {
      alert('Please fill in all required fields');
      return;
    }

    const updates: BlogUpdate = {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      excerpt: formData.excerpt || undefined,
      author: formData.author,
      cover_image_url: formData.cover_image_url || undefined,
      status: formData.status,
      featured: formData.featured,
      tags: formData.tags,
      seo_title: formData.seo_title || undefined,
      seo_description: formData.seo_description || undefined,
    };

    await updateMutation.mutateAsync({ id: selectedBlog.id, updates });
  };

  const handleConfirmDelete = async () => {
    if (selectedBlog) {
      await deleteMutation.mutateAsync(selectedBlog.id);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBlogs.length > 0) {
      if (confirm(`Are you sure you want to delete ${selectedBlogs.length} blog(s)?`)) {
        await bulkDeleteMutation.mutateAsync(selectedBlogs);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size should be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    setImageError(null);

    try {
      const imageUrl = await uploadBlogImage(file);
      if (imageUrl) {
        setFormData(prev => ({ ...prev, cover_image_url: imageUrl }));
      } else {
        setImageError('Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setImageError('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Blog Management</h2>
            <p className="text-gray-400">
              {blogsLoading ? 'Loading blogs...' : `Manage ${total} blog posts in your database`}
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAddBlog}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Blog Post
            </button>
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Posts</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Published</p>
                  <p className="text-2xl font-bold text-white">{stats.published}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Drafts</p>
                  <p className="text-2xl font-bold text-white">{stats.drafts}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="glass backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Featured</p>
                  <p className="text-2xl font-bold text-white">{stats.featured}</p>
                </div>
                <BookOpen className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-8">
        <div className="glass backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBlogs.length > 0 && (
        <div className="mb-6">
          <div className="glass backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white">
                {selectedBlogs.length} blog{selectedBlogs.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedBlogs([])}
                  className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-sm hover:bg-gray-500/30 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blogs Table */}
      <div className="glass backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBlogs.length === blogs.length && blogs.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBlogs(blogs.map(b => b.id));
                      } else {
                        setSelectedBlogs([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-white/20"
                    aria-label="Select all blogs"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Author</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Featured</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBlogs.includes(blog.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBlogs([...selectedBlogs, blog.id]);
                        } else {
                          setSelectedBlogs(selectedBlogs.filter(id => id !== blog.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20"
                      aria-label={`Select ${blog.title}`}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {blog.cover_image_url && (
                        <img src={blog.cover_image_url} alt="" className="w-12 h-12 rounded object-cover" />
                      )}
                      <div>
                        <p className="text-white font-medium">{blog.title}</p>
                        <p className="text-gray-400 text-sm">{blog.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{blog.author}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      blog.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {blog.featured ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(blog.published_at || blog.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit"
                        aria-label={`Edit ${blog.title}`}
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Delete"
                        aria-label={`Delete ${blog.title}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {blogs.length === 0 && !blogsLoading && (
            <div className="text-center py-12 text-gray-400">
              No blogs found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {showAddModal ? 'Add New Blog Post' : 'Edit Blog Post'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-white mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Enter blog title"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-white mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="url-friendly-slug"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-white mb-2">Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Author name"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-white mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                  placeholder="Short summary for blog list"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-white mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none font-mono"
                  placeholder="Write your blog content here..."
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-white mb-2">Cover Image</label>
                <div className="flex gap-4">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Upload cover image"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                  </button>
                  {formData.cover_image_url && (
                    <img src={formData.cover_image_url} alt="Preview" className="h-20 w-20 object-cover rounded" />
                  )}
                </div>
                {imageError && <p className="text-red-400 text-sm mt-2">{imageError}</p>}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/20 text-white rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status and Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                    aria-label="Blog post status"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-8">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-5 h-5 rounded border-white/20"
                  />
                  <label htmlFor="featured" className="text-white cursor-pointer">Featured Post</label>
                </div>
              </div>

              {/* SEO Fields */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h4 className="text-lg font-semibold text-white">SEO Settings</h4>
                <div>
                  <label className="block text-white mb-2">SEO Title</label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="SEO optimized title"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">SEO Description</label>
                  <textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                    placeholder="Meta description for search engines"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={showAddModal ? handleSubmitAdd : handleSubmitEdit}
                  disabled={addMutation.isPending || updateMutation.isPending}
                  className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {(addMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Blog'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "<strong>{selectedBlog.title}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBlog(null);
                }}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;

