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

  // Mobile-specific state
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const daySelectorRef = useRef<HTMLDivElement>(null)
  
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

  // Auto-scroll day selector to current day on mobile
  useEffect(() => {
    if (isMobile && daySelectorRef.current) {
      const currentDayIdx = (new Date().getDay() + 6) % 7
      const targetButton = daySelectorRef.current.children[currentDayIdx] as HTMLElement
      if (targetButton) {
        targetButton.scrollIntoView({ behavior: 'smooth', inline: 'center' })
      }
    }
  }, [isMobile])

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
            {/* Stream capability removed; always set-based */}
          </div>
        )}
        <div className="w-full px-0 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">Loading…</div>
          ) : error ? (
            <div className="text-red-400">Failed to load schedule</div>
          ) : (
            isMobile ? (
              <div className="h-full">
                {/* Day selector header - only visible on mobile */}
                <div className="sticky top-16 z-30 bg-black/95 backdrop-blur-sm border-b border-white/10 px-3 py-3">
                  <div ref={daySelectorRef} className="flex justify-between items-center gap-2 overflow-x-auto scrollbar-hide">
                    {DAY_LABELS.map((label, dayIdx) => {
                      const currentDayIdx = (new Date().getDay() + 6) % 7
                      const isToday = dayIdx === currentDayIdx
                      const isSelected = selectedDay === dayIdx || (selectedDay === null && isToday)
                      
                      return (
                        <button
                          key={dayIdx}
                          onClick={() => setSelectedDay(dayIdx)}
                          className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                            isSelected
                              ? 'bg-white text-black shadow-lg scale-105'
                              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-xs opacity-60">{label.slice(0, 3)}</div>
                            <div className="font-bold">{label.slice(0, 3)}</div>
                          </div>
                          {isToday && (
                            <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-red-500/30 rounded-full">LIVE</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Schedule content */}
                <div className="px-3 py-4">
                  <div className="space-y-3">
                    {DAY_LABELS.map((label, dayIdx) => {
                      // Determine which day to show
                      const currentDayIdx = currentPosition?.day ?? (new Date().getDay() + 6) % 7
                      const dayToShow = selectedDay !== null ? selectedDay : currentDayIdx
                      const shouldShow = dayIdx === dayToShow

                      return (
                        <div key={label} className={`transition-opacity duration-300 ${shouldShow ? 'block opacity-100' : 'hidden opacity-0'}`}>
                        {/* Day header with today indicator */}
                        <div className="flex items-center justify-between mb-3 px-2">
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{label}</h2>
                            {dayIdx === currentPosition?.day && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-semibold animate-pulse">
                                TODAY
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            {HOURS[0]}:00 - {HOURS[HOURS.length - 1]}:00
                          </div>
                        </div>

                        {/* Time slots */}
                        <div className="space-y-2.5">
                          {HOURS.map((h) => {
                            const key = `${dayIdx}-${h}`
                            const item = itemsByKey.get(key)
                            const isCurrent = currentPosition?.day === dayIdx && currentPosition?.hour === h
                            const isPast = currentPosition?.day === dayIdx && currentPosition?.hour && currentPosition.hour > h
                            const isUpcoming = !isCurrent && !isPast
                            
                            return (
                              <div
                                key={key}
                                className={`relative rounded-xl overflow-hidden transition-all ${
                                  isCurrent
                                    ? 'ring-2 ring-red-500/60 shadow-lg shadow-red-500/20 scale-[1.02]'
                                    : 'border border-white/10 hover:border-white/20'
                                } ${isPast ? 'opacity-50' : ''}`}
                              >
                                <div className="flex items-stretch min-h-[140px]">
                                  {/* Time badge */}
                                  <div className={`w-20 shrink-0 flex flex-col items-center justify-center ${
                                    isCurrent ? 'bg-red-500/20' : 'bg-white/5'
                                  }`}>
                                    <div className={`text-xs font-bold ${
                                      isCurrent ? 'text-red-400' : 'text-gray-400'
                                    }`}>
                                      {getHourLabel(h).split(':')[0]}
                                    </div>
                                    <div className={`text-[10px] ${
                                      isCurrent ? 'text-red-400/80' : 'text-gray-500'
                                    }`}>
                                      {getHourLabel(h).split(':')[1]}
                                    </div>
                                    {isCurrent && (
                                      <div className="mt-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                    )}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 relative">
                                    {item ? (
                                      <div className="relative h-full min-h-[140px]">
                                        <img 
                                          src={item.set?.artists?.photo_url || 'https://via.placeholder.com/400?text=' + encodeURIComponent(item.title)} 
                                          alt={item.set?.artists?.name || item.title}
                                          className="absolute inset-0 w-full h-full object-cover"
                                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=No+Image' }}
                                        />
                                        
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80" />
                                        
                                        {/* Content */}
                                        <div className="relative h-full flex flex-col justify-between p-4">
                                          <div>
                                            {isCurrent && (
                                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 bg-red-500/30 backdrop-blur rounded-full">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                                                  LIVE NOW
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          
                                          <div onClick={() => {
                                            if (item.set?.artists?.name) {
                                              router.push(`/artists/${generateSlug(item.set.artists.name)}`)
                                            }
                                          }} className={item.set?.artists?.name ? 'cursor-pointer active:scale-95 transition-transform' : ''}>
                                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                                              {item.set?.artists?.name || item.title}
                                            </h3>
                                            {item.title && item.set?.artists?.name && (
                                              <p className="text-xs text-gray-300 line-clamp-1">
                                                {item.title}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-full w-full bg-gradient-to-br from-gray-900/50 to-black/50 flex items-center justify-center min-h-[140px]">
                                        <div className="text-center">
                                          <div className="text-gray-600 text-sm mb-1">No show scheduled</div>
                                          <div className="text-gray-700 text-xs">Next: {HOURS[HOURS.findIndex(x => x > h)] ? getHourLabel(HOURS.find(x => x > h) || HOURS[0]) : 'Tomorrow'}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
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
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 111.314 0z" />
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
            )
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


