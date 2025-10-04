import { useMemo } from 'react'
import { Sparkles, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useSets } from '@/hooks/use-supabase'

const FeaturedContent = () => {
  const { data: sets } = useSets()

  const featuredSet = useMemo(() => {
    if (!sets || sets.length === 0) return null
    // Get the latest set as featured
    const sorted = [...sets].sort((a, b) => {
      const aNum = (a.set_number ?? -Infinity) as number
      const bNum = (b.set_number ?? -Infinity) as number
      return bNum - aNum
    })
    return sorted[0]
  }, [sets])

  if (!featuredSet) return null

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-white" />
        <h2 className="text-xl sm:text-2xl font-bold text-white">Featured This Week</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-white/20 bg-gradient-to-br from-white/[0.1] to-white/[0.03] backdrop-blur-md overflow-hidden group relative">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-white/5 opacity-50"></div>
          
          <CardContent className="p-0 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image section */}
              <div className="relative h-64 md:h-full overflow-hidden">
                {featuredSet.artists?.photo_url ? (
                  <img
                    src={featuredSet.artists.photo_url}
                    alt={featuredSet.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Featured badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white hover:bg-white/90 text-black font-bold border-none">
                    ✨ FEATURED
                  </Badge>
                </div>
              </div>

              {/* Content section */}
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <div className="mb-4">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {featuredSet.title}
                  </h3>
                  <p className="text-lg text-white/80 mb-2">
                    by {featuredSet.artists?.name || 'Unknown Artist'}
                  </p>
                  {featuredSet.artists?.location && (
                    <p className="text-sm text-white/60">
                      📍 {featuredSet.artists.location}
                    </p>
                  )}
                </div>

                {featuredSet.set_number && (
                  <div className="mb-4">
                    <Badge variant="outline" className="bg-white/10 border-white/20">
                      Set #{featuredSet.set_number}
                    </Badge>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <a
                    href="#upnext"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
                  >
                    <span>Listen Now</span>
                  </a>
                  {featuredSet.artists?.instagram && (
                    <a
                      href={featuredSet.artists.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                    >
                      <span>Follow Artist</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

export default FeaturedContent
