import { Artist } from '../types/artist';

// Artist categories for better organization
export const ARTIST_CATEGORIES = {
  FEATURED: 'featured',
  LOCAL: 'local',
  INTERNATIONAL: 'international',
  UPCOMING: 'upcoming',
  ESTABLISHED: 'established',
  EMERGING: 'emerging'
} as const;

export type ArtistCategory = typeof ARTIST_CATEGORIES[keyof typeof ARTIST_CATEGORIES];

// Extended artist interface with management fields
export interface ManagedArtist extends Artist {
  category: ArtistCategory[];
  priority: number; // For sorting (1 = highest priority)
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
  views: number;
  featuredUntil?: string; // For temporary featuring
}

// Initial sample data
const initialArtists: ManagedArtist[] = [
  {
    id: 'egemen-alpay',
    name: 'Egemen Alpay',
    bio: 'Egemen Alpay stands out as a rising artist in the world of electronic music. In 2018, Alpay became interested in electronic music and quickly gained a wide audience with his versatile musical style. In his sets, he blends unique melodic sounds with dynamic and intriguing rhythms, aiming to give listeners an unforgettable experience. Thanks to his versatility, he appeals to a wider audience by combining different genres in his music. Egemen Alpay, who has made a name for himself by sharing the same stage with famous names such as Claptone, NTO, Hozho, David August and Space Motion, is taking firm steps forward in his career with his production projects, radio sets and stage performances and continues to gain an important place in the electronic music scene.',
    photo: '/artistsphoto-local/egemenalpay.webp',
    coverImage: '/artistsphoto-local/egemenalpay.webp',
    genre: ['Electronic', 'Melodic', 'Progressive'],
    location: 'Istanbul, Turkey',
    category: [ARTIST_CATEGORIES.LOCAL, ARTIST_CATEGORIES.EMERGING],
    priority: 1,
    status: 'active',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
    views: 0,
    socialLinks: {
      instagram: 'https://www.instagram.com/egemen.alpay',
      soundcloud: 'https://soundcloud.com/egemenalpay1',
    },
    tracks: [],
    events: [],
    featured: true
  },
  {
    id: 'lina-palamarchuk',
    name: 'Lina Palamarchuk',
    bio: 'Lina started her musical career in 2022. In her performances. Lina combines breakbeat, deep melodic, and hypnotic sounds with dynamic techno and transitions, taking the audience on a journey that unites music and feelings. Lina has also performed at major venues such as Klein Phonix, Zorlu Studio, Kite, and Kafes.',
    photo: '/artistsphoto-local/lina.jpeg',
    coverImage: '/artistsphoto-local/lina.jpeg',
    genre: ['Breakbeat', 'Deep Melodic', 'Hypnotic', 'Techno'],
    location: 'Istanbul, Turkey',
    category: [ARTIST_CATEGORIES.LOCAL, ARTIST_CATEGORIES.EMERGING],
    priority: 2,
    status: 'active',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-01',
    views: 0,
    socialLinks: {
      instagram: 'https://www.instagram.com/1linapalamarchuk/',
    },
    tracks: [],
    events: [],
    featured: false
  }
];

// Get current artists (static data)
export const getArtists = (): ManagedArtist[] => {
  return initialArtists;
};

// Note: These functions are disabled since we're using static data
// To modify artists, edit the initialArtists array directly

// Add new artist (disabled - edit initialArtists array instead)
export const addArtist = (artistData: Omit<ManagedArtist, 'id' | 'createdAt' | 'updatedAt' | 'views'>): ManagedArtist => {
  console.warn('addArtist is disabled - edit initialArtists array directly');
  return artistData as ManagedArtist;
};

// Update existing artist (disabled - edit initialArtists array instead)
export const updateArtist = (id: string, updates: Partial<ManagedArtist>): ManagedArtist | null => {
  console.warn('updateArtist is disabled - edit initialArtists array directly');
  return null;
};

// Delete artist (disabled - edit initialArtists array instead)
export const deleteArtist = (id: string): boolean => {
  console.warn('deleteArtist is disabled - edit initialArtists array directly');
  return false;
};

// Bulk operations (disabled - edit initialArtists array instead)
export const bulkUpdateArtists = (ids: string[], updates: Partial<ManagedArtist>): void => {
  console.warn('bulkUpdateArtists is disabled - edit initialArtists array directly');
};

export const bulkDeleteArtists = (ids: string[]): number => {
  console.warn('bulkDeleteArtists is disabled - edit initialArtists array directly');
  return 0;
};

// Generate unique artist ID
const generateArtistId = (name: string): string => {
  const baseId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const artists = initialArtists;
  let id = baseId;
  let counter = 1;
  
  while (artists.some(artist => artist.id === id)) {
    id = `${baseId}-${counter}`;
    counter++;
  }
  
  return id;
};

// Update artist views (for analytics) - disabled
export const incrementArtistViews = (id: string): void => {
  console.warn('incrementArtistViews is disabled - using static data');
};

// Export data
export const exportArtistsData = (): string => {
  return JSON.stringify(initialArtists, null, 2);
};

// Import data (disabled - edit initialArtists array instead)
export const importArtistsData = (data: string): boolean => {
  console.warn('importArtistsData is disabled - edit initialArtists array directly');
  return false;
};

// Reset to initial data (disabled - using static data)
export const resetToInitialData = (): void => {
  console.warn('resetToInitialData is disabled - using static data');
};

// Force reset (disabled - using static data)
export const forceReset = (): void => {
  console.warn('forceReset is disabled - using static data');
};

// Updated query functions that use static data
export const getArtistById = (id: string): ManagedArtist | undefined => {
  return initialArtists.find(artist => artist.id === id);
};

export const getFeaturedArtists = (): ManagedArtist[] => {
  return initialArtists.filter(artist => artist.featured);
};

export const getAllArtists = (): ManagedArtist[] => {
  return initialArtists;
};

export const getArtistsByCategory = (category: ArtistCategory): ManagedArtist[] => {
  return initialArtists.filter(artist => artist.category.includes(category));
};

export const getArtistsByLocation = (location: string): ManagedArtist[] => {
  return initialArtists.filter(artist => 
    artist.location.toLowerCase().includes(location.toLowerCase())
  );
};

export const getArtistsByGenre = (genre: string): ManagedArtist[] => {
  return initialArtists.filter(artist => 
    artist.genre.some(g => g.toLowerCase().includes(genre.toLowerCase()))
  );
};

export const searchArtists = (query: string): ManagedArtist[] => {
  const searchTerm = query.toLowerCase();
  
  return initialArtists.filter(artist => 
    artist.name.toLowerCase().includes(searchTerm) ||
    artist.bio.toLowerCase().includes(searchTerm) ||
    artist.location.toLowerCase().includes(searchTerm) ||
    artist.genre.some(genre => genre.toLowerCase().includes(searchTerm))
  );
};

export const getPaginatedArtists = (
  page: number = 1, 
  limit: number = 12, 
  filters: {
    category?: ArtistCategory;
    location?: string;
    genre?: string;
    search?: string;
    status?: 'active' | 'inactive' | 'pending' | 'all';
  } = {}
): { artists: ManagedArtist[]; total: number; pages: number } => {
  let artists = initialArtists;
  
  // Apply filters
  if (filters.category) {
    artists = artists.filter(artist => artist.category.includes(filters.category!));
  }
  
  if (filters.location && filters.location !== 'all') {
    artists = artists.filter(artist => 
      artist.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  if (filters.genre && filters.genre !== 'all') {
    artists = artists.filter(artist => 
      artist.genre.some(genre => genre.toLowerCase().includes(filters.genre!.toLowerCase()))
    );
  }
  
  if (filters.status && filters.status !== 'all') {
    artists = artists.filter(artist => artist.status === filters.status);
  }
  
  if (filters.search) {
    artists = searchArtists(filters.search);
  }
  
  // Sort by priority, then by name
  artists.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.name.localeCompare(b.name);
  });
  
  const total = artists.length;
  const pages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    artists: artists.slice(startIndex, endIndex),
    total,
    pages
  };
};

export const getArtistStats = () => {
  return {
    total: initialArtists.length,
    active: initialArtists.filter(a => a.status === 'active').length,
    inactive: initialArtists.filter(a => a.status === 'inactive').length,
    pending: initialArtists.filter(a => a.status === 'pending').length,
    featured: initialArtists.filter(a => a.featured).length,
    topViewed: initialArtists
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(artist => ({ id: artist.id, name: artist.name, views: artist.views }))
  };
}; 