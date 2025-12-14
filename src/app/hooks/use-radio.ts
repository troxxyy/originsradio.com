import { useMemo, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { mapRowToItem, resolveCurrentSlot, type CurrentSlot, type ScheduleItem } from '@/lib/radioSchedule'

type SetRow = Database['public']['Tables']['sets']['Row']

export interface ScheduleItemWithSet extends ScheduleItem {
  set?: Pick<SetRow, 'audio_url' | 'duration'> & {
    artists?: { id: string; name: string | null; photo_url: string | null } | null
  } | null
}

type WeeklyArtist = { id: string; name: string | null; photo_url: string | null }
type WeeklySetJoin = {
  audio_url: string | null
  duration: number | null
  artists: WeeklyArtist | WeeklyArtist[] | null
}

type WeeklyScheduleSelectRow = {
  id: string
  day_of_week: number
  start_time_local: string
  duration_minutes: number
  content_type: 'set' | 'stream'
  set_id: string | null
  stream_url: string | null
  title: string
  timezone: string | null
  is_active: boolean | null
  week_start_date: string | null
  sets: WeeklySetJoin | WeeklySetJoin[] | null
}

// Get the Monday of the current week in YYYY-MM-DD format
const ISTANBUL_TZ = 'Europe/Istanbul'

const addDaysToYmd = (ymd: string, days: number): string => {
  const m = /^\s*(\d{4})-(\d{2})-(\d{2})\s*$/.exec(ymd)
  if (!m) return ymd.trim()
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10)
  const d = parseInt(m[3], 10)
  const dt = new Date(Date.UTC(y, mo - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

const getWeekMondayUtc = (now: Date = new Date()): string => {
  const todayYmd = now.toISOString().slice(0, 10) // UTC date
  const dow = now.getUTCDay() // 0=Sun..6=Sat
  const isoDow = dow === 0 ? 7 : dow // 1=Mon..7=Sun
  return addDaysToYmd(todayYmd, -(isoDow - 1))
}

const getWeekMondayInIstanbul = (now: Date = new Date()): string => {
  // Use Intl to get YYYY-MM-DD in Istanbul without relying on locale parsing
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISTANBUL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  const todayYmd = y && m && d ? `${y}-${m}-${d}` : now.toISOString().slice(0, 10)

  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: ISTANBUL_TZ, weekday: 'short' }).format(now)
  // Map weekday to ISO day-of-week (Mon=1..Sun=7)
  const isoDow =
    weekday === 'Mon' ? 1 :
    weekday === 'Tue' ? 2 :
    weekday === 'Wed' ? 3 :
    weekday === 'Thu' ? 4 :
    weekday === 'Fri' ? 5 :
    weekday === 'Sat' ? 6 : 7

  return addDaysToYmd(todayYmd, -(isoDow - 1))
}

export function useWeeklyRadioSchedule() {
  const now = new Date()
  const weekMondayIstanbul = getWeekMondayInIstanbul(now)
  const weekMondayUtc = getWeekMondayUtc(now)

  return useQuery<ScheduleItemWithSet[]>({
    queryKey: ['radio_schedule_weekly', weekMondayIstanbul, weekMondayUtc],
    queryFn: async () => {
      if (!isSupabaseConfigured()) return []
      const supabase = getSupabaseClient()
      const candidates = Array.from(new Set([weekMondayIstanbul, weekMondayUtc])).filter(Boolean)
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
          week_start_date,
          sets:sets(
            audio_url,
            duration,
            artists:artists(
              id,
              name,
              photo_url
            )
          )
        `)
        .eq('is_active', true)
        .in('week_start_date', candidates)
        .order('day_of_week', { ascending: true })
        .order('start_time_local', { ascending: true })

      if (error) {
        // If table not found or other error, return empty schedule gracefully
        // eslint-disable-next-line no-console
        console.warn('Radio schedule fetch error:', error.message)
        return []
      }

      const rows = (data || []) as unknown as WeeklyScheduleSelectRow[]

      const items: ScheduleItemWithSet[] = rows.map((row) => {
        const base = mapRowToItem(row)

        const setObj: WeeklySetJoin | null = Array.isArray(row.sets) ? (row.sets[0] ?? null) : row.sets
        const artistObj: WeeklyArtist | null = Array.isArray(setObj?.artists)
          ? (setObj?.artists[0] ?? null)
          : (setObj?.artists ?? null)

        return {
          ...base,
          // Ensure streamUrl is preserved from the row
          streamUrl: row.stream_url ?? base.streamUrl,
          set: setObj ? {
            audio_url: setObj.audio_url,
            duration: setObj.duration,
            artists: artistObj,
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
    return resolveCurrentSlot(scheduleQuery.data, new Date())
  }, [scheduleQuery.data, tick])

  // Lightweight polling managed by react-query via refetchInterval
  // Consumers can also re-render on each interval; the hook itself remains pure

  return {
    ...scheduleQuery,
    currentSlot: current,
  }
}


