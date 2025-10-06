import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { mapRowToItem, resolveCurrentSlot, type CurrentSlot, type ScheduleItem } from '@/lib/radioSchedule'

type SetRow = Database['public']['Tables']['sets']['Row']

export interface ScheduleItemWithSet extends ScheduleItem {
  set?: Pick<SetRow, 'audio_url' | 'duration'> & {
    artists?: { name: string | null; photo_url: string | null } | null
  } | null
}

export function useWeeklyRadioSchedule() {
  return useQuery<ScheduleItemWithSet[]>({
    queryKey: ['radio_schedule_weekly'],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return []
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('radio_schedule_weekly')
        .select(`
          id,
          day_of_week,
          start_time_local,
          duration_minutes,
          content_type,
          set_id,
          stream_url,
          title,
          timezone,
          is_active,
          sets:sets(
            audio_url,
            duration,
            artists:artists(
              name,
              photo_url
            )
          )
        `)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })

      if (error) {
        // If table not found or other error, return empty schedule gracefully
        // eslint-disable-next-line no-console
        console.warn('Radio schedule fetch error:', error.message)
        return []
      }

      const items: ScheduleItemWithSet[] = (data || []).map((row: any) => {
        const base = mapRowToItem(row)
        return {
          ...base,
          set: row.sets ? {
            audio_url: row.sets.audio_url,
            duration: row.sets.duration,
            artists: row.sets.artists || null,
          } : null,
        }
      })

      return items
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useCurrentRadioSlot(pollMs = 5000) {
  const scheduleQuery = useWeeklyRadioSchedule()

  const current = useMemo<CurrentSlot<Pick<ScheduleItemWithSet, 'set'>> | null>(() => {
    if (!scheduleQuery.data || scheduleQuery.data.length === 0) return null
    return resolveCurrentSlot(scheduleQuery.data)
  }, [scheduleQuery.data])

  // Lightweight polling managed by react-query via refetchInterval
  // Consumers can also re-render on each interval; the hook itself remains pure

  return {
    ...scheduleQuery,
    currentSlot: current,
  }
}


