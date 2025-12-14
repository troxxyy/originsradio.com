import { addMinutes, differenceInSeconds } from 'date-fns'
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
  weekStartDate?: string | null // YYYY-MM-DD (Monday) for weekly schedules
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
    weekStartDate: row.week_start_date ?? null,
  }
}

// Compute the current active slot from a weekly schedule.
// now: default current moment in UTC.
export function resolveCurrentSlot<TExtra = unknown>(
  items: (ScheduleItem & Partial<TExtra>)[],
  now: Date = new Date()
): CurrentSlot<Partial<TExtra>> | null {
  if (!items || items.length === 0) return null

  // Multiple items can match "now" if schedule rows overlap (e.g. bad duration values).
  // In that case, prefer the most recently started slot.
  let best: CurrentSlot<Partial<TExtra>> | null = null

  for (const item of items) {
    const tz = item.timezone || DEFAULT_TZ
    // Prefer using the explicit week_start_date from the row when provided.
    // This avoids mismatches between DB week boundaries (often UTC) and "local" week boundaries.
    const weekStartYmd = item.weekStartDate?.trim()
      ? item.weekStartDate.trim()
      : getWeekStartYmdForNow(now, tz)

    // dayOfWeek is 0=Mon..6=Sun, and weekStartYmd is Monday (yyyy-MM-dd)
    const dayYmd = addDaysToYmd(weekStartYmd, item.dayOfWeek)
    const startLocalIso = `${dayYmd}T${normalizeHHmm(item.startTimeLocal)}:00`

    // Convert the intended local start time to UTC
    const startUtc = fromZonedTime(startLocalIso, tz)

    // Compute end in UTC by adding duration in the same local timeline
    // Use zoned time calculation to handle DST correctly
    const startZoned = toZonedTime(startUtc, tz)
    const endZoned = addMinutes(startZoned, item.durationMinutes)
    const endUtc = fromZonedTime(endZoned, tz)

    // Allow 2-minute buffer for cross-fading or clock skew
    // This helps "catch" the slot if we are just a few seconds late or early
    const bufferMs = 2 * 60 * 1000
    // Check if NOW is within [Start - Buffer, End + Buffer)
    // We check if (now + buffer) >= start and (now - buffer) < end
    const nowTime = now.getTime()
    
    if (nowTime + bufferMs >= startUtc.getTime() && nowTime - bufferMs < endUtc.getTime()) {
      const secondsSinceStart = Math.max(0, differenceInSeconds(now, startUtc))
      // Determine if this is a live stream: either has streamUrl or has a set with audio_url
      const hasStreamUrl = !!(item.streamUrl && item.streamUrl.trim())
      const setAudioUrl =
        (item as Partial<{ set?: { audio_url?: string | null } | null }>).set?.audio_url ?? null
      const hasSetAudio = !!(typeof setAudioUrl === 'string' ? setAudioUrl.trim() : setAudioUrl)
      const isLiveStream = hasStreamUrl || hasSetAudio
      
      const candidate: CurrentSlot<Partial<TExtra>> = {
        item,
        startedAtUtc: startUtc,
        secondsSinceStart,
        endsAtUtc: endUtc,
        isLiveStream,
      }

      if (!best || candidate.startedAtUtc.getTime() > best.startedAtUtc.getTime()) {
        best = candidate
      }
    }
  }

  return best
}

function getWeekStartYmdForNow(now: Date, tz: string): string {
  // ISO day of week: 1=Mon..7=Sun
  const isoDow = parseInt(formatInTimeZone(now, tz, 'i'), 10) || 1
  const todayYmd = formatInTimeZone(now, tz, 'yyyy-MM-dd')
  return addDaysToYmd(todayYmd, -(isoDow - 1))
}

function addDaysToYmd(ymd: string, days: number): string {
  // Treat YYYY-MM-DD as a calendar date (no timezone), and do arithmetic in UTC
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

function normalizeHHmm(value: string): string {
  // Ensure HH:mm format (accept HH:mm or HH:mm:ss)
  const m = /^\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*$/.exec(value)
  if (!m) return '00:00'
  const hh = String(Math.min(23, Math.max(0, parseInt(m[1], 10)))).padStart(2, '0')
  const mm = String(Math.min(59, Math.max(0, parseInt(m[2], 10)))).padStart(2, '0')
  return `${hh}:${mm}`
}


