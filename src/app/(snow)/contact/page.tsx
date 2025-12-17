'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Mail, Phone, MapPin, Languages, Instagram, Facebook } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSnowLanguage } from '@/components/snow/useSnowLanguage'

const copy = {
  en: {
    title: 'Contact',
    subtitle: 'Get in touch with us',
    email: {
      title: 'Email',
      subtitle: 'Best for reservations and inquiries',
      address: 'info@originsradio.com',
    },
    phone: {
      title: 'Phone',
      subtitle: 'Call us for immediate assistance',
      number: '+90 212 272 56 96',
    },
    address: {
      title: 'Address',
      subtitle: 'Visit us at our office',
      location: 'Istanbul, Turkey',
    },
    social: {
      title: 'Social Media',
      subtitle: 'Follow us for updates',
    },
    seo: {
      title: 'Contact | Snow Sessions - Origins Radio',
      description: 'Contact Origins Radio for Snow Sessions inquiries and reservations.',
    },
  },
  tr: {
    title: 'İletişim',
    subtitle: 'Bizimle iletişime geçin',
    email: {
      title: 'E-posta',
      subtitle: 'Rezervasyonlar ve sorular için en iyisi',
      address: 'info@originsradio.com',
    },
    phone: {
      title: 'Telefon',
      subtitle: 'Acil yardım için bizi arayın',
      number: '+90 212 272 56 96',
    },
    address: {
      title: 'Adres',
      subtitle: 'Ofisimizi ziyaret edin',
      location: 'İstanbul, Türkiye',
    },
    social: {
      title: 'Sosyal Medya',
      subtitle: 'Güncellemeler için bizi takip edin',
    },
    seo: {
      title: 'İletişim | Snow Sessions - Origins Radio',
      description: 'Snow Sessions rezervasyonları ve soruları için Origins Radio ile iletişime geçin.',
    },
  },
}

export default function ContactPage() {
  const { language, toggleLanguage } = useSnowLanguage()
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
        <div className="max-w-6xl mx-auto">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Email */}
            <motion.a
              href={`mailto:${currentCopy.email.address}`}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{currentCopy.email.title}</h3>
              <p className="text-stone-400 text-sm mb-4">{currentCopy.email.subtitle}</p>
              <p className="text-cyan-300 font-medium">{currentCopy.email.address}</p>
            </motion.a>

            {/* Phone */}
            <motion.a
              href={`tel:${currentCopy.phone.number.replace(/\s/g, '')}`}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4 group-hover:bg-cyan-400/20 transition-colors">
                <Phone className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{currentCopy.phone.title}</h3>
              <p className="text-stone-400 text-sm mb-4">{currentCopy.phone.subtitle}</p>
              <p className="text-cyan-300 font-medium">{currentCopy.phone.number}</p>
            </motion.a>

            {/* Address */}
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8"
            >
              <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{currentCopy.address.title}</h3>
              <p className="text-stone-400 text-sm mb-4">{currentCopy.address.subtitle}</p>
              <p className="text-cyan-300 font-medium">{currentCopy.address.location}</p>
            </motion.div>
          </div>

          {/* Social Media */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4">{currentCopy.social.title}</h3>
            <p className="text-stone-400 mb-6">{currentCopy.social.subtitle}</p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/origins.radio/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Instagram className="w-6 h-6 text-cyan-400" />
                <span className="text-stone-300 font-medium">Instagram</span>
              </a>
              <a
                href="https://www.facebook.com/originsradio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Facebook className="w-6 h-6 text-cyan-400" />
                <span className="text-stone-300 font-medium">Facebook</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
