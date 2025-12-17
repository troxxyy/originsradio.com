'use client'

import { ReactNode } from 'react'
import SnowNavigation from '@/components/snow/SnowNavigation'
import PageLayout from '@/components/layout/PageLayout'
import { SnowLanguageProvider } from '@/components/snow/useSnowLanguage'

export default function SnowLayout({ children }: { children: ReactNode }) {
  return (
    <SnowLanguageProvider>
      <PageLayout showFooter={false}>
        <SnowNavigation />
        {children}
      </PageLayout>
    </SnowLanguageProvider>
  )
}
