import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(getIstanbulTime())
  const { currentSlot } = useCurrentRadioSlot(5000)

  // Update current time every minute (Istanbul time)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getIstanbulTime())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

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
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">Loading…</div>
          ) : error ? (
            <div className="text-red-400">Failed to load schedule</div>
          ) : (
            <div className="relative overflow-x-auto overscroll-x-contain touch-pan-x snap-x snap-mandatory">
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
                                    navigate(`/artists/${generateSlug(item.set.artists.name)}`)
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


