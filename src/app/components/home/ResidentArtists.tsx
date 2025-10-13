'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useArtists } from '@/hooks/use-supabase'
import { generateSlug } from '@/lib/supabase-utils'

type ResidentArtistsProps = {
  compact?: boolean
  maxItems?: number
  title?: string
}

const ResidentArtists = ({ compact = false, maxItems, title }: ResidentArtistsProps) => {
  const { data: artists, isLoading, error } = useArtists()
  const router = useRouter()

  const residents = useMemo(() => {
    const defaultMax = compact ? 6 : 8
    const limit = typeof maxItems === 'number' ? maxItems : defaultMax
    return (artists || []).filter(a => a.featured).slice(0, limit)
  }, [artists])

  const openArtist = (name: string) => {
    const slug = generateSlug(name)
    router.push(`/artists/${slug}`)
  }

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 ${compact ? 'py-6' : 'py-12 sm:py-16'}`}>
      <div className={`${compact ? 'mb-4' : 'mb-8'}`}>
        <h2 className={`${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-bold text-white flex items-center gap-2`}>
          <Star className="w-7 h-7 text-red-500" /> {title || 'Resident Artists'}
        </h2>
        {!compact && <p className="text-white/70 mt-2">Meet our core DJs and selectors</p>}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-white/70">Loading artists...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">Failed to load artists</div>
      ) : residents.length === 0 ? (
        <div className="text-center py-12 text-white/70">Resident artists will appear here.</div>
      ) : (
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 ${compact ? 'gap-4' : 'gap-6'}`}>
          {residents.map((a, idx) => (
            <motion.button
              key={a.id}
              type="button"
              onClick={() => openArtist(a.name)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group text-left rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className={`relative ${compact ? 'h-36' : 'h-56'} w-full overflow-hidden`}>
                <img
                  src={a.photo_url || '/placeholder.svg'}
                  alt={a.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {a.featured && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-500/30">
                      <Star className="w-3 h-3 fill-current" />
                      <span>RESIDENT</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`${compact ? 'p-3' : 'p-4'}`}>
                <h3 className={`text-white font-semibold ${compact ? 'text-base' : 'text-lg'}`}>{a.name}</h3>
                {Array.isArray(a.genre) && a.genre.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.genre.slice(0, 3).map((g, i) => (
                      <span key={i} className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  )
}

export default ResidentArtists


