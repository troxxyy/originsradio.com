/** Only parse dates with an explicit year. Legacy labels often omit the year. */
export function eventTimestamp(value?: string | null): number | null {
  if (!value || !/\b(?:19|20)\d{2}\b/.test(value)) return null
  const date = value.split(/\s[—–]\s/)[0].trim()
  const timestamp = Date.parse(/^\d{4}-\d{2}-\d{2}/.test(date) ? date : `${date} UTC`)
  return Number.isFinite(timestamp) ? timestamp : null
}

export function isUpcomingEvent(
  event: { upcoming?: boolean; date?: string | null },
  now = new Date(),
): boolean {
  if (!event.upcoming) return false
  const timestamp = eventTimestamp(event.date)
  // Keep editorial intent for recurring events and dates without a known year.
  if (timestamp === null) return true
  const dayInIstanbul = (date: Date) => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
  return dayInIstanbul(new Date(timestamp)) >= dayInIstanbul(now)
}
