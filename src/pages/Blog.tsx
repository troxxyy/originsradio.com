'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import { getPublishedBlogs, type Blog } from '@/data/blogs-supabase';
import { supabase } from '@/lib/supabase';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import ParticlesHeader from '@/components/ui/ParticlesHeader';

const BlogPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const swiperRef = useRef<SwiperType | null>(null);
  const fastSwipeTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartTime = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    console.log('Blog page mounted, Supabase available:', !!supabase);
    
    if (!supabase) {
      console.error('Supabase is not configured');
      setError('Database connection not configured. Please check environment variables.');
      setIsLoading(false);
      return;
    }
    
    loadBlogs();
  }, []);

  // remove GSAP effect for Swiper implementation

  const loadBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { blogs: fetchedBlogs } = await getPublishedBlogs(1, 1000);
      setBlogs(fetchedBlogs);
    } catch (err) {
      console.error('Error loading blogs:', err);
      setError('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTouchStart = (swiper: SwiperType, event: TouchEvent) => {
    touchStartTime.current = Date.now();
    const touch = event.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (swiper: SwiperType, event: TouchEvent) => {
    const touchEndTime = Date.now();
    const touch = event.changedTouches[0];
    const deltaTime = touchEndTime - touchStartTime.current;
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    const delta = Math.max(deltaX, deltaY);
    
    // Determine swipe direction
    const isVertical = deltaY > deltaX;
    setSwipeDirection(isVertical ? 'vertical' : 'horizontal');
    
    // Calculate velocity (pixels per millisecond)
    const velocity = delta / deltaTime;
    
    // Detect fast swipe (velocity > 1.5 pixels/ms)
    if (velocity > 1.5 && swiper.el) {
      // Remove old classes
      swiper.el.classList.remove('fast-swipe', 'fast-swipe-horizontal', 'fast-swipe-vertical');
      
      // Add appropriate class based on direction
      if (isVertical) {
        swiper.el.classList.add('fast-swipe', 'fast-swipe-vertical');
      } else {
        swiper.el.classList.add('fast-swipe', 'fast-swipe-horizontal');
      }
      
      // Remove the classes after animation
      if (fastSwipeTimer.current) {
        clearTimeout(fastSwipeTimer.current);
      }
      fastSwipeTimer.current = setTimeout(() => {
        swiper.el?.classList.remove('fast-swipe', 'fast-swipe-horizontal', 'fast-swipe-vertical');
      }, 500);
    }
  };



  return (
    <>
      <Helmet>
        <title>Blog - Electronic Music News | Origins Radio</title>
        <meta name="description" content="Stay updated with the latest electronic music news, artist interviews, and scene insights from Origins Radio." />
      </Helmet>
      
      <PageLayout showFooter={false}>
        <div className="fixed inset-0" style={{ backgroundColor: 'rgb(29, 31, 42)' }}>
          <ParticlesHeader />
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-screen">
              <div className="text-white text-xl">Loading posts...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-center items-center h-screen px-4">
              <div className="bg-gray-900 rounded-lg p-8 text-center max-w-md">
                <h2 className="text-xl font-bold text-white mb-4">Database Connection Issue</h2>
                <p className="text-red-400 mb-4">{error}</p>
                {error.includes('Database connection') && (
                  <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm">
                      Please check the SUPABASE_SETUP.md file for configuration instructions.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && blogs.length === 0 && (
            <div className="flex justify-center items-center h-screen px-4">
              <div className="bg-gray-900 rounded-lg p-8 text-center max-w-md">
                <p className="text-gray-400 text-lg">No blog posts published yet. Check back soon!</p>
              </div>
            </div>
          )}

          {/* Blog Content - Swiper Coverflow */}
          {!isLoading && !error && blogs.length > 0 && (
            <div className="ourworld relative z-10">
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-start justify-center pointer-events-none select-none z-0 pt-[145px] sm:pt-[145px]">
                <h2 className="text-[6rem] sm:text-[15rem] font-bold font-newake text-white whitespace-nowrap">
                  ORIGINSRADIO
                </h2>
              </div>

              {/* Bottom Tagline */}
              <div className="absolute bottom-0 left-0 right-0 text-center pointer-events-none z-10 pb-[72px] sm:pb-[150px]">
                <p className="text-base sm:text-xl font-bold text-white leading-relaxed">
                  Where the latest music news <br /> meets the culture behind it.
                </p>
              </div>

              <style>{`
                .ourworld .swiper {
                  padding: 330px 0 0;
                  height: 100vh;
                  perspective: 2000px;
                }
                .ourworld .swiper-wrapper {
                  transform-style: preserve-3d;
                }
                .ourworld .swiper-slide {
                  width: 500px;
                  height: 500px;
                  overflow: hidden;
                  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease, box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                  will-change: transform;
                  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
                  transform-style: preserve-3d;
                }
                @media (max-width: 430px) {
                  .ourworld .swiper {
                    padding: 120px 0 0;
                  }
                  .ourworld .swiper-slide {
                    width: min(88vw, 420px);
                    height: min(88vw, 420px);
                  }
                }
                .ourworld .swiper-slide-active {
                  transform: rotateX(0deg) rotateY(0deg);
                  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
                  z-index: 10;
                }
                .ourworld .swiper-slide-prev {
                  transform: rotateY(-10deg) translateZ(-50px);
                  filter: brightness(0.8);
                }
                .ourworld .swiper-slide-next {
                  transform: rotateY(10deg) translateZ(-50px);
                  filter: brightness(0.8);
                }
                .ourworld .swiper-slide:not(.swiper-slide-active):not(.swiper-slide-prev):not(.swiper-slide-next) {
                  transform: rotateY(5deg) translateZ(-100px);
                  filter: brightness(0.6);
                }
                
                /* Horizontal swipe - rotateY */
                .ourworld.fast-swipe-horizontal .swiper-slide-active {
                  transform: rotateY(10deg) translateZ(-50px) !important;
                  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                }
                .ourworld.fast-swipe-horizontal .swiper-slide-prev {
                  transform: rotateY(-15deg) translateZ(-80px) !important;
                  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                }
                .ourworld.fast-swipe-horizontal .swiper-slide-next {
                  transform: rotateY(15deg) translateZ(-80px) !important;
                  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                }
                
                /* Vertical swipe - rotateX */
                .ourworld.fast-swipe-vertical .swiper-slide-active {
                  transform: rotateX(10deg) translateZ(-50px) !important;
                  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                }
                .ourworld.fast-swipe-vertical .swiper-slide-prev {
                  transform: rotateX(-15deg) translateZ(-80px) !important;
                  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                }
                .ourworld.fast-swipe-vertical .swiper-slide-next {
                  transform: rotateX(15deg) translateZ(-80px) !important;
                  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                }
              `}</style>

              <Swiper
                className="ourworld"
                modules={[FreeMode, Mousewheel, Autoplay]}
                centeredSlides
                slidesPerView="auto"
                spaceBetween={10}
                grabCursor
                loop
                resistance
                resistanceRatio={0.15}
                touchReleaseOnEdges
                speed={1500}
                touchAngle={90}
                touchRatio={1.5}
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  waitForTransition: false,
                }}
                freeMode={{
                  enabled: true,
                  momentum: true,
                  momentumBounce: true,
                  momentumBounceRatio: 4.5,
                  momentumRatio: 3.5,
                  momentumVelocityRatio: 5.0,
                  sticky: false,
                  minimumVelocity: 0.02,
                }}
                mousewheel={{
                  forceToAxis: false,
                  sensitivity: 2.5,
                  thresholdDelta: 1,
                  releaseOnEdges: true,
                  invert: false,
                }}
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {blogs.flatMap((blog, index) => {
                  const numSpacers = index % 2 === 0 ? 1 : 2;
                  const spacers = Array.from({ length: numSpacers }, (_, i) => (
                    <SwiperSlide key={`spacer-${blog.id}-${index}-${i}`}>
                      <div className="relative w-full h-full bg-gray-800/30">
                        {/* Empty spacer image */}
                      </div>
                    </SwiperSlide>
                  ));
                  
                  return [
                    <SwiperSlide key={blog.id}>
                      <Link href={`/blog/${blog.slug}`} className="block h-full">
                        <div className="relative w-full h-full">
                          {blog.cover_image_url && (
                            <img className="w-full h-full object-cover" src={blog.cover_image_url} alt={blog.title} />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6">
                            <h2 className="text-2xl font-bold text-white font-newake leading-tight text-center">
                              {blog.title}
                            </h2>
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>,
                    ...spacers
                  ];
                })}
              </Swiper>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
};

export default BlogPage;

