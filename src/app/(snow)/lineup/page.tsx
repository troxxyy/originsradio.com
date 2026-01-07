'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Music, Languages, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useSnowLanguage } from '@/components/snow/useSnowLanguage'

const copy = {
  en: {
    title: 'Line Up',
    subtitle: 'World-renowned DJs and artists performing at Snow Sessions',
    loading: 'Loading artists...',
    noArtists: 'Lineup coming soon. Check back for updates.',
    viewProfile: 'View Profile',
    seo: {
      title: 'Line Up | Snow Sessions - Origins Radio',
      description: 'Discover the artists and DJs performing at Snow Sessions by Origins Radio.',
    },
  },
  tr: {
    title: 'Line Up',
    subtitle: 'Snow Sessions\'te sahne alan dünyaca ünlü DJ\'ler ve sanatçılar',
    loading: 'Sanatçılar yükleniyor...',
    noArtists: 'Lineup yakında. Güncellemeler için tekrar kontrol edin.',
    viewProfile: 'Profili Gör',
    seo: {
      title: 'Line Up | Snow Sessions - Origins Radio',
      description: 'Origins Radio Snow Sessions\'te sahne alan sanatçıları ve DJ\'leri keşfedin.',
    },
  },
}

// Placeholder artists - will be populated from PDF or database
const placeholderArtists = [
  {
    id: 1,
    name: 'Artist Name',
    genre: ['Techno', 'House'],
    photo: '/placeholder.svg',
    slug: 'artist-name',
  },
]

function ArtistCard({ artist, language }: { artist: any; language: 'en' | 'tr' }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="bg-stone-950/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-900/10 transform-gpu hover:-translate-y-2 h-full flex flex-col">
        <div className="relative aspect-[4/5] overflow-hidden flex-shrink-0">
          <Image
            src={artist.photo || '/placeholder.svg'}
            alt={artist.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        </div>
        <div className="p-6 flex-1 flex flex-col relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-cyan-400/50 transition-all duration-500" />
          <div className="mb-auto">
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors leading-none">
              {artist.name}
            </h3>
            {artist.genre && artist.genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {artist.genre.slice(0, 3).map((genre: string) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-stone-300 border border-white/10 uppercase tracking-wide"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-stone-500 group-hover:text-stone-400 transition-colors">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0">
              {copy[language].viewProfile}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-300 group-hover:text-black transition-all duration-300">
              <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LineupPage() {
  const { language, toggleLanguage } = useSnowLanguage()
  const [artists, setArtists] = useState(placeholderArtists)
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

          {/* Artists Grid */}
          {artists.length === 0 ? (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-stone-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">{currentCopy.noArtists}</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} language={language} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

