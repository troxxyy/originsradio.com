import type { SupabaseClient } from '@supabase/supabase-js'
import { formatInTimeZone } from 'date-fns-tz'
import { mapRowToItem, type RadioScheduleRow, type ScheduleItem } from './radioSchedule'

type WeeklyArtist = { id: string; slug: string | null; name: string | null; photo_url: string | null }
type WeeklySet = { audio_url: string | null; duration: number | null; artists: WeeklyArtist | WeeklyArtist[] | null }
type WeeklyRow = RadioScheduleRow & { sets: WeeklySet | WeeklySet[] | null }

export interface ScheduleItemWithSet extends ScheduleItem {
  set?: { audio_url: string | null; duration: number | null; artists?: WeeklyArtist | null } | null
}

export interface WeeklyScheduleSnapshot {
  items: ScheduleItemWithSet[]
  weekMondayIstanbul: string
  weekMondayUtc: string
  generatedAt: string
}

function mondayForDate(date: string) {
  const day = new Date(`${date}T00:00:00Z`)
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() + 6) % 7)
  return day.toISOString().slice(0, 10)
}

export function getRadioWeekKeys(now = new Date()) {
  return {
    weekMondayIstanbul: mondayForDate(formatInTimeZone(now, 'Europe/Istanbul', 'yyyy-MM-dd')),
    weekMondayUtc: mondayForDate(now.toISOString().slice(0, 10)),
  }
}

export async function fetchWeeklyRadioSchedule(client: SupabaseClient, keys: ReturnType<typeof getRadioWeekKeys>): Promise<ScheduleItemWithSet[]> {
  const { data, error } = await client.from('radio_schedule_weekly')
    .select('id,day_of_week,start_time_local,duration_minutes,content_type,set_id,stream_url,title,timezone,is_active,week_start_date,sets:sets(audio_url,duration,artists:artists(id,slug,name,photo_url))')
    .eq('is_active', true)
    .in('week_start_date', Array.from(new Set([keys.weekMondayIstanbul, keys.weekMondayUtc])))
    .order('day_of_week', { ascending: true })
    .order('start_time_local', { ascending: true })
  if (error) throw error
  return ((data || []) as unknown as WeeklyRow[]).map((row) => {
    const set = Array.isArray(row.sets) ? row.sets[0] : row.sets
    const artist = Array.isArray(set?.artists) ? set.artists[0] : set?.artists
    return {
      ...mapRowToItem(row),
      set: set ? { audio_url: set.audio_url, duration: set.duration, artists: artist ?? null } : null,
    }
  })
}
