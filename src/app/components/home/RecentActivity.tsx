import { useMemo } from 'react'
import { Activity, Music, Calendar, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { motion } from 'framer-motion'
import { useSets, useOurWorkProjects } from '@/hooks/use-supabase'

type ActivityItem = {
  id: string
  type: 'set' | 'event'
  title: string
  subtitle: string
  timestamp: string
  icon: any
  image?: string
}

const RecentActivity = () => {
  const { data: sets } = useSets()
  const { data: projects } = useOurWorkProjects()

  const activities = useMemo(() => {
    const items: ActivityItem[] = []

    // Add recent sets
    if (sets) {
      sets.slice(0, 3).forEach(set => {
        items.push({
          id: `set-${set.id}`,
          type: 'set',
          title: `New set: ${set.title}`,
          subtitle: `by ${set.artists?.name || 'Unknown Artist'}`,
          timestamp: new Date(set.release_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          icon: Music,
          image: set.artists?.photo_url
        })
      })
    }

    // Add upcoming events
    if (projects) {
      const upcoming = projects.filter(p => p.upcoming).slice(0, 2)
      upcoming.forEach(event => {
        items.push({
          id: `event-${event.id}`,
          type: 'event',
          title: `Event: ${event.title}`,
          subtitle: event.location || 'Location TBA',
          timestamp: event.date ? new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }) : 'TBA',
          icon: Calendar,
          image: event.image_url
        })
      })
    }

    // Sort by most recent
    return items.slice(0, 5)
  }, [sets, projects])

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card className="border-white/[0.05] bg-white/[0.015] backdrop-blur-sm hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-300 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 border border-white/[0.05] hover:border-white/[0.08]"
                  >
                    <Avatar className="w-12 h-12 border-2 border-white/[0.08]">
                      {activity.image && (
                        <AvatarImage src={activity.image} alt={activity.title} />
                      )}
                      <AvatarFallback className="bg-white/[0.03]">
                        <activity.icon className="w-5 h-5 text-white/70" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {activity.subtitle}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {activity.timestamp}
                      </p>
                    </div>

                    <div className={`px-2 py-1 rounded-full text-xs font-medium bg-white/[0.03] border border-white/[0.05] text-white/50`}>
                      {activity.type}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-white/[0.05] bg-white/[0.015] backdrop-blur-sm hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Music className="w-5 h-5 text-white/70" />
                  <span className="text-2xl font-bold text-white">
                    {sets?.length || 0}
                  </span>
                </div>
                <p className="text-sm text-white/70">Total Sets</p>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-5 h-5 text-white/70" />
                  <span className="text-2xl font-bold text-white">
                    {projects?.filter(p => p.upcoming)?.length || 0}
                  </span>
                </div>
                <p className="text-sm text-white/70">Upcoming Events</p>
              </div>

              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.08] transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-white/70" />
                  <span className="text-2xl font-bold text-white">Active</span>
                </div>
                <p className="text-sm text-white/70">Radio Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default RecentActivity
