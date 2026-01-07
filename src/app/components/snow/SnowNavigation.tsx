'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useSnowLanguage } from './useSnowLanguage'

interface NavLink {
  name: string
  nameTr: string
  href: string
}

const navLinks: NavLink[] = [
  { name: 'About', nameTr: 'Hakkında', href: '/' },
  { name: 'Line Up', nameTr: 'Line Up', href: '/lineup' },
  { name: 'Hotels', nameTr: 'Oteller', href: '/hotels' },
  { name: 'Prices', nameTr: 'Fiyatlar', href: '/prices' },
  { name: 'Reservation', nameTr: 'Rezervasyon', href: '/reservation' },
  { name: 'Contact', nameTr: 'İletişim', href: '/contact' },
]

export default function SnowNavigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { language, toggleLanguage } = useSnowLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === ''
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "bg-stone-950/80 backdrop-blur-xl border-b border-white/10",
      "transition-all duration-300",
      mounted ? "opacity-100" : "opacity-0"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src="/originslogo.png"
                alt="Origins Radio"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white font-bold text-lg md:text-xl">
              Snow Sessions
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  isActive(link.href)
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {language === 'en' ? link.name : link.nameTr}
              </Link>
            ))}
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
              aria-label="Toggle language"
            >
              <Languages className="w-4 h-4" />
              <span className="text-sm font-semibold">{language === 'en' ? 'TR' : 'EN'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-white/10 border border-white/20 text-white"
            >
              <Languages className="w-3 h-3" />
              <span className="text-xs font-semibold">{language === 'en' ? 'TR' : 'EN'}</span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full bg-white/10 border border-white/20 text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-white/10 mt-2"
          >
            <div className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive(link.href)
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {language === 'en' ? link.name : link.nameTr}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}


