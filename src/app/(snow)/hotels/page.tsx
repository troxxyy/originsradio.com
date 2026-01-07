'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { MapPin, Phone, Globe, Languages, Hotel, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSnowLanguage } from '@/components/snow/useSnowLanguage'

const copy = {
  en: {
    title: 'Hotels & Accommodation',
    subtitle: 'Partner hotels and accommodation options for Snow Sessions',
    noHotels: 'Hotel information coming soon. Check back for updates.',
    amenities: 'Amenities',
    distance: 'Distance from Event',
    booking: 'Booking Information',
    contact: 'Contact',
    seo: {
      title: 'Hotels & Accommodation | Snow Sessions - Origins Radio',
      description: 'Find partner hotels and accommodation options for Snow Sessions at Erciyes.',
    },
  },
  tr: {
    title: 'Oteller & Konaklama',
    subtitle: 'Snow Sessions için partner oteller ve konaklama seçenekleri',
    noHotels: 'Otel bilgileri yakında. Güncellemeler için tekrar kontrol edin.',
    amenities: 'Olanaklar',
    distance: 'Etkinlikten Mesafe',
    booking: 'Rezervasyon Bilgisi',
    contact: 'İletişim',
    seo: {
      title: 'Oteller & Konaklama | Snow Sessions - Origins Radio',
      description: 'Erciyes\'te Snow Sessions için partner oteller ve konaklama seçeneklerini bulun.',
    },
  },
}

// Placeholder hotels - will be populated from PDF
const placeholderHotels = [
  {
    id: 1,
    name: 'Hotel Name',
    location: 'Erciyes',
    distance: '500m from event',
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Parking'],
    phone: '+90 XXX XXX XX XX',
    website: 'https://example.com',
    bookingInfo: 'Contact for special rates',
  },
]

function HotelCard({ hotel, language }: { hotel: any; language: 'en' | 'tr' }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8 hover:border-white/30 transition-all duration-300"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
          <Hotel className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white mb-2">{hotel.name}</h3>
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{hotel.location}</span>
          </div>
        </div>
      </div>

      {hotel.distance && (
        <div className="mb-4 pb-4 border-b border-white/10">
          <p className="text-sm text-stone-400 mb-1">{copy[language].distance}</p>
          <p className="text-white font-medium">{hotel.distance}</p>
        </div>
      )}

      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="mb-4 pb-4 border-b border-white/10">
          <p className="text-sm text-stone-400 mb-2">{copy[language].amenities}</p>
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((amenity: string) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-stone-300 border border-white/10"
              >
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {hotel.phone && (
          <a
            href={`tel:${hotel.phone}`}
            className="flex items-center gap-2 text-stone-300 hover:text-cyan-300 transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            {hotel.phone}
          </a>
        )}
        {hotel.website && (
          <a
            href={hotel.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-stone-300 hover:text-cyan-300 transition-colors text-sm"
          >
            <Globe className="w-4 h-4" />
            {copy[language].booking}
          </a>
        )}
      </div>

      {hotel.bookingInfo && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-stone-400">{hotel.bookingInfo}</p>
        </div>
      )}
    </motion.div>
  )
}

export default function HotelsPage() {
  const { language, toggleLanguage } = useSnowLanguage()
  const [hotels, setHotels] = useState(placeholderHotels)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentCopy = copy[language]

  return (
    <>
      <Helmet>
        <title>{currentCopy.seo.title}</title>
        <meta name="description" content={currentCopy.seo.description} />
      </Helmet>

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/15 via-transparent to-teal-900/20" />
        <div className="absolute -left-40 -top-40 w-[620px] h-[620px] rounded-full bg-cyan-900/10 blur-[160px]" />
        <div className="absolute right-0 top-1/3 w-[520px] h-[520px] rounded-full bg-teal-950/10 blur-[140px]" />
      </div>

      {/* Language Toggle */}
      <div
        className={cn(
          'fixed z-40 flex items-center gap-2',
          'top-[calc(4.5rem+env(safe-area-inset-top))] right-[calc(0.75rem+env(safe-area-inset-right))]',
          'sm:top-[calc(5rem+env(safe-area-inset-top))] sm:right-[calc(1.5rem+env(safe-area-inset-right))]'
        )}
      >
        <motion.button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
          whileHover={reduceMotion ? undefined : { scale: 1.05 }}
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm font-semibold">{language === 'en' ? 'TR' : 'EN'}</span>
        </motion.button>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-32 pb-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{currentCopy.title}</h1>
            <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto">
              {currentCopy.subtitle}
            </p>
          </motion.div>

          {/* Hotels Grid */}
          {hotels.length === 0 ? (
            <div className="text-center py-20">
              <Hotel className="w-16 h-16 text-stone-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">{currentCopy.noHotels}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} language={language} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

