import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, ArrowRight, Star, Music4 } from 'lucide-react'
import { useSets, useOurWorkProjects, useArtists } from '@/hooks/use-supabase'
import { generateSlug } from '@/lib/supabase-utils'

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

const HomeOverview = () => {
  const navigate = useNavigate()

  // Up Next (latest set)
  const { data: sets } = useSets()
  const latestSet = useMemo(() => {
    if (!sets || sets.length === 0) return null
    const sorted = [...sets].sort((a, b) => {
      const aNum = (a.set_number ?? -Infinity) as number
      const bNum = (b.set_number ?? -Infinity) as number
      return bNum - aNum
    })
    return sorted[0]
  }, [sets])

  // Upcoming events (2)
  const { data: projects } = useOurWorkProjects()
  const upcoming = useMemo(() => {
    return (projects || []).filter(p => !!p.upcoming).slice(0, 2)
  }, [projects])

  // Resident artists (4)
  const { data: artists } = useArtists()
  const residents = useMemo(() => {
    return (artists || []).filter(a => a.featured).slice(0, 4)
  }, [artists])

  const openArtist = (name: string) => {
    const slug = generateSlug(name)
    navigate(`/artists/${slug}`)
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Overview</h2>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/events" className="text-white/80 hover:text-white inline-flex items-center gap-1">
            Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to="/artists" className="text-white/80 hover:text-white inline-flex items-center gap-1">
            Artists <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latest Set */}
        <Link
          to="#upnext"
          className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
        >
          <div className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
              {latestSet?.artists?.photo_url ? (
                <img
                  src={latestSet.artists.photo_url}
                  alt={latestSet.artists.name || 'Artist'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music4 className="w-7 h-7 text-white/70" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-white/60">Up Next</div>
              <div className="text-white font-semibold truncate">
                {latestSet ? latestSet.title : 'No set yet'}
              </div>
              <div className="text-white/70 text-sm truncate">
                {latestSet?.artists?.name || 'Unknown Artist'}
              </div>
            </div>
          </div>
        </Link>

        {/* Upcoming Events (stacked) */}
        <div className="grid grid-rows-2 gap-4">
          {(upcoming.length > 0 ? upcoming : [null, null]).slice(0, 2).map((p, i) => (
            <Link
              key={p?.slug || `evt-${i}`}
              to={p?.slug ? `/events/${p.slug}` : '/events'}
              className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex gap-4 p-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                  {p ? (
                    <img
                      src={p.image_url || '/placeholder.svg'}
                      alt={p.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-white/60">Upcoming</div>
                  <div className="text-white font-semibold truncate">{p ? p.title : 'Coming soon'}</div>
                  <div className="text-white/70 text-sm flex items-center gap-3">
                    {p?.location && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5" /> {p.location}
                      </span>
                    )}
                    {formatDate(p?.date) && (
                      <span className="inline-flex items-center gap-1 truncate">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(p?.date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Resident Artists mini grid */}
        <div className="grid grid-cols-2 gap-4">
          {(residents.length > 0 ? residents : Array.from({ length: 4 })).slice(0, 4).map((a: any, i: number) => (
            <button
              key={a?.id || `ra-${i}`}
              type="button"
              onClick={() => a?.name && openArtist(a.name)}
              className="group rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] transition-colors text-left"
            >
              <div className="relative h-24 w-full">
                {a ? (
                  <img
                    src={a.photo_url || '/placeholder.svg'}
                    alt={a.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                  />
                ) : null}
                {a?.featured && (
                  <div className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white inline-flex items-center gap-1">
                    <Star className="w-3 h-3" /> RESIDENT
                  </div>
                )}
              </div>
              <div className="p-2">
                <div className="text-white text-sm font-medium truncate">{a ? a.name : 'Artist'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeOverview




















