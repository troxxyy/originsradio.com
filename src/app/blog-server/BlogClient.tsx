'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import { type Blog } from '@/data/blogs-supabase'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Mousewheel, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/free-mode'
import ParticlesHeader from '@/components/ui/ParticlesHeader'

interface BlogClientProps {
  initialBlogs: Blog[]
}

export default function BlogClient({ initialBlogs }: BlogClientProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
  const [swipeDirection, setSwipeDirection] = useState<'horizontal' | 'vertical'>('horizontal')
  const swiperRef = useRef<SwiperType | null>(null)
  const fastSwipeTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartTime = useRef<number>(0)
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Touch handling logic (same as original)
  const handleTouchStart = (e: TouchEvent) => {
    touchStartTime.current = Date.now()
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    const deltaX = Math.abs(e.touches[0].clientX - touchStartPos.current.x)
    const deltaY = Math.abs(e.touches[0].clientY - touchStartPos.current.y)
    
    if (deltaY > deltaX && swipeDirection === 'horizontal') {
      setSwipeDirection('vertical')
      if (fastSwipeTimer.current) {
        clearTimeout(fastSwipeTimer.current)
      }
      fastSwipeTimer.current = setTimeout(() => {
        setSwipeDirection('horizontal')
      }, 300)
    }
  }

  const handleTouchEnd = () => {
    const swipeTime = Date.now() - touchStartTime.current
    if (swipeTime < 150 && swipeDirection === 'horizontal') {
      setSwipeDirection('vertical')
      if (fastSwipeTimer.current) {
        clearTimeout(fastSwipeTimer.current)
      }
      fastSwipeTimer.current = setTimeout(() => {
        setSwipeDirection('horizontal')
      }, 800)
    }
  }

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      if (fastSwipeTimer.current) {
        clearTimeout(fastSwipeTimer.current)
      }
    }
  }, [swipeDirection])

  if (blogs.length === 0) {
    return (
      <PageLayout showFooter={false}>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">No blog posts yet</h2>
            <p className="text-gray-400">Check back soon for updates!</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout showFooter={false}>
      <div className="min-h-screen bg-black overflow-hidden">
        <ParticlesHeader />
        
        <div className="h-[calc(100vh-200px)] w-full">
          <Swiper
            direction={swipeDirection}
            slidesPerView={1}
            spaceBetween={0}
            mousewheel={true}
            freeMode={true}
            modules={[FreeMode, Mousewheel, Autoplay]}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
            }}
            className="h-full w-full"
            speed={600}
            threshold={10}
          >
            {blogs.flatMap((blog, index) => {
              const slides = [];
              
              if (index > 0 && index % 3 === 0) {
                slides.push(
                  <SwiperSlide key={`divider-${index}`}>
                    <div className="h-full w-full bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20 flex items-center justify-center">
                      <div className="text-center px-8">
                        <h3 className="text-4xl md:text-6xl font-bold text-white mb-4">
                          Keep Reading
                        </h3>
                        <p className="text-xl text-gray-300">
                          Discover more stories below
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              }
              
              slides.push(
                <SwiperSlide key={blog.id}>
                  <Link href={`/blog/${blog.slug}`} className="block h-full">
                    <div className="relative w-full h-full">
                      {blog.cover_image_url && (
                        <img className="w-full h-full object-cover" src={blog.cover_image_url} alt={blog.title} />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
                        <div className="text-center max-w-4xl">
                          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                            {blog.title}
                          </h2>
                          {blog.excerpt && (
                            <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-3">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                            {blog.author && <span>{blog.author}</span>}
                            {blog.published_at && (
                              <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              );
              
              return slides;
            })}
          </Swiper>
        </div>

        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <p className="text-white text-sm">
              {swipeDirection === 'horizontal' ? 'Swipe horizontally' : 'Swipe vertically'} to navigate
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
