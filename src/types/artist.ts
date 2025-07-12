export interface Artist {
  id: string;
  name: string;
  bio: string;
  photo: string;
  coverImage?: string;
  genre: string[];
  location: string;
  socialLinks?: {
    instagram?: string;
    soundcloud?: string;
    spotify?: string;
    youtube?: string;
    facebook?: string;
  };
  tracks: Track[];
  events: Event[];
  featured: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  path: string;
  coverArt: string;
  duration?: string;
  releaseDate?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  tags: string[];
  upcoming: boolean;
} 