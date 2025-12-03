import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Origins Radio | Electronic Music Culture & Insights',
  description: 'Read stories, insights, and updates about electronic music culture, DJ interviews, event recaps, and music scene from Origins Radio.',
  openGraph: {
    title: 'Blog - Origins Radio',
    description: 'Stories, insights, and updates from Origins Radio',
    type: 'website',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
