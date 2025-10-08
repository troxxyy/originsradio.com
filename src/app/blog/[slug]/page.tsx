'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { getBlogBySlug, getRelatedBlogs, type Blog } from '@/data/blogs-supabase';
import { supabase } from '@/lib/supabase';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('BlogDetail mounted with slug:', slug);
    
    if (!slug) {
      setError('No blog slug provided');
      setIsLoading(false);
      return;
    }

    loadBlog(slug);
  }, [slug]);

  const loadBlog = async (slug: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading blog with slug:', slug);
      
      // Check if Supabase is configured
      if (!supabase) {
        throw new Error('Database connection not configured. Please check environment variables.');
      }

      const fetchedBlog = await getBlogBySlug(slug);
      
      if (!fetchedBlog) {
        setError(`Blog post with slug "${slug}" not found`);
        setIsLoading(false);
        return;
      }

      setBlog(fetchedBlog);
      
      // Load related blogs
      if (fetchedBlog.tags && fetchedBlog.tags.length > 0) {
        try {
          const related = await getRelatedBlogs(fetchedBlog.id, fetchedBlog.tags, 3);
          setRelatedBlogs(related);
        } catch (err) {
          console.warn('Failed to load related blogs:', err);
          // Don't fail the whole page if related blogs fail
        }
      }
      
    } catch (err) {
      console.error('Error loading blog:', err);
      setError(err instanceof Error ? err.message : 'Failed to load blog post');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <PageLayout showFooter={false}>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-2xl mb-4">Loading blog post...</div>
            <div className="text-gray-400 mb-4">Slug: {slug}</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !blog) {
    return (
      <PageLayout showFooter={false}>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
              <h1 className="text-2xl font-bold text-white mb-4">Error Loading Blog Post</h1>
              <p className="text-red-400 mb-6">{error || 'Blog post not found'}</p>
              
              {error && error.includes('Database connection') && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    Database connection issue. Please check the SUPABASE_SETUP.md file for configuration instructions.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/blog')}
                  className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Back to Blog
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter={false}>
      <div className="min-h-screen bg-black">
        {/* Back Button */}
        <div className="fixed top-6 left-6 z-50">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>

        {/* Hero Section */}
        {blog.cover_image_url && (
          <div className="relative h-[50vh] overflow-hidden">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
          </div>
        )}

        {/* Content */}
        <div className="relative -mt-16 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 md:p-12">
                {/* Featured Badge */}
                {blog.featured && (
                  <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full mb-6 uppercase tracking-wider">
                    Featured
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
                  {blog.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-10 pb-8 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Author</div>
                      <div className="text-white font-medium">{blog.author}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Published</div>
                      <div className="text-white font-medium">{formatDate(blog.published_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-10">
                  <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {blog.content}
                  </div>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-2 text-gray-400 mr-2">
                      <Tag className="w-5 h-5" />
                      <span className="text-sm font-medium">Tags:</span>
                    </div>
                    {blog.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm rounded-full transition-all cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
            </div>

            {/* Related Posts */}
            {relatedBlogs.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
                  Related Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedBlogs.map((relatedBlog) => (
                    <Link
                      key={relatedBlog.id}
                      href={`/blog/${relatedBlog.slug}`}
                      className="block bg-gray-900/90 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all group"
                    >
                      {relatedBlog.cover_image_url && (
                        <div className="w-full h-48 overflow-hidden">
                          <img
                            src={relatedBlog.cover_image_url}
                            alt={relatedBlog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors line-clamp-2">
                          {relatedBlog.title}
                        </h3>
                        {relatedBlog.excerpt && (
                          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                            {relatedBlog.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}