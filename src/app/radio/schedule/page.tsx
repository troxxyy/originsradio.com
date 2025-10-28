'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { useWeeklyRadioSchedule, useCurrentRadioSlot } from '@/hooks/use-radio'
import { generateSlug } from '@/lib/supabase-utils'

const HOURS = [19,20,21,22,23]
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 430px)').matches
const TIME_COL_PX = isMobile ? 50 : 70
const DAY_COL_PX = isMobile ? 176 : 240
const HEADER_PX = isMobile ? 48 : 68
const ROW_PX = isMobile ? 176 : 240  // Match DAY_COL_PX for 1:1 aspect ratio
const SLOT_GAP_PX = isMobile ? 8 : 12

function getHourLabel(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

// Get current time in Istanbul timezone
function getIstanbulTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }))
}

export default function RadioSchedule() {
  const { data = [], isLoading, error } = useWeeklyRadioSchedule()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(getIstanbulTime())
  const { currentSlot } = useCurrentRadioSlot(5000)

  // Touch handling for mobile swipe
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const scrollStartX = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const lastTouchTime = useRef<number>(0)
  const velocityX = useRef<number>(0)
  const lastTouchX = useRef<number>(0)

  // Update current time every minute (Istanbul time)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getIstanbulTime())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Global mouse event handlers for desktop only
  useEffect(() => {
    // Only add mouse event listeners on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isDragging.current) {
          handleMouseMove(e as any)
        }
      }

      const handleGlobalMouseUp = () => {
        if (isDragging.current) {
          handleMouseUp()
        }
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [])

  // Touch event handlers for smooth mobile scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    
    const touch = e.touches[0]
    touchStartX.current = touch.clientX
    touchStartY.current = touch.clientY
    scrollStartX.current = scrollContainerRef.current.scrollLeft
    lastTouchTime.current = Date.now()
    lastTouchX.current = touch.clientX
    velocityX.current = 0
    // Don't set isDragging yet - wait to determine swipe direction
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.current
    const deltaY = touch.clientY - touchStartY.current
    
    // Movement threshold - require at least 10px movement before engaging
    const movementThreshold = 10
    const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    
    if (totalMovement < movementThreshold) {
      return // Not enough movement yet
    }
    
    // Determine swipe direction
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY)
    
    if (!isHorizontalSwipe) {
      // This is a vertical swipe - let the browser handle it naturally
      return
    }
    
    // This is a horizontal swipe - engage custom scrolling
    if (!isDragging.current) {
      isDragging.current = true
      setIsScrolling(true)
    }
    
    e.preventDefault()
    
    // Calculate velocity for momentum scrolling
    const now = Date.now()
    const timeDelta = now - lastTouchTime.current
    if (timeDelta > 0) {
      const distanceDelta = touch.clientX - lastTouchX.current
      velocityX.current = distanceDelta / timeDelta
      lastTouchTime.current = now
      lastTouchX.current = touch.clientX
    }
    
    // Apply the scroll with some resistance at the edges
    const container = scrollContainerRef.current
    const maxScroll = container.scrollWidth - container.clientWidth
    const currentScroll = scrollStartX.current - deltaX
    
    // Add resistance at edges
    let newScroll = currentScroll
    if (currentScroll < 0) {
      newScroll = currentScroll * 0.3 // Resistance when scrolling past start
    } else if (currentScroll > maxScroll) {
      newScroll = maxScroll + (currentScroll - maxScroll) * 0.3 // Resistance when scrolling past end
    }
    
    container.scrollLeft = newScroll
  }

  const handleTouchEnd = () => {
    if (!isDragging.current || !scrollContainerRef.current) return
    
    isDragging.current = false
    setIsScrolling(false)
    
    // Apply momentum scrolling
    if (Math.abs(velocityX.current) > 0.5) {
      const container = scrollContainerRef.current
      const maxScroll = container.scrollWidth - container.clientWidth
      let targetScroll = container.scrollLeft + velocityX.current * 200 // Momentum multiplier
      
      // Clamp to bounds
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll))
      
      // Smooth scroll to target
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    }
    
    // Reset velocity
    velocityX.current = 0
  }

  // Mouse event handlers for desktop only
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle mouse events on non-touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return
    
    if (!scrollContainerRef.current) return
    
    touchStartX.current = e.clientX
    touchStartY.current = e.clientY
    scrollStartX.current = scrollContainerRef.current.scrollLeft
    isDragging.current = true
    lastTouchTime.current = Date.now()
    lastTouchX.current = e.clientX
    velocityX.current = 0
    setIsScrolling(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only handle mouse events on non-touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return
    
    if (!isDragging.current || !scrollContainerRef.current) return
    
    const deltaX = e.clientX - touchStartX.current
    const deltaY = e.clientY - touchStartY.current
    
    // Only handle if this is primarily a horizontal drag
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      
      // Calculate velocity for momentum scrolling
      const now = Date.now()
      const timeDelta = now - lastTouchTime.current
      if (timeDelta > 0) {
        const distanceDelta = e.clientX - lastTouchX.current
        velocityX.current = distanceDelta / timeDelta
        lastTouchTime.current = now
        lastTouchX.current = e.clientX
      }
      
      // Apply the scroll with some resistance at the edges
      const container = scrollContainerRef.current
      const maxScroll = container.scrollWidth - container.clientWidth
      const currentScroll = scrollStartX.current - deltaX
      
      // Add resistance at edges
      let newScroll = currentScroll
      if (currentScroll < 0) {
        newScroll = currentScroll * 0.3 // Resistance when scrolling past start
      } else if (currentScroll > maxScroll) {
        newScroll = maxScroll + (currentScroll - maxScroll) * 0.3 // Resistance when scrolling past end
      }
      
      container.scrollLeft = newScroll
    }
  }

  const handleMouseUp = () => {
    // Only handle mouse events on non-touch devices
    if (!window.matchMedia('(pointer: fine)').matches) return
    
    if (!isDragging.current || !scrollContainerRef.current) return
    
    isDragging.current = false
    setIsScrolling(false)
    
    // Apply momentum scrolling
    if (Math.abs(velocityX.current) > 0.5) {
      const container = scrollContainerRef.current
      const maxScroll = container.scrollWidth - container.clientWidth
      let targetScroll = container.scrollLeft + velocityX.current * 200 // Momentum multiplier
      
      // Clamp to bounds
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll))
      
      // Smooth scroll to target
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      })
    }
    
    // Reset velocity
    velocityX.current = 0
  }

  // Calculate current position in the schedule (Istanbul time)
  const currentPosition = useMemo(() => {
    const day = (currentTime.getDay() + 6) % 7 // Convert Sun=0 to Mon=0
    const hour = currentTime.getHours()
    
    if (hour >= 19 && hour <= 23) {
      return { day, hour }
    }
    return null
  }, [currentTime])

  const itemsByKey = useMemo(() => {
    const map = new Map<string, typeof data[number]>()
    for (const item of data) {
      const hour = parseInt(item.startTimeLocal.split(':')[0] || '0', 10)
      if (hour >= 19 && hour <= 23) {
        const key = `${item.dayOfWeek}-${hour}`
        map.set(key, item)
      }
    }
    return map
  }, [data])

  return (
    <PageLayout showFooter={false} customBackground="bg-black">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        {/* Debug info */}
        {currentSlot && (
          <div className="fixed top-20 right-4 z-50 bg-green-500/90 text-white p-4 rounded-lg text-xs max-w-xs">
            <div className="font-bold mb-2">🔴 LIVE NOW</div>
            <div>Title: {currentSlot.item.title}</div>
            <div>Type: {currentSlot.item.contentType}</div>
            <div>Started: {currentSlot.startedAtUtc.toLocaleTimeString()}</div>
            <div>Is Stream: {currentSlot.isLiveStream ? 'Yes' : 'No'}</div>
          </div>
        )}
        <div className="w-full px-0 py-4">
          {/* Mobile swipe hint */}
          {isMobile && (
            <div className="text-center text-gray-400 text-sm mb-2 px-4">
              ← Swipe to see more days →
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">Loading…</div>
          ) : error ? (
            <div className="text-red-400">Failed to load schedule</div>
          ) : (
            <div 
              ref={scrollContainerRef}
              className={`relative overflow-x-auto overscroll-x-contain touch-pan-x snap-x snap-mandatory ${isScrolling ? 'scroll-smooth' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ 
                touchAction: 'pan-x',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: isScrolling ? 'auto' : 'smooth'
              }}
            >
              <div
                className="grid w-full"
                style={{
                  gridTemplateColumns: `${TIME_COL_PX}px repeat(7, ${DAY_COL_PX}px)`,
                  gridTemplateRows: `${HEADER_PX}px repeat(${HOURS.length}, ${ROW_PX}px)`,
                  width: `${TIME_COL_PX + 7 * DAY_COL_PX}px`,
                }}
              >
                {/* Header corner */}
                <div className="sticky left-0 top-0 z-20 bg-black/40 backdrop-blur border-b border-white/10" />

                {/* Day headers */}
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    className="sticky top-0 z-10 bg-black/40 backdrop-blur border-b border-white/10 flex items-center justify-center font-semibold text-sm"
                    style={{ gridColumn: i + 2, gridRow: 1 }}
                  >
                    {label}
                  </div>
                ))}

                {/* Time column */}
                {HOURS.map((h, idx) => (
                  <div
                    key={h}
                    className="sticky left-0 z-10 bg-black/40 backdrop-blur border-r border-white/10 flex items-center justify-end pr-3 text-gray-300"
                    style={{ gridColumn: 1, gridRow: idx + 2 }}
                  >
                    {getHourLabel(h)}
                  </div>
                ))}

                {/* Grid cells and items */}
                {HOURS.map((h, rIdx) => (
                  <div key={`row-${h}`} style={{ gridColumn: '2 / span 7', gridRow: rIdx + 2 }} className="grid grid-cols-7 gap-2 px-2">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const key = `${dayIdx}-${h}`
                      const item = itemsByKey.get(key)
                      const isCurrent = currentPosition?.day === dayIdx && currentPosition?.hour === h
                      return (
                        <div key={dayIdx} className="relative p-2">
                          <div className={`h-full w-full rounded-lg overflow-hidden shadow-lg border ${isCurrent ? 'border-red-500 border-2 ring-2 ring-red-500/50' : 'border-white/5'}`}>
                            {item ? (
                              <ArtistImageCard
                                artistName={item.set?.artists?.name || item.title}
                                photoUrl={item.set?.artists?.photo_url || ''}
                                artistId={item.set?.artists?.id}
                                onClick={() => {
                                  if (item.set?.artists?.name) {
                                    router.push(`/artists/${generateSlug(item.set.artists.name)}`)
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-full bg-black/40 flex items-center justify-center text-gray-600">&nbsp;</div>
                            )}
                          </div>
                          {isCurrent && (
                            <div className="absolute top-0 right-0 -mt-1 -mr-1 z-30">
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" style={{ width: '24px', height: '24px' }} />
                                <div className="relative bg-red-500 rounded-full p-1.5 shadow-lg">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* 24:00 marker row */}
               
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

function ArtistImageCard({ 
  artistName, 
  photoUrl, 
  artistId, 
  onClick 
}: { 
  artistName: string; 
  photoUrl?: string; 
  artistId?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={`h-full w-full ${artistId ? 'cursor-pointer group/card' : ''}`}
      onClick={onClick}
    >
      <div className="h-full w-full relative overflow-hidden bg-black transition-transform group-hover/card:scale-105">
        {photoUrl ? (
          <img src={photoUrl} alt={artistName} className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover/card:opacity-80" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        {/* Bottom overlay with padding and subtle blur for readability */}
        <div className="absolute left-0 right-0 bottom-0 p-3 backdrop-blur-sm bg-gradient-to-t from-black/90 to-black/20 flex items-center justify-center transition-all group-hover/card:from-black to-black/30">
          <div className="text-sm md:text-base font-semibold text-white truncate text-center drop-shadow-md">{artistName}</div>
        </div>

      </div>
    </div>
  )
}


