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
  uploadImageFile,
  toggleArtistLike,
  getArtistLikeCount,
  isArtistLikedByUser,
  generateUserId,
  getChatMessages,
  createChatMessage,
  subscribeToChatMessages
} from '../lib/supabase-utils'
import type { Database } from '../lib/supabase'
import { useEffect } from 'react'

type Artist = Database['public']['Tables']['artists']['Row']
type Track = Database['public']['Tables']['tracks']['Row']
type Set = Database['public']['Tables']['sets']['Row']
type Event = Database['public']['Tables']['events']['Row']
type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type OurWorkProject = Database['public']['Tables']['our_work_projects']['Row']

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

// Artist likes hooks
export const useArtistLikeCount = (artistId: string) => {
  return useQuery({
    queryKey: ['artist-like-count', artistId],
    queryFn: () => getArtistLikeCount(artistId),
    enabled: !!artistId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useArtistLikeStatus = (artistId: string) => {
  const userId = generateUserId()
  
  return useQuery({
    queryKey: ['artist-like-status', artistId, userId],
    queryFn: () => isArtistLikedByUser(artistId, userId),
    enabled: !!artistId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useToggleArtistLike = () => {
  const queryClient = useQueryClient()
  const userId = generateUserId()
  
  return useMutation({
    mutationFn: ({ artistId }: { artistId: string }) => toggleArtistLike(artistId, userId),
    onSuccess: (isLiked, { artistId }) => {
      // Invalidate and refetch like count and status
      queryClient.invalidateQueries({ queryKey: ['artist-like-count', artistId] })
      queryClient.invalidateQueries({ queryKey: ['artist-like-status', artistId, userId] })
      
      // Optimistically update the like count
      queryClient.setQueryData(['artist-like-count', artistId], (oldCount: number) => {
        return isLiked ? (oldCount || 0) + 1 : Math.max(0, (oldCount || 0) - 1)
      })
      
      // Optimistically update the like status
      queryClient.setQueryData(['artist-like-status', artistId, userId], isLiked)
    },
  })
} 

// Chat message hooks
export const useChatMessages = () => {
  return useQuery({
    queryKey: ['chatMessages'],
    queryFn: () => getChatMessages(),
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  })
}

export const useCreateChatMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ tagName, message, isEmoji }: { tagName: string; message: string; isEmoji?: boolean }) =>
      createChatMessage(tagName, message, isEmoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] })
    },
  })
}

// Custom hook for real-time chat subscription
export const useChatSubscription = (onNewMessage: (message: ChatMessage) => void) => {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const subscription = subscribeToChatMessages((newMessage) => {
      // Update the cache with the new message
      queryClient.setQueryData(['chatMessages'], (oldData: ChatMessage[] | undefined) => {
        if (!oldData) return [newMessage]
        return [...oldData, newMessage]
      })
      
      // Call the callback
      onNewMessage(newMessage)
    })
    
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [queryClient, onNewMessage])
} 

// Our Work hooks
import { getOurWorkProjects } from '../lib/supabase-utils'

export const useOurWorkProjects = () => {
  return useQuery<OurWorkProject[]>({
    queryKey: ['our_work_projects'],
    queryFn: getOurWorkProjects,
    staleTime: 5 * 60 * 1000,
  })
}