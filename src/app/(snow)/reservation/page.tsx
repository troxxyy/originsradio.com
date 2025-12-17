'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Languages, Mail, Phone, CreditCard, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSnowLanguage } from '@/components/snow/useSnowLanguage'

const copy = {
  en: {
    title: 'Reservation',
    subtitle: 'Book your spot at Snow Sessions',
    form: {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      package: 'Package',
      tickets: 'Number of Tickets',
      requests: 'Special Requests',
      terms: 'I agree to the terms and conditions',
      submit: 'Submit Reservation',
      submitting: 'Submitting...',
      success: 'Reservation submitted successfully! We will contact you soon.',
    },
    payment: {
      title: 'Payment Information',
      methods: 'Payment Methods',
      bankTransfer: 'Bank Transfer',
      creditCard: 'Credit Card',
      details: 'Payment details will be sent after reservation confirmation.',
    },
    contact: {
      title: 'Need Help?',
      email: 'Email us',
      phone: 'Call us',
      description: 'For questions or assistance with your reservation, please contact us.',
    },
    seo: {
      title: 'Reservation | Snow Sessions - Origins Radio',
      description: 'Reserve your spot at Snow Sessions by Origins Radio.',
    },
  },
  tr: {
    title: 'Rezervasyon',
    subtitle: 'Snow Sessions\'te yerinizi ayırtın',
    form: {
      name: 'Ad Soyad',
      email: 'E-posta',
      phone: 'Telefon Numarası',
      package: 'Paket',
      tickets: 'Bilet Sayısı',
      requests: 'Özel İstekler',
      terms: 'Şartları ve koşulları kabul ediyorum',
      submit: 'Rezervasyon Gönder',
      submitting: 'Gönderiliyor...',
      success: 'Rezervasyon başarıyla gönderildi! En kısa sürede sizinle iletişime geçeceğiz.',
    },
    payment: {
      title: 'Ödeme Bilgileri',
      methods: 'Ödeme Yöntemleri',
      bankTransfer: 'Banka Havalesi',
      creditCard: 'Kredi Kartı',
      details: 'Ödeme detayları rezervasyon onayından sonra gönderilecektir.',
    },
    contact: {
      title: 'Yardıma mı İhtiyacınız Var?',
      email: 'Bize e-posta gönderin',
      phone: 'Bizi arayın',
      description: 'Rezervasyonunuzla ilgili sorular veya yardım için lütfen bizimle iletişime geçin.',
    },
    seo: {
      title: 'Rezervasyon | Snow Sessions - Origins Radio',
      description: 'Origins Radio Snow Sessions\'te yerinizi ayırtın.',
    },
  },
}

const packages = [
  { value: 'earlyBird', label: 'Early Bird' },
  { value: 'standard', label: 'Standard' },
  { value: 'vip', label: 'VIP' },
]

export default function ReservationPage() {
  const { language, toggleLanguage } = useSnowLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    package: '',
    tickets: '1',
    requests: '',
    terms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentCopy = copy[language]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)

    // Create mailto link with form data
    const subject = encodeURIComponent(`Snow Sessions Reservation - ${formData.name}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nPackage: ${formData.package}\nTickets: ${formData.tickets}\nSpecial Requests: ${formData.requests}`
    )
    window.location.href = `mailto:info@originsradio.com?subject=${subject}&body=${body}`
  }

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>{currentCopy.seo.title}</title>
        </Helmet>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-neutral-950 to-stone-950" />
        </div>
        <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-32 pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-8 md:p-12"
            >
              <CheckCircle2 className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
              <p className="text-stone-300 text-lg">{currentCopy.form.success}</p>
            </motion.div>
          </div>
        </section>
      </>
    )
  }

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
        <div className="max-w-4xl mx-auto">
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

          <div className="grid md:grid-cols-2 gap-8">
            {/* Reservation Form */}
            <motion.div
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Reservation Form</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-stone-400 mb-2">{currentCopy.form.name}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-900/70 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-2">{currentCopy.form.email}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-900/70 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-2">{currentCopy.form.phone}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-900/70 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-2">{currentCopy.form.package}</label>
                  <select
                    required
                    value={formData.package}
                    onChange={(e) => setFormData({ ...formData, package: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-900/70 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300/40 transition-all"
                  >
                    <option value="">Select a package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.value} value={pkg.value}>
                        {pkg.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-2">{currentCopy.form.tickets}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.tickets}
                    onChange={(e) => setFormData({ ...formData, tickets: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-900/70 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-stone-400 mb-2">{currentCopy.form.requests}</label>
                  <textarea
                    value={formData.requests}
                    onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-stone-900/70 border border-white/15 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300/40 transition-all resize-none"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    checked={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-stone-900/70 text-cyan-400 focus:ring-cyan-400/30"
                  />
                  <label className="text-sm text-stone-400">{currentCopy.form.terms}</label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-full bg-cyan-300 text-stone-950 font-semibold hover:bg-cyan-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? currentCopy.form.submitting : currentCopy.form.submit}
                </button>
              </form>
            </motion.div>

            {/* Payment & Contact Info */}
            <div className="space-y-6">
              <motion.div
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4">{currentCopy.payment.title}</h2>
                <p className="text-stone-400 mb-4">{currentCopy.payment.details}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <span className="text-stone-300">{currentCopy.payment.creditCard}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <span className="text-stone-300">{currentCopy.payment.bankTransfer}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl shadow-black/30 p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4">{currentCopy.contact.title}</h2>
                <p className="text-stone-400 mb-4">{currentCopy.contact.description}</p>
                <div className="space-y-3">
                  <a
                    href="mailto:info@originsradio.com"
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-cyan-400" />
                    <span className="text-stone-300">{currentCopy.contact.email}</span>
                  </a>
                  <a
                    href="tel:+902122725696"
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <span className="text-stone-300">{currentCopy.contact.phone}</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
