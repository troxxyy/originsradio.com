'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useOurWorkProjects } from '@/hooks/use-supabase'

type UiProject = {
  title: string
  description: string
  image_url: string
  tags?: string[]
  date?: string | null
  upcoming?: boolean | null
  location?: string | null
  ticket_url?: string | null
  slug?: string | null
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

type UpcomingEventsProps = {
  compact?: boolean
  maxItems?: number
  title?: string
}

const UpcomingEvents = ({ compact = false, maxItems, title }: UpcomingEventsProps) => {
  const { data: projects, isLoading, error } = useOurWorkProjects()

  const upcoming = useMemo(() => {
    const list = (projects as UiProject[] | undefined) || []
    const defaultMax = compact ? 3 : 4
    const limit = typeof maxItems === 'number' ? maxItems : defaultMax
    return list
      .filter(p => !!p.upcoming)
      .slice(0, limit)
  }, [projects])

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 ${compact ? 'py-6' : 'py-12 sm:py-16'}`}>
      <div className={`flex items-end justify-between ${compact ? 'mb-4' : 'mb-8'}`}>
        <div>
          <h2 className={`${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-bold text-white`}>{title || 'Upcoming Events'}</h2>
          {!compact && (
            <p className="text-white/70 mt-2">What’s happening next at Origins Radio</p>
          )}
        </div>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className={`text-center ${compact ? 'py-6' : 'py-12'} text-white/70`}>Loading events...</div>
      ) : error ? (
        <div className={`text-center ${compact ? 'py-6' : 'py-12'} text-red-400`}>Failed to load events</div>
      ) : upcoming.length === 0 ? (
        <div className={`text-center ${compact ? 'py-6' : 'py-12'} text-white/70`}>No upcoming events at the moment.</div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${compact ? 'gap-4' : 'gap-6'}`}>
          {upcoming.map((p, idx) => (
            <motion.div
              key={p.slug || `${p.title}-${idx}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group rounded-xl sm:rounded-2xl overflow-hidden border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300"
            >
              <Link href={p.slug ? `/events/${p.slug}` : '/events'} className="block h-full">
                <div className={`relative ${compact ? 'h-36' : 'h-44'} w-full overflow-hidden`}>
                  <img
                    src={p.image_url || '/placeholder.svg'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                <div className={`${compact ? 'p-3' : 'p-4'}`}>
                  <h3 className={`text-white font-semibold ${compact ? 'text-base' : 'text-lg'} mb-1 line-clamp-2`}>{p.title}</h3>
                  <div className={`flex items-center gap-3 ${compact ? 'text-xs' : 'text-sm'} text-white/70`}>
                    {p.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {p.location}
                      </span>
                    )}
                    {formatDate(p.date) && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(p.date)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}

export default UpcomingEvents


