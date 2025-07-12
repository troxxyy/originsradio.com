import { ManagedArtist, ARTIST_CATEGORIES, type ArtistCategory } from '@/data/artists';

// CSV Export/Import utilities
export const exportArtistsToCSV = (artists: ManagedArtist[]): string => {
  const headers = [
    'id',
    'name',
    'bio',
    'photo',
    'coverImage',
    'genre',
    'location',
    'category',
    'priority',
    'status',
    'createdAt',
    'updatedAt',
    'views',
    'featured',
    'instagram',
    'soundcloud',
    'spotify',
    'youtube',
    'facebook'
  ];

  const csvRows = [headers.join(',')];

  artists.forEach(artist => {
    const row = [
      artist.id,
      `"${artist.name}"`,
      `"${artist.bio.replace(/"/g, '""')}"`,
      artist.photo,
      artist.coverImage || '',
      `"${artist.genre.join(';')}"`,
      `"${artist.location}"`,
      `"${artist.category.join(';')}"`,
      artist.priority.toString(),
      artist.status,
      artist.createdAt,
      artist.updatedAt,
      artist.views.toString(),
      artist.featured.toString(),
      artist.socialLinks?.instagram || '',
      artist.socialLinks?.soundcloud || '',
      artist.socialLinks?.spotify || '',
      artist.socialLinks?.youtube || '',
      artist.socialLinks?.facebook || ''
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

export const importArtistsFromCSV = (csvData: string): ManagedArtist[] => {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const artists: ManagedArtist[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = line.split(',').map(v => v.trim());
    const artist: any = {};

    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      switch (header) {
        case 'genre':
          artist.genre = value.split(';').filter(Boolean);
          break;
        case 'category':
          artist.category = value.split(';').filter(Boolean) as ArtistCategory[];
          break;
        case 'priority':
        case 'views':
          artist[header] = parseInt(value) || 0;
          break;
        case 'featured':
          artist.featured = value === 'true';
          break;
        case 'instagram':
        case 'soundcloud':
        case 'spotify':
        case 'youtube':
        case 'facebook':
          if (!artist.socialLinks) artist.socialLinks = {};
          if (value) artist.socialLinks[header] = value;
          break;
        default:
          artist[header] = value;
      }
    });

    // Validate required fields
    if (artist.id && artist.name) {
      artists.push(artist as ManagedArtist);
    }
  }

  return artists;
};

// Bulk operations
export const bulkUpdateArtists = (
  artistIds: string[],
  updates: Partial<ManagedArtist>
): Promise<void> => {
  return new Promise((resolve) => {
    // In a real app, this would make API calls
    console.log('Bulk updating artists:', artistIds, updates);
    setTimeout(resolve, 1000);
  });
};

export const bulkDeleteArtists = (artistIds: string[]): Promise<void> => {
  return new Promise((resolve) => {
    // In a real app, this would make API calls
    console.log('Bulk deleting artists:', artistIds);
    setTimeout(resolve, 1000);
  });
};

// Data validation
export const validateArtist = (artist: Partial<ManagedArtist>): string[] => {
  const errors: string[] = [];

  if (!artist.id) errors.push('Artist ID is required');
  if (!artist.name) errors.push('Artist name is required');
  if (!artist.bio) errors.push('Artist bio is required');
  if (!artist.location) errors.push('Artist location is required');
  if (!artist.genre || artist.genre.length === 0) errors.push('At least one genre is required');
  if (!artist.category || artist.category.length === 0) errors.push('At least one category is required');
  
  if (artist.priority !== undefined && (artist.priority < 1 || artist.priority > 100)) {
    errors.push('Priority must be between 1 and 100');
  }

  if (artist.views !== undefined && artist.views < 0) {
    errors.push('Views cannot be negative');
  }

  return errors;
};

// Data generation for testing
export const generateSampleArtists = (count: number): ManagedArtist[] => {
  const sampleNames = [
    'Alex Nova', 'Maya Pulse', 'DJ Zenith', 'Echo Wave', 'Neon Dreams',
    'Crystal Beat', 'Shadow Tech', 'Luna Bass', 'Cosmic Flow', 'Digital Soul',
    'Void Master', 'Echo Chamber', 'Neon Nights', 'Crystal Clear', 'Shadow Box',
    'Luna Phase', 'Cosmic Dust', 'Digital Age', 'Void Space', 'Echo Valley'
  ];

  const sampleLocations = [
    'Ankara, Turkey', 'Istanbul, Turkey', 'Berlin, Germany', 'London, UK',
    'Amsterdam, Netherlands', 'Paris, France', 'Barcelona, Spain', 'Milan, Italy',
    'Kiev, Ukraine', 'Moscow, Russia', 'Warsaw, Poland', 'Prague, Czech Republic'
  ];

  const sampleGenres = [
    'Techno', 'House', 'Deep House', 'Progressive House', 'Trance',
    'Ambient', 'Experimental', 'Industrial', 'Minimal', 'Dub Techno'
  ];

  const artists: ManagedArtist[] = [];

  for (let i = 0; i < count; i++) {
    const name = sampleNames[i % sampleNames.length];
    const location = sampleLocations[i % sampleLocations.length];
    const genre = [sampleGenres[i % sampleGenres.length]];
    
    artists.push({
      id: `artist-${i + 1}`,
      name: `${name} ${i + 1}`,
      bio: `A talented electronic music producer from ${location.split(',')[0]}, known for their unique sound and innovative approach to ${genre[0]} music.`,
      photo: `/team/artist-${i + 1}.jpg`,
      coverImage: `/album-art/artist-${i + 1}.jpg`,
      genre,
      location,
      category: [ARTIST_CATEGORIES.LOCAL, ARTIST_CATEGORIES.EMERGING],
      priority: Math.floor(Math.random() * 10) + 1,
      status: 'active' as const,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      views: Math.floor(Math.random() * 10000),
      featured: Math.random() > 0.8,
      socialLinks: {
        instagram: `https://instagram.com/${name.toLowerCase().replace(/\s+/g, '')}`,
        soundcloud: `https://soundcloud.com/${name.toLowerCase().replace(/\s+/g, '')}`,
      },
      tracks: [],
      events: []
    });
  }

  return artists;
};

// Search and filter utilities
export const searchArtistsAdvanced = (
  artists: ManagedArtist[],
  query: string,
  filters: {
    category?: ArtistCategory[];
    location?: string[];
    genre?: string[];
    status?: string[];
    featured?: boolean;
  } = {}
): ManagedArtist[] => {
  let filtered = artists;

  // Text search
  if (query) {
    const searchTerm = query.toLowerCase();
    filtered = filtered.filter(artist =>
      artist.name.toLowerCase().includes(searchTerm) ||
      artist.bio.toLowerCase().includes(searchTerm) ||
      artist.genre.some(g => g.toLowerCase().includes(searchTerm)) ||
      artist.location.toLowerCase().includes(searchTerm)
    );
  }

  // Category filter
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(artist =>
      artist.category.some(cat => filters.category!.includes(cat))
    );
  }

  // Location filter
  if (filters.location && filters.location.length > 0) {
    filtered = filtered.filter(artist =>
      filters.location!.some(loc => 
        artist.location.toLowerCase().includes(loc.toLowerCase())
      )
    );
  }

  // Genre filter
  if (filters.genre && filters.genre.length > 0) {
    filtered = filtered.filter(artist =>
      artist.genre.some(genre =>
        filters.genre!.some(g => genre.toLowerCase().includes(g.toLowerCase()))
      )
    );
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(artist =>
      filters.status!.includes(artist.status)
    );
  }

  // Featured filter
  if (filters.featured !== undefined) {
    filtered = filtered.filter(artist => artist.featured === filters.featured);
  }

  return filtered;
};

// Analytics utilities
export const getArtistAnalytics = (artists: ManagedArtist[]) => {
  const totalViews = artists.reduce((sum, artist) => sum + artist.views, 0);
  const avgViews = totalViews / artists.length;
  
  const byCategory = artists.reduce((acc, artist) => {
    artist.category.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const byLocation = artists.reduce((acc, artist) => {
    const location = artist.location.split(',')[0].trim();
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPerformers = artists
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const recentlyAdded = artists
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return {
    totalViews,
    avgViews,
    byCategory,
    byLocation,
    topPerformers,
    recentlyAdded
  };
}; 