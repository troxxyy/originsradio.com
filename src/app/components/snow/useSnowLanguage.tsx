'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'tr'

interface SnowLanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

const SnowLanguageContext = createContext<SnowLanguageContextType | undefined>(undefined)

export function SnowLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    // Load language from localStorage if available
    const saved = localStorage.getItem('snow-language') as Language | null
    if (saved === 'en' || saved === 'tr') {
      setLanguage(saved)
    }
  }, [])

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('snow-language', language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'tr' : 'en')
  }

  return (
    <SnowLanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </SnowLanguageContext.Provider>
  )
}

export function useSnowLanguage() {
  const context = useContext(SnowLanguageContext)
  if (context === undefined) {
    throw new Error('useSnowLanguage must be used within SnowLanguageProvider')
  }
  return context
}

