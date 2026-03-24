import { describe, it, expect } from 'vitest'
import {
  mapRowToItem,
  resolveCurrentSlot,
  type RadioScheduleRow,
  type ScheduleItem,
} from '../../app/lib/radioSchedule'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRow(overrides: Partial<RadioScheduleRow> = {}): RadioScheduleRow {
  return {
    id: 'row-1',
    day_of_week: 0, // Monday
    start_time_local: '10:00',
    duration_minutes: 60,
    content_type: 'set',
    title: 'Morning Set',
    timezone: 'UTC',
    week_start_date: '2024-03-18', // a known Monday
    set_id: null,
    stream_url: null,
    is_active: true,
    ...overrides,
  }
}

function makeItem(overrides: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    id: 'item-1',
    dayOfWeek: 0,
    startTimeLocal: '10:00',
    durationMinutes: 60,
    contentType: 'set',
    title: 'Morning Set',
    timezone: 'UTC',
    weekStartDate: '2024-03-18',
    setId: null,
    streamUrl: null,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// mapRowToItem
// ---------------------------------------------------------------------------

describe('mapRowToItem', () => {
  it('maps all required fields', () => {
    const row = makeRow()
    const item = mapRowToItem(row)

    expect(item.id).toBe('row-1')
    expect(item.dayOfWeek).toBe(0)
    expect(item.startTimeLocal).toBe('10:00')
    expect(item.durationMinutes).toBe(60)
    expect(item.contentType).toBe('set')
    expect(item.title).toBe('Morning Set')
    expect(item.timezone).toBe('UTC')
    expect(item.weekStartDate).toBe('2024-03-18')
  })

  it('falls back to Europe/Istanbul when timezone is null', () => {
    const row = makeRow({ timezone: null })
    const item = mapRowToItem(row)
    expect(item.timezone).toBe('Europe/Istanbul')
  })

  it('falls back to Europe/Istanbul when timezone is empty string', () => {
    const row = makeRow({ timezone: '' })
    const item = mapRowToItem(row)
    expect(item.timezone).toBe('Europe/Istanbul')
  })

  it('coerces null set_id to null', () => {
    const item = mapRowToItem(makeRow({ set_id: null }))
    expect(item.setId).toBeNull()
  })

  it('coerces undefined set_id to null', () => {
    const row = makeRow()
    delete row.set_id
    const item = mapRowToItem(row)
    expect(item.setId).toBeNull()
  })

  it('preserves stream_url when provided', () => {
    const item = mapRowToItem(makeRow({ stream_url: 'https://example.com/stream' }))
    expect(item.streamUrl).toBe('https://example.com/stream')
  })

  it('coerces null week_start_date to null', () => {
    const item = mapRowToItem(makeRow({ week_start_date: null }))
    expect(item.weekStartDate).toBeNull()
  })

  it('maps content_type = stream correctly', () => {
    const item = mapRowToItem(makeRow({ content_type: 'stream' }))
    expect(item.contentType).toBe('stream')
  })
})

// ---------------------------------------------------------------------------
// resolveCurrentSlot
// ---------------------------------------------------------------------------

describe('resolveCurrentSlot', () => {
  // All times below use UTC timezone and week_start_date = '2024-03-18' (Monday).
  // Slot: Monday 10:00 UTC for 60 minutes → active 10:00–11:00 UTC

  const SLOT_START = new Date('2024-03-18T10:00:00Z')
  const SLOT_MID   = new Date('2024-03-18T10:30:00Z')
  const SLOT_END   = new Date('2024-03-18T11:00:00Z')

  it('returns null for an empty schedule', () => {
    expect(resolveCurrentSlot([], SLOT_MID)).toBeNull()
  })

  it('returns the active slot when now is in the middle of it', () => {
    const item = makeItem()
    const result = resolveCurrentSlot([item], SLOT_MID)

    expect(result).not.toBeNull()
    expect(result!.item.id).toBe('item-1')
    expect(result!.secondsSinceStart).toBeGreaterThan(0)
    expect(result!.secondsSinceStart).toBeLessThan(3600)
  })

  it('returns null when now is well before the slot', () => {
    const item = makeItem()
    const before = new Date('2024-03-18T08:00:00Z') // 2h before, outside 2-min buffer
    expect(resolveCurrentSlot([item], before)).toBeNull()
  })

  it('returns null when now is well after the slot ends', () => {
    const item = makeItem()
    const after = new Date('2024-03-18T12:00:00Z') // 1h after end
    expect(resolveCurrentSlot([item], after)).toBeNull()
  })

  it('returns slot within the 2-minute pre-start buffer', () => {
    // 90 seconds before slot start — inside the 2-min (120s) buffer
    const justBefore = new Date(SLOT_START.getTime() - 90_000)
    const result = resolveCurrentSlot([makeItem()], justBefore)
    expect(result).not.toBeNull()
  })

  it('returns null when 3 minutes before slot start (outside buffer)', () => {
    const tooEarly = new Date(SLOT_START.getTime() - 3 * 60_000)
    expect(resolveCurrentSlot([makeItem()], tooEarly)).toBeNull()
  })

  it('returns slot within the 2-minute post-end buffer', () => {
    // 90 seconds after slot end — inside the 2-min buffer
    const justAfter = new Date(SLOT_END.getTime() + 90_000)
    const result = resolveCurrentSlot([makeItem()], justAfter)
    expect(result).not.toBeNull()
  })

  it('returns null when 3 minutes after slot ends (outside buffer)', () => {
    const tooLate = new Date(SLOT_END.getTime() + 3 * 60_000)
    expect(resolveCurrentSlot([makeItem()], tooLate)).toBeNull()
  })

  it('secondsSinceStart is 0 when now is before start (clamped)', () => {
    const justBefore = new Date(SLOT_START.getTime() - 30_000)
    const result = resolveCurrentSlot([makeItem()], justBefore)
    expect(result).not.toBeNull()
    expect(result!.secondsSinceStart).toBe(0)
  })

  it('endsAtUtc is durationMinutes after startedAtUtc', () => {
    const result = resolveCurrentSlot([makeItem()], SLOT_MID)!
    const diffMs = result.endsAtUtc.getTime() - result.startedAtUtc.getTime()
    expect(diffMs).toBe(60 * 60 * 1000) // 60 minutes
  })

  it('isLiveStream is false for a set with no audio', () => {
    const result = resolveCurrentSlot([makeItem({ streamUrl: null, setId: null })], SLOT_MID)!
    expect(result.isLiveStream).toBe(false)
  })

  it('isLiveStream is true when streamUrl is set', () => {
    const item = makeItem({ streamUrl: 'https://example.com/stream' })
    const result = resolveCurrentSlot([item], SLOT_MID)!
    expect(result.isLiveStream).toBe(true)
  })

  it('isLiveStream is false when streamUrl is an empty string', () => {
    const item = makeItem({ streamUrl: '' })
    const result = resolveCurrentSlot([item], SLOT_MID)!
    expect(result.isLiveStream).toBe(false)
  })

  it('isLiveStream is false when streamUrl is whitespace only', () => {
    const item = makeItem({ streamUrl: '   ' })
    const result = resolveCurrentSlot([item], SLOT_MID)!
    expect(result.isLiveStream).toBe(false)
  })

  it('prefers the most recently started slot when two overlap', () => {
    // item A: starts at 10:00 UTC, 90-min duration
    const itemA = makeItem({ id: 'A', startTimeLocal: '10:00', durationMinutes: 90 })
    // item B: starts at 10:30 UTC (later start), 60-min duration
    const itemB = makeItem({ id: 'B', startTimeLocal: '10:30', durationMinutes: 60 })

    const now = new Date('2024-03-18T10:45:00Z') // both active
    const result = resolveCurrentSlot([itemA, itemB], now)!
    expect(result.item.id).toBe('B') // B started more recently
  })

  it('uses weekStartDate from the item when provided', () => {
    // Force a specific week — this Monday at 10:00
    const item = makeItem({ weekStartDate: '2024-03-18' })
    const result = resolveCurrentSlot([item], SLOT_MID)
    expect(result).not.toBeNull()
  })

  it('handles dayOfWeek correctly for non-Monday slots', () => {
    // Wednesday = dayOfWeek 2, week starts 2024-03-18 → Wednesday is 2024-03-20
    const item = makeItem({ dayOfWeek: 2, weekStartDate: '2024-03-18' })
    const wednesdayMid = new Date('2024-03-20T10:30:00Z')
    expect(resolveCurrentSlot([item], wednesdayMid)).not.toBeNull()

    // Should not match on Monday
    expect(resolveCurrentSlot([item], SLOT_MID)).toBeNull()
  })

  it('handles Sunday (dayOfWeek = 6) correctly', () => {
    const item = makeItem({ dayOfWeek: 6, weekStartDate: '2024-03-18' })
    const sundayMid = new Date('2024-03-24T10:30:00Z')
    expect(resolveCurrentSlot([item], sundayMid)).not.toBeNull()
  })

  it('returns null when all items are inactive (not in range)', () => {
    const yesterday = makeItem({ weekStartDate: '2024-03-11' }) // previous week
    const now = new Date('2024-03-18T10:30:00Z')
    expect(resolveCurrentSlot([yesterday], now)).toBeNull()
  })

  it('handles midnight-spanning slots (23:30 for 60 minutes → crosses midnight)', () => {
    // Slot starts at 23:30 on Monday (dayOfWeek 0), runs 60 min into Tuesday
    const item = makeItem({ startTimeLocal: '23:30', durationMinutes: 60 })
    const duringSlot = new Date('2024-03-18T23:45:00Z') // still Monday
    const result = resolveCurrentSlot([item], duringSlot)
    expect(result).not.toBeNull()
  })
})
