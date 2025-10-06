import { useMemo } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { useWeeklyRadioSchedule } from '@/hooks/use-radio'

const HOURS = [16,17,18,19,20,21,22,23]
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 430px)').matches
const TIME_COL_PX = isMobile ? 100 : 140
const DAY_COL_PX = isMobile ? 240 : 320
const HEADER_PX = isMobile ? 44 : 56
const ROW_PX = isMobile ? 120 : 160

function getHourLabel(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

export default function RadioSchedule() {
  const { data = [], isLoading, error } = useWeeklyRadioSchedule()

  const itemsByKey = useMemo(() => {
    const map = new Map<string, typeof data[number]>()
    for (const item of data) {
      const hour = parseInt(item.startTimeLocal.split(':')[0] || '0', 10)
      if (hour >= 16 && hour <= 23) {
        const key = `${item.dayOfWeek}-${hour}`
        map.set(key, item)
      }
    }
    return map
  }, [data])

  return (
    <PageLayout showFooter={false} customBackground="bg-black">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
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
                    className="sticky top-0 z-10 bg-black/40 backdrop-blur border-b border-white/10 flex items-center justify-center font-semibold"
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
                  <div key={`row-${h}`} style={{ gridColumn: '2 / span 7', gridRow: rIdx + 2 }} className="grid grid-cols-7">
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const key = `${dayIdx}-${h}`
                      const item = itemsByKey.get(key)
                      return (
                        <div key={dayIdx} className="border border-white/10 relative">
                          {item && (
                            <SlotCard
                              title={item.title}
                              artistName={item.set?.artists?.name || ''}
                              photoUrl={item.set?.artists?.photo_url || ''}
                              contentType={item.contentType}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* 24:00 marker row */}
                <div className="sticky left-0 z-10 bg-black/40 backdrop-blur border-t border-white/10 flex items-center justify-end pr-3 text-gray-300" style={{ gridColumn: 1, gridRow: HOURS.length + 2 }}>
                  24:00
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

function SlotCard({ title, artistName, photoUrl, contentType }: { title: string; artistName?: string; photoUrl?: string; contentType: 'set' | 'stream' }) {
  const displayTitle = artistName ? artistName : title
  return (
    <div className="h-full w-full">
      <div className="h-full w-full relative overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={displayTitle} className="absolute inset-0 w-full h-full object-cover opacity-70" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
        <div className="relative h-full p-3 flex flex-col justify-end">
          <div className="text-sm text-gray-300 uppercase tracking-wide">{contentType === 'stream' ? 'Stream' : 'Set'}</div>
          <div className="text-base font-semibold truncate">{displayTitle}</div>
          {artistName && <div className="text-sm text-gray-400 truncate">{title}</div>}
        </div>
      </div>
    </div>
  )
}


