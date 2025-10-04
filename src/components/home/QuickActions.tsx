import { Link } from 'react-router-dom'
import { Calendar, Users, Radio, Music, Instagram, Youtube } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

const QuickActions = () => {
  const actions = [
    {
      label: 'Browse Events',
      href: '/events',
      icon: Calendar,
      gradient: 'from-white/20 to-white/10',
      description: 'Check upcoming shows'
    },
    {
      label: 'Our Artists',
      href: '/artists',
      icon: Users,
      gradient: 'from-white/20 to-white/10',
      description: 'Meet the selectors'
    },
    {
      label: 'Live Radio',
      href: '#upnext',
      icon: Radio,
      gradient: 'from-white/20 to-white/10',
      description: 'Listen to sets'
    },
    {
      label: 'Anniversary',
      href: '/anniversary',
      icon: Music,
      gradient: 'from-white/20 to-white/10',
      description: 'Celebrate with us'
    },
  ]

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://instagram.com/origins.radio',
      icon: Instagram,
      color: 'from-white to-white/90'
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@originsradiotr',
      icon: Youtube,
      color: 'from-white to-white/90'
    },
  ]

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {actions.map((action, idx) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            <Link to={action.href}>
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-4 sm:p-5 text-center">
                  <div className={`inline-flex p-3 sm:p-4 rounded-2xl bg-white/10 mb-3 group-hover:scale-110 group-hover:bg-white/15 transition-all duration-300`}>
                    <action.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                    {action.label}
                  </h3>
                  <p className="text-xs text-white/60">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className="text-sm text-white/50">Follow us:</span>
        {socialLinks.map((social) => (
          <motion.a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-300`}
          >
            <social.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{social.label}</span>
          </motion.a>
        ))}
      </div>
    </section>
  )
}

export default QuickActions
