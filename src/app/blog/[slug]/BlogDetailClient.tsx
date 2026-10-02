'use client'

import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import type { Blog } from '@/data/blogs-supabase';

const BLOG_IMAGES = ['/BLOGIMAGES/BLOGIMAGE1.jpeg', '/BLOGIMAGES/BLOGIMAGE2.jpeg', '/BLOGIMAGES/BLOGIMAGE3.jpeg'];

export default function BlogDetailClient({ blog, relatedBlogs }: { blog: Blog; relatedBlogs: Blog[] }) {
  const formatDate = (dateString: string | null) => dateString
    ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Istanbul' })
    : 'No date';

  return (
    <PageLayout showFooter={false}>
      {/* Background for blog detail pages */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#000000]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#A6B2E1]/10 via-transparent to-[#7DBEEE]/15" />
        <div className="absolute -left-40 -top-40 w-[620px] h-[620px] rounded-full bg-[#7DBEEE]/8 blur-[160px]" />
        <div className="absolute right-0 top-1/3 w-[520px] h-[520px] rounded-full bg-[#A6B2E1]/8 blur-[140px]" />
        <div className="absolute -left-16 bottom-0 w-[420px] h-[420px] rounded-full bg-[#555759]/20 blur-[120px]" />
      </div>

      <div className="min-h-screen bg-[#000000] relative z-10">
        {/* Back Button */}
        <div className="fixed top-6 left-6 z-50">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#555759]/30 backdrop-blur-sm border border-[#EEEef4]/20 rounded-full text-[#EEEef4] hover:bg-[#555759]/40 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={blog.cover_image_url || BLOG_IMAGES[0]}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/30 to-[#000000]" />
        </div>

        {/* Content */}
        <div className="relative -mt-16 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 md:p-12 bg-[#555759]/20 border border-[#EEEef4]/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-[#000000]/30">
                {/* Featured Badge */}
                {blog.featured && (
                  <div className="inline-block px-4 py-1.5 bg-[#7DBEEE] text-[#000000] text-xs font-bold rounded-full mb-6 uppercase tracking-wider border border-[#A6B2E1]/40">
                    Featured
                  </div>
                )}

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-[#EEEef4] mb-8 leading-tight">
                  {blog.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-[#CFC6DB] mb-10 pb-8 border-b border-[#EEEef4]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7DBEEE] flex items-center justify-center">
                      <User className="w-5 h-5 text-[#000000]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#555759] uppercase tracking-wide">Author</div>
                      <div className="text-[#EEEef4] font-medium">{blog.author}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#555759]/30 border border-[#EEEef4]/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#7DBEEE]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#555759] uppercase tracking-wide">Published</div>
                      <div className="text-[#EEEef4] font-medium">{formatDate(blog.published_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-10">
                  <div className="text-[#CFC6DB] text-lg leading-relaxed whitespace-pre-wrap">
                    {blog.content}
                  </div>
                </div>

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 pt-8 border-t border-[#EEEef4]/10">
                    <div className="flex items-center gap-2 text-[#CFC6DB] mr-2">
                      <Tag className="w-5 h-5" />
                      <span className="text-sm font-medium">Tags:</span>
                    </div>
                    {blog.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-[#555759]/30 hover:bg-[#555759]/50 border border-[#EEEef4]/10 text-[#CFC6DB] text-sm rounded-full transition-all cursor-pointer"
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
                <h2 className="text-3xl md:text-4xl font-bold text-[#EEEef4] mb-10">
                  Related Stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedBlogs.map((relatedBlog, idx) => (
                    <Link
                      key={relatedBlog.id}
                      href={`/blog/${relatedBlog.slug}`}
                      className="block bg-[#555759]/20 border border-[#EEEef4]/10 backdrop-blur-sm rounded-xl overflow-hidden hover:border-[#EEEef4]/30 hover:bg-[#555759]/30 transition-all group"
                    >
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={relatedBlog.cover_image_url || BLOG_IMAGES[idx % BLOG_IMAGES.length]}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-[#EEEef4] mb-3 group-hover:text-[#A6B2E1] transition-colors line-clamp-2">
                          {relatedBlog.title}
                        </h3>
                        {relatedBlog.excerpt && (
                          <p className="text-[#CFC6DB] text-sm line-clamp-3 leading-relaxed">
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