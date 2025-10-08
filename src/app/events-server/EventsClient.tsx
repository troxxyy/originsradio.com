'use client'

import { motion } from "framer-motion"
import { useState, useEffect, useMemo } from "react"
import { Calendar, MapPin } from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import Link from "next/link"
import { generateSlug } from "@/lib/supabase-utils"

interface Event {
  id: string
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

interface EventsClientProps {
  initialEvents: Event[]
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isNavigating, setIsNavigating] = useState(false)

  const { upcoming, past } = useMemo(() => {
    return {
      upcoming: events.filter(e => e.upcoming),
      past: events.filter(e => !e.upcoming)
    }
  }, [events])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <PageLayout customBackground="bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="min-h-screen px-6 pt-28 pb-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Events
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-300">
              Join us for unforgettable electronic music experiences in Ankara
            </p>
          </motion.div>

          {/* Upcoming Events */}
          {upcoming.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
                Upcoming Events
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} isPast={false} setIsNavigating={setIsNavigating} />
                ))}
              </div>
            </section>
          )}

          {/* Past Events */}
          {past.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">
                Past Events
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} isPast={true} setIsNavigating={setIsNavigating} />
                ))}
              </div>
            </section>
          )}

          {events.length === 0 && (
            <div className="py-20 text-center text-white">
              <p className="text-xl">No events available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

function EventCard({ event, index, isPast, setIsNavigating }: { 
  event: Event
  index: number
  isPast: boolean
  setIsNavigating: (val: boolean) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer h-full"
    >
      <Link 
        href={`/events/${event.slug || generateSlug(event.title)}`}
        onClick={() => setIsNavigating(true)}
      >
        <div className={`glass backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transform-gpu hover:scale-105 h-full flex flex-col min-h-[28rem] ${isPast ? 'opacity-60' : ''}`}>
          <div className="relative h-64 overflow-hidden">
            <img
              src={event.image_url || '/placeholder.svg'}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg'
              }}
            />
            {isPast && (
              <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs text-white">
                Past Event
              </div>
            )}
          </div>

          <div className="flex flex-col flex-1 p-6">
            <h3 className="mb-2 text-xl font-bold text-white line-clamp-2">
              {event.title}
            </h3>

            <p className="mb-4 text-sm text-gray-300 line-clamp-2 flex-1">
              {event.description}
            </p>

            <div className="space-y-2 text-sm text-gray-400">
              {event.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
