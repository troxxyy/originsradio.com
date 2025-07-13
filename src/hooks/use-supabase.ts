import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getArtists,
  getArtistById,
  getArtistBySlug,
  createArtist,
  getTracks,
  getTracksByArtist,
  createTrack,
  updateTrack,
  deleteTrack,
  getSets,
  getSetsByArtist,
  getSetById,
  createSet,
  updateSet,
  deleteSet,
  getEvents,
  getEventsByArtist,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadAudioFile,
  uploadImageFile
} from '../lib/supabase-utils'
import type { Database } from '../lib/supabase'

type Artist = Database['public']['Tables']['artists']['Row']
type Track = Database['public']['Tables']['tracks']['Row']
type Set = Database['public']['Tables']['sets']['Row']
type Event = Database['public']['Tables']['events']['Row']

// Artist hooks
export const useArtists = () => {
  return useQuery({
    queryKey: ['artists'],
    queryFn: getArtists,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useArtist = (id: string) => {
  return useQuery({
    queryKey: ['artist', id],
    queryFn: () => getArtistById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useArtistBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['artist', 'slug', slug],
    queryFn: () => getArtistBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateArtist = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] })
    },
  })
}

// Track hooks
export const useTracks = () => {
  return useQuery({
    queryKey: ['tracks'],
    queryFn: getTracks,
    staleTime: 5 * 60 * 1000,
  })
}

export const useTracksByArtist = (artistId: string) => {
  return useQuery({
    queryKey: ['tracks', 'artist', artistId],
    queryFn: () => getTracksByArtist(artistId),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateTrack = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    },
  })
}

export const useUpdateTrack = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateTrack(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    },
  })
}

export const useDeleteTrack = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] })
    },
  })
}

// Set hooks
export const useSets = () => {
  return useQuery({
    queryKey: ['sets'],
    queryFn: getSets,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSetsByArtist = (artistId: string) => {
  return useQuery({
    queryKey: ['sets', 'artist', artistId],
    queryFn: () => getSetsByArtist(artistId),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useSet = (id: string) => {
  return useQuery({
    queryKey: ['set', id],
    queryFn: () => getSetById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateSet = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] })
    },
  })
}

export const useUpdateSet = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] })
    },
  })
}

export const useDeleteSet = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sets'] })
    },
  })
}

// Event hooks
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000,
  })
}

export const useEventsByArtist = (artistId: string) => {
  return useQuery({
    queryKey: ['events', 'artist', artistId],
    queryFn: () => getEventsByArtist(artistId),
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useUpdateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// File upload hooks
export const useUploadAudio = () => {
  return useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) =>
      uploadAudioFile(file, path),
  })
}

export const useUploadImage = () => {
  return useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) =>
      uploadImageFile(file, path),
  })
} 