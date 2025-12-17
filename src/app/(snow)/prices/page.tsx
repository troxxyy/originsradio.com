'use client'

import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { CheckCircle2, Languages, Ticket, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSnowLanguage } from '@/components/snow/useSnowLanguage'

const copy = {
  en: {
    title: 'Prices & Packages',
    subtitle: 'Choose the package that suits you best',
    earlyBird: 'Early Bird',
    standard: 'Standard',
    vip: 'VIP',
    included: 'What\'s Included',
    price: 'Price',
    available: 'Available',
    soldOut: 'Sold Out',
    addOns: 'Add-ons',
    skiRental: 'Ski Equipment Rental',
    transportation: 'Transportation',
    reserveNow: 'Reserve Now',
    seo: {
      title: 'Prices & Packages | Snow Sessions - Origins Radio',
      description: 'View pricing packages and add-ons for Snow Sessions at Erciyes.',
    },
  },
  tr: {
    title: 'Fiyatlar & Paketler',
    subtitle: 'Size en uygun paketi seçin',
    earlyBird: 'Erken Rezervasyon',
    standard: 'Standart',
    vip: 'VIP',
    included: 'Dahil Olanlar',
    price: 'Fiyat',
    available: 'Müsait',
    soldOut: 'Tükendi',
    addOns: 'Ek Hizmetler',
    skiRental: 'Kayak Ekipmanı Kiralama',
    transportation: 'Ulaşım',
    reserveNow: 'Şimdi Rezervasyon Yap',
    seo: {
      title: 'Fiyatlar & Paketler | Snow Sessions - Origins Radio',
      description: 'Erciyes\'te Snow Sessions için fiyat paketleri ve ek hizmetleri görüntüleyin.',
    },
  },
}

// Placeholder packages - will be populated from PDF
const placeholderPackages = [
  {
    id: 1,
    name: 'earlyBird',
    title: 'Early Bird',
    price: 'TBA',
    currency: 'TRY',
    features: ['Event Ticket', 'Welcome Drink', 'Access to All Stages'],
    available: true,
  },
  {
    id: 2,
    name: 'standard',
    title: 'Standard',
    price: 'TBA',
    currency: 'TRY',
    features: ['Event Ticket', 'Welcome Drink', 'Access to All Stages', 'Event Merchandise'],
    available: true,
  },
  {
    id: 3,
    name: 'vip',
    title: 'VIP',
    price: 'TBA',
    currency: 'TRY',
    features: [
      'VIP Event Ticket',
      'Welcome Drink',
      'Access to All Stages',
      'VIP Area Access',
      'Event Merchandise',
      'Priority Entry',
    ],
    available: true,
  },
]

function PackageCard({ pkg, language }: { pkg: any; language: 'en' | 'tr' }) {
  const reduceMotion = useReducedMotion()
  const isVip = pkg.name === 'vip'

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-white/5 border rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8 relative overflow-hidden',
        isVip
          ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-950/20 to-teal-950/20'
          : 'border-white/10 hover:border-white/30 transition-all duration-300'
      )}
    >
      {isVip && (
        <div className="absolute top-4 right-4">
          <Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          {language === 'en' ? copy.en[pkg.name as keyof typeof copy.en] : copy.tr[pkg.name as keyof typeof copy.tr]}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-cyan-300">{pkg.price}</span>
          {pkg.currency && <span className="text-stone-400 text-sm">{pkg.currency}</span>}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm text-stone-400 mb-4 uppercase tracking-wide">
          {copy[language].included}
        </p>
        <ul className="space-y-3">
          {pkg.features.map((feature: string, index: number) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span className="text-stone-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6 border-t border-white/10">
        {pkg.available ? (
          <a
            href="/reservation"
            className={cn(
              'block w-full text-center px-6 py-3 rounded-full font-semibold transition-colors',
              isVip
                ? 'bg-cyan-300 text-stone-950 hover:bg-cyan-200'
                : 'bg-white text-stone-950 hover:bg-stone-100'
            )}
          >
            {copy[language].reserveNow}
          </a>
        ) : (
          <div className="block w-full text-center px-6 py-3 rounded-full font-semibold bg-stone-800/50 text-stone-500 cursor-not-allowed">
            {copy[language].soldOut}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function PricesPage() {
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

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {placeholderPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} language={language} />
            ))}
          </div>

          {/* Add-ons Section */}
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{currentCopy.addOns}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <Ticket className="w-6 h-6 text-cyan-400 mb-2" />
                <h3 className="text-lg font-semibold text-white mb-2">{currentCopy.skiRental}</h3>
                <p className="text-stone-400 text-sm">Available on-site</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <Ticket className="w-6 h-6 text-cyan-400 mb-2" />
                <h3 className="text-lg font-semibold text-white mb-2">{currentCopy.transportation}</h3>
                <p className="text-stone-400 text-sm">Contact for details</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
