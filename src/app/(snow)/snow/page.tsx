'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Calendar, MapPin, Music, Users, ArrowRight, Languages, Snowflake } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useSnowLanguage } from '@/components/snow/useSnowLanguage'

const copy = {
  en: {
    hero: {
      title: 'Snow Sessions',
      subtitle: 'Origins Radio',
      date: 'Coming Soon',
      location: 'Erciyes Ski Resort',
      description: 'Electronic music meets mountain atmosphere. A unique festival experience combining the energy of music with the power of nature.',
    },
    about: {
      eyebrow: 'About Snow Sessions',
      title: 'Where Music Meets the Mountains',
      paragraphs: [
        'Snow Sessions by Origins Radio is a ski resort concept event series that brings electronic music to Turkey\'s most prestigious winter destinations.',
        'Held at Erciyes, Snow Sessions combines electronic music with mountain atmosphere, transforming music from something you just listen to into an experience you live.',
        'With all-day activities, winter sports, workshops, and world-renowned DJ performances, Snow Sessions offers participants a unique festival atmosphere that combines the energy of music with the power of nature.',
      ],
    },
    stats: {
      date: 'Event Date',
      location: 'Location',
      artists: 'Artists',
      duration: 'Duration',
    },
    cta: {
      viewLineup: 'View Line Up',
      seePackages: 'See Packages',
      reserveNow: 'Reserve Now',
    },
    seo: {
      title: 'Snow Sessions | Origins Radio',
      description: 'Snow Sessions by Origins Radio - Electronic music festival at Erciyes ski resort. Experience music and nature combined.',
    },
  },
  tr: {
    hero: {
      title: 'Snow Sessions',
      subtitle: 'Origins Radio',
      date: 'Yakında',
      location: 'Erciyes Kayak Merkezi',
      description: 'Elektronik müzik dağ atmosferiyle buluşuyor. Müziğin enerjisini doğanın gücüyle birleştiren benzersiz bir festival deneyimi.',
    },
    about: {
      eyebrow: 'Snow Sessions Hakkında',
      title: 'Müziğin Dağlarla Buluştuğu Yer',
      paragraphs: [
        'Origins Radio\'nun Snow Sessions\'ı, elektronik müziği Türkiye\'nin en prestijli kış destinasyonlarına getiren kayak konseptli bir etkinlik serisidir.',
        'Erciyes\'te düzenlenen Snow Sessions, elektronik müziği dağ atmosferiyle buluşturarak müziği sadece dinlenilen değil, yaşanılan bir deneyime dönüştürür.',
        'Gün boyunca süren aktiviteler, kış sporları, atölyeler ve sahne alan dünyaca ünlü DJ performanslarıyla Snow Sessions; katılımcılara müziğin enerjisini doğanın gücüyle birleştiren benzersiz bir festival atmosferi sunar.',
      ],
    },
    stats: {
      date: 'Etkinlik Tarihi',
      location: 'Konum',
      artists: 'Sanatçılar',
      duration: 'Süre',
    },
    cta: {
      viewLineup: 'Line Up\'ı Gör',
      seePackages: 'Paketleri Gör',
      reserveNow: 'Şimdi Rezervasyon Yap',
    },
    seo: {
      title: 'Snow Sessions | Origins Radio',
      description: 'Origins Radio Snow Sessions - Erciyes kayak merkezinde elektronik müzik festivali. Müzik ve doğanın birleştiği deneyim.',
    },
  },
}

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  center?: boolean
}) {
  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow ? (
        <p className="text-cyan-300/70 text-xs md:text-sm uppercase tracking-[0.22em] mb-3">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-base md:text-lg text-stone-400 ${
            center ? 'max-w-2xl mx-auto' : 'max-w-2xl'
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30">
      {children}
    </div>
  )
}

export default function SnowHomePage() {
  const { language, toggleLanguage } = useSnowLanguage()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentCopy = copy[language]

  const motionIn = reduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: 'easeOut' as const },
      }

  return (
    <>
      <Helmet>
        <title>{currentCopy.seo.title}</title>
        <meta name="description" content={currentCopy.seo.description} />
        <meta property="og:title" content={currentCopy.seo.title} />
        <meta property="og:description" content={currentCopy.seo.description} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/15 via-transparent to-teal-900/20" />
        <div className="absolute -left-40 -top-40 w-[620px] h-[620px] rounded-full bg-cyan-900/10 blur-[160px]" />
        <div className="absolute right-0 top-1/3 w-[520px] h-[520px] rounded-full bg-teal-950/10 blur-[140px]" />
        <div className="absolute -left-16 bottom-0 w-[420px] h-[420px] rounded-full bg-stone-800/15 blur-[120px]" />
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
          type="button"
          aria-label="Toggle language"
        >
          <Languages className="w-4 h-4" />
          <span className="text-sm font-semibold">{language === 'en' ? 'TR' : 'EN'}</span>
        </motion.button>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative z-10 px-6 pt-24 pb-16">
        <motion.div className="max-w-5xl mx-auto" {...motionIn}>
          <div className="mb-10 md:mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Snowflake className="w-6 h-6 text-cyan-300/70" />
              <span className="text-cyan-300/70 text-sm uppercase tracking-[0.22em]">
                {currentCopy.hero.subtitle}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-[1.05]">
              {currentCopy.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-stone-300 mb-8 max-w-3xl mx-auto">
              {currentCopy.hero.description}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <Calendar className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white mb-1">{currentCopy.hero.date}</div>
              <div className="text-xs text-stone-400 uppercase tracking-[0.18em]">
                {currentCopy.stats.date}
              </div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <MapPin className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white mb-1">{currentCopy.hero.location}</div>
              <div className="text-xs text-stone-400 uppercase tracking-[0.18em]">
                {currentCopy.stats.location}
              </div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <Music className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white mb-1">TBA</div>
              <div className="text-xs text-stone-400 uppercase tracking-[0.18em]">
                {currentCopy.stats.artists}
              </div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white mb-1">TBA</div>
              <div className="text-xs text-stone-400 uppercase tracking-[0.18em]">
                {currentCopy.stats.duration}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Link href="/lineup" className="w-full sm:w-auto">
              <motion.button
                className="w-full px-7 py-3 rounded-full bg-white text-stone-950 font-semibold hover:bg-stone-100 transition-colors"
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                type="button"
              >
                {currentCopy.cta.viewLineup} <ArrowRight className="inline w-4 h-4 ml-2" />
              </motion.button>
            </Link>
            <Link href="/prices" className="w-full sm:w-auto">
              <motion.button
                className="w-full px-7 py-3 rounded-full bg-stone-900/40 border border-white/15 text-white font-semibold hover:bg-stone-900/60 transition-colors"
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                type="button"
              >
                {currentCopy.cta.seePackages} <ArrowRight className="inline w-4 h-4 ml-2" />
              </motion.button>
            </Link>
            <Link href="/reservation" className="w-full sm:w-auto">
              <motion.div
                className="w-full px-7 py-3 rounded-full bg-cyan-300 text-stone-950 font-semibold hover:bg-cyan-200 transition-colors text-center"
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                {currentCopy.cta.reserveNow}
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-16 md:py-24 bg-black/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="space-y-8">
              <SectionTitle
                eyebrow={currentCopy.about.eyebrow}
                title={currentCopy.about.title}
              />
              <div className="space-y-4 text-lg text-stone-300 leading-relaxed">
                {currentCopy.about.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <SoftCard>
              <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
                <motion.div
                  className="w-62 h-62 rounded-full bg-cyan-400/10 flex items-center justify-center mb-4"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Image
                    src="/originslogo.png"
                    alt="Origins Radio"
                    width={220}
                    height={220}
                    className="object-contain"
                  />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">
                  {language === 'en' ? 'Origins Radio' : 'Origins Radio'}
                </h3>
                <p className="text-stone-400 leading-relaxed">
                  {language === 'en'
                    ? 'Electronic music selection and scene culture on the same line.'
                    : 'Seçkisi güçlü elektronik müzik ve sahne kültürü aynı çizgide.'}
                </p>
              </div>
            </SoftCard>
          </div>
        </div>
      </section>
    </>
  )
}



