import { useMemo, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseClient } from '@/lib/supabase'
import { resolveCurrentSlot, type CurrentSlot } from '@/lib/radioSchedule'

import { fetchWeeklyRadioSchedule, getRadioWeekKeys, type ScheduleItemWithSet, type WeeklyScheduleSnapshot } from '@/lib/radio-schedule-data'
export type { ScheduleItemWithSet } from '@/lib/radio-schedule-data'

export function useWeeklyRadioSchedule(initial?: WeeklyScheduleSnapshot) {
  const keys = getRadioWeekKeys()
  const sameWeek = initial?.weekMondayIstanbul === keys.weekMondayIstanbul && initial?.weekMondayUtc === keys.weekMondayUtc
  return useQuery({
    queryKey: ['radio_schedule_weekly', keys.weekMondayIstanbul, keys.weekMondayUtc],
    queryFn: async () => {
      const client = getSupabaseClient()
      if (!client) return []
      return fetchWeeklyRadioSchedule(client, keys)
    },
    initialData: sameWeek ? initial?.items : undefined,
    initialDataUpdatedAt: sameWeek ? Date.parse(initial!.generatedAt) : undefined,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useCurrentRadioSlot(pollMs = 5000, initial?: WeeklyScheduleSnapshot) {
  const scheduleQuery = useWeeklyRadioSchedule(initial)

  // Tick every pollMs to recompute the current slot with the latest time
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => (t + 1) % 1000000)
    }, pollMs)
    return () => clearInterval(id)
  }, [pollMs])

  const current = useMemo<CurrentSlot<Pick<ScheduleItemWithSet, 'set'>> | null>(() => {
    if (!scheduleQuery.data || scheduleQuery.data.length === 0) return null
    return resolveCurrentSlot(scheduleQuery.data, initial && tick === 0 ? new Date(initial.generatedAt) : new Date())
  }, [scheduleQuery.data, tick, initial])

  // Lightweight polling managed by react-query via refetchInterval
  // Consumers can also re-render on each interval; the hook itself remains pure

  return {
    ...scheduleQuery,
    currentSlot: current,
  }
}
