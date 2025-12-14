'use client'

import Link from 'next/link'
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
      description: 'Upcoming shows'
    },
    {
      label: 'Our Artists',
      href: '/artists',
      icon: Users,
      gradient: 'from-white/20 to-white/10',
      description: 'Meet the DJs'
    },
    {
      label: 'Live Radio',
      href: '#upnext',
      icon: Radio,
      gradient: 'from-white/20 to-white/10',
      description: 'Listen now'
    },
    {
      label: 'Anniversary',
      href: '/anniversary',
      icon: Music,
      gradient: 'from-white/20 to-white/10',
      description: 'Special event'
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
            <Link href={action.href}>
              <Card className="border-white/[0.05] bg-white/[0.015] backdrop-blur-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-4 sm:p-5 text-center">
                  <div className={`inline-flex p-3 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-3 group-hover:bg-white/[0.06] group-hover:border-white/[0.1] transition-all duration-300`}>
                    <action.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white/60 group-hover:text-white/80 transition-colors duration-300" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white/80 group-hover:text-white/95 mb-1 transition-colors duration-300">
                    {action.label}
                  </h3>
                  <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors duration-300">
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
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm font-medium hover:bg-white/[0.06] hover:border-white/[0.12] hover:text-white/95 transition-all duration-300`}
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
