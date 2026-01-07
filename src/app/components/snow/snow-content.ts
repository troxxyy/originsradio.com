/**
 * Snow Sessions Event Content
 * 
 * This file contains all event content that should be extracted from the PDF.
 * Update this file with actual event details from Origins_Erciyes_Etkinlik_Dosyasi.pdf
 */

export interface Artist {
  id: number
  name: string
  genre: string[]
  photo: string
  slug?: string
  performanceTime?: string
}

export interface Hotel {
  id: number
  name: string
  location: string
  distance: string
  amenities: string[]
  phone?: string
  website?: string
  bookingInfo?: string
}

export interface Package {
  id: number
  name: 'earlyBird' | 'standard' | 'vip'
  title: string
  price: string
  currency: string
  features: string[]
  available: boolean
}

// TODO: Extract from PDF - Event Dates
export const eventDates = {
  startDate: 'TBA', // Extract from PDF
  endDate: 'TBA', // Extract from PDF
  location: 'Erciyes Ski Resort',
}

// TODO: Extract from PDF - Artist Lineup
export const artists: Artist[] = [
  // Example structure:
  // {
  //   id: 1,
  //   name: 'Artist Name',
  //   genre: ['Techno', 'House'],
  //   photo: '/artists/artist-name.jpg',
  //   slug: 'artist-name',
  //   performanceTime: '22:00',
  // },
]

// TODO: Extract from PDF - Hotels
export const hotels: Hotel[] = [
  // Example structure:
  // {
  //   id: 1,
  //   name: 'Hotel Name',
  //   location: 'Erciyes',
  //   distance: '500m from event',
  //   amenities: ['WiFi', 'Spa', 'Restaurant', 'Parking'],
  //   phone: '+90 XXX XXX XX XX',
  //   website: 'https://example.com',
  //   bookingInfo: 'Contact for special rates',
  // },
]

// TODO: Extract from PDF - Packages
export const packages: Package[] = [
  // Example structure:
  // {
  //   id: 1,
  //   name: 'earlyBird',
  //   title: 'Early Bird',
  //   price: '1500',
  //   currency: 'TRY',
  //   features: ['Event Ticket', 'Welcome Drink', 'Access to All Stages'],
  //   available: true,
  // },
]

// TODO: Extract from PDF - Contact Information
export const contactInfo = {
  email: 'info@originsradio.com',
  phone: '+90 212 272 56 96',
  address: 'Istanbul, Turkey',
  instagram: 'https://www.instagram.com/origins.radio/',
  facebook: 'https://www.facebook.com/originsradio',
}


