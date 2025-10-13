import { addMinutes, differenceInSeconds, startOfWeek } from 'date-fns'
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz'

export type ContentType = 'set' | 'stream'

export interface RadioScheduleRow {
  id: string
  day_of_week: number // 0 = Monday ... 6 = Sunday
  start_time_local: string // 'HH:mm'
  duration_minutes: number
  content_type: ContentType
  set_id?: string | null
  stream_url?: string | null
  title: string
  timezone?: string | null // default: Europe/Istanbul
  is_active?: boolean | null
  week_start_date?: string | null // ISO date string (YYYY-MM-DD) representing Monday of the week
}

export interface ScheduleItem {
  id: string
  dayOfWeek: number
  startTimeLocal: string
  durationMinutes: number
  contentType: ContentType
  setId?: string | null
  streamUrl?: string | null
  title: string
  timezone: string
}

export interface CurrentSlot<TExtra = unknown> {
  item: ScheduleItem & TExtra
  startedAtUtc: Date
  secondsSinceStart: number
  endsAtUtc: Date
  isLiveStream: boolean
}

const DEFAULT_TZ = 'Europe/Istanbul'

export function mapRowToItem(row: RadioScheduleRow): ScheduleItem {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    startTimeLocal: row.start_time_local,
    durationMinutes: row.duration_minutes,
    contentType: row.content_type,
    setId: row.set_id ?? null,
    streamUrl: row.stream_url ?? null,
    title: row.title,
    timezone: row.timezone || DEFAULT_TZ,
  }
}

// Compute the current active slot from a weekly schedule.
// now: default current moment in UTC.
export function resolveCurrentSlot<TExtra = unknown>(
  items: (ScheduleItem & Partial<TExtra>)[],
  now: Date = new Date()
): CurrentSlot<Partial<TExtra>> | null {
  if (!items || items.length === 0) return null

  // Assume all items share the same timezone; if mixed, prefer each item's tz.
  // We'll evaluate each item in its own timezone.

  for (const item of items) {
    const tz = item.timezone || DEFAULT_TZ
    const nowZoned = toZonedTime(now, tz)

    // Week start Monday in the target timezone
    const weekStartZoned = startOfWeek(nowZoned, { weekStartsOn: 1 })

    // Compute the zoned start date for the given dayOfWeek (0=Mon..6=Sun)
    const startDateZoned = addDaysSafe(weekStartZoned, item.dayOfWeek)

    // Build a local date-time string in tz for the slot start
    const dateStr = formatInTimeZone(startDateZoned, tz, 'yyyy-MM-dd')
    const startLocalIso = `${dateStr}T${normalizeHHmm(item.startTimeLocal)}:00`

    // Convert the intended local start time to UTC
    const startUtc = fromZonedTime(startLocalIso, tz)

    // Compute end in UTC by adding duration in the same local timeline
    const startZoned = toZonedTime(startUtc, tz)
    const endZoned = addMinutes(startZoned, item.durationMinutes)
    const endUtc = fromZonedTime(endZoned, tz)

    if (now >= startUtc && now < endUtc) {
      const secondsSinceStart = Math.max(0, differenceInSeconds(now, startUtc))
      return {
        item,
        startedAtUtc: startUtc,
        secondsSinceStart,
        endsAtUtc: endUtc,
        isLiveStream: item.contentType === 'stream',
      }
    }
  }

  return null
}

function addDaysSafe(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(date.getDate() + days)
  return result
}

function normalizeHHmm(value: string): string {
  // Ensure HH:mm format
  const m = /^\s*(\d{1,2}):(\d{1,2})\s*$/.exec(value)
  if (!m) return '00:00'
  const hh = String(Math.min(23, Math.max(0, parseInt(m[1], 10)))).padStart(2, '0')
  const mm = String(Math.min(59, Math.max(0, parseInt(m[2], 10)))).padStart(2, '0')
  return `${hh}:${mm}`
}


