import { useMemo } from 'react'
import { Music4, Calendar, Users, Radio, TrendingUp, Headphones } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useSets, useOurWorkProjects, useArtists } from '@/hooks/use-supabase'
import { motion } from 'framer-motion'

const HomeStats = () => {
  const { data: sets } = useSets()
  const { data: projects } = useOurWorkProjects()
  const { data: artists } = useArtists()

  const stats = useMemo(() => {
    const totalSets = sets?.length || 0
    const totalEvents = projects?.filter(p => p.upcoming)?.length || 0
    const totalArtists = artists?.length || 0
    const residentArtists = artists?.filter(a => a.featured)?.length || 0

    return [
      {
        label: 'Total Sets',
        value: totalSets,
        icon: Music4,
        gradient: 'from-white/20 to-white/10',
        description: 'Available mixes'
      },
      {
        label: 'Upcoming Events',
        value: totalEvents,
        icon: Calendar,
        gradient: 'from-white/20 to-white/10',
        description: 'On schedule'
      },
      {
        label: 'Artists',
        value: totalArtists,
        icon: Users,
        gradient: 'from-white/20 to-white/10',
        description: 'In the roster'
      },
      {
        label: 'Resident DJs',
        value: residentArtists,
        icon: Headphones,
        gradient: 'from-white/20 to-white/10',
        description: 'Core members'
      },
    ]
  }, [sets, projects, artists])

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Card className="border-white/[0.05] bg-white/[0.015] backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 group overflow-hidden relative">
              <CardContent className="p-4 sm:p-6 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 sm:p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.05] transition-all duration-300`}>
                    <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:text-white/80 transition-colors duration-300`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-white/90 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-white/60">
                    {stat.label}
                  </p>
                  <p className="text-xs text-white/40">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default HomeStats
