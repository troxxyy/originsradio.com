import { supabase, supabaseAdmin } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Blog = Database['public']['Tables']['blogs']['Row'];
export type BlogInsert = Database['public']['Tables']['blogs']['Insert'];
export type BlogUpdate = Database['public']['Tables']['blogs']['Update'];

export interface BlogStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
}

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Get published blogs (public access)
export const getPublishedBlogs = async (
  page: number = 1,
  limit: number = 10
): Promise<{ blogs: Blog[], total: number }> => {
  if (!supabase) {
    console.warn('Supabase is not configured, returning empty blogs array');
    return { blogs: [], total: 0 };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('blogs')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching published blogs:', error);
    throw error;
  }

  return { blogs: data || [], total: count || 0 };
};

// Get all blogs (admin access)
export const getAllBlogs = async (
  page: number = 1,
  limit: number = 10
): Promise<{ blogs: Blog[], total: number }> => {
  if (!supabaseAdmin) {
    console.warn('Supabase admin is not configured, returning empty blogs array');
    return { blogs: [], total: 0 };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from('blogs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching all blogs:', error);
    throw error;
  }

  return { blogs: data || [], total: count || 0 };
};

// Get paginated blogs with filters (admin)
export const getPaginatedBlogs = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
  statusFilter?: 'all' | 'published' | 'draft',
  featuredFilter?: boolean
): Promise<{ data: Blog[], total: number }> => {
  if (!supabaseAdmin) {
    console.warn('Supabase admin is not configured, returning empty paginated blogs array');
    return { data: [], total: 0 };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('blogs')
    .select('*', { count: 'exact' });

  // Apply search filter
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,author.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
  }

  // Apply status filter
  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  // Apply featured filter
  if (featuredFilter !== undefined) {
    query = query.eq('featured', featuredFilter);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching paginated blogs:', error);
    throw error;
  }

  return { data: data || [], total: count || 0 };
};

// Get blog by slug (public access)
export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
  if (!supabase) {
    console.warn('Supabase is not configured, returning null for blog by slug');
    return null;
  }

  console.log('Querying blogs table...');
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  console.log('Query result:', { data, error });

  if (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }

  return data;
};

// Get blog by ID (admin access)
export const getBlogById = async (id: string): Promise<Blog | null> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching blog by ID:', error);
    return null;
  }

  return data;
};

// Get related blogs by tags
export const getRelatedBlogs = async (blogId: string, tags: string[], limit: number = 3): Promise<Blog[]> => {
  if (!supabase || tags.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .neq('id', blogId)
    .overlaps('tags', tags)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related blogs:', error);
    return [];
  }

  return data || [];
};

// Add new blog (admin access)
export const addBlog = async (blogData: BlogInsert): Promise<Blog | null> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  // If status is published and no published_at, set it
  if (blogData.status === 'published' && !blogData.published_at) {
    blogData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .insert(blogData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating blog:', error);
    return null;
  }

  return data;
};

// Update existing blog (admin access)
export const updateBlog = async (id: string, updates: BlogUpdate): Promise<Blog | null> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  const updateData: BlogUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // If changing status to published and no published_at, set it
  if (updates.status === 'published' && !updates.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating blog:', error);
    return null;
  }

  return data;
};

// Delete blog (admin access)
export const deleteBlog = async (id: string): Promise<boolean> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  const { error } = await supabaseAdmin
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog:', error);
    return false;
  }

  return true;
};

// Bulk delete blogs (admin access)
export const bulkDeleteBlogs = async (ids: string[]): Promise<void> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  const { error } = await supabaseAdmin
    .from('blogs')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error bulk deleting blogs:', error);
    throw error;
  }
};

// Get blog statistics (admin access)
export const getBlogStats = async (): Promise<BlogStats> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  const { data: allBlogs, error: allError } = await supabaseAdmin
    .from('blogs')
    .select('status, featured', { count: 'exact' });

  if (allError) {
    console.error('Error fetching blog stats:', allError);
    return { total: 0, published: 0, drafts: 0, featured: 0 };
  }

  const stats: BlogStats = {
    total: allBlogs?.length || 0,
    published: allBlogs?.filter(b => b.status === 'published').length || 0,
    drafts: allBlogs?.filter(b => b.status === 'draft').length || 0,
    featured: allBlogs?.filter(b => b.featured).length || 0,
  };

  return stats;
};

// Upload blog cover image (admin access)
export const uploadBlogImage = async (file: File): Promise<string | null> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `blogs/${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading blog image:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(data.path);

  return publicUrl;
};

// Export blogs data (admin access)
export const exportBlogsData = async (): Promise<Blob> => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin is not configured');
  }

  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const jsonData = JSON.stringify(data, null, 2);
  return new Blob([jsonData], { type: 'application/json' });
};

