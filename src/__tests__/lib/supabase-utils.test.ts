import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the supabase module so importing supabase-utils doesn't require real env vars
vi.mock('../../app/lib/supabase', () => ({
  getSupabaseClient: vi.fn(),
  getSupabaseAdminClient: vi.fn(),
  isSupabaseConfigured: vi.fn(() => false),
}))

import { generateSlug, generateRandomSlug, getArtists } from '../../app/lib/supabase-utils'
import { isSupabaseConfigured, getSupabaseClient } from '../../app/lib/supabase'

// ---------------------------------------------------------------------------
// generateSlug
// ---------------------------------------------------------------------------

describe('generateSlug', () => {
  it('lowercases the input', () => {
    expect(generateSlug('ARTIST')).toBe('artist')
  })

  it('removes spaces', () => {
    expect(generateSlug('DJ Shadow')).toBe('djshadow')
  })

  it('removes special characters', () => {
    expect(generateSlug('A & B')).toBe('ab')
  })

  it('removes hyphens and underscores', () => {
    expect(generateSlug('John-Doe_Jr')).toBe('johndoejr')
  })

  it('handles names with accented characters (removes them)', () => {
    // Non-ASCII chars are not in [a-z0-9\s] so they get stripped
    expect(generateSlug('Röyksopp')).toBe('ryksopp')
  })

  it('handles all-special-character input → empty string', () => {
    expect(generateSlug('!!!')).toBe('')
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('handles multiple consecutive spaces', () => {
    expect(generateSlug('The   Artist')).toBe('theartist')
  })

  it('handles numbers in name', () => {
    expect(generateSlug('DJ 2Fast')).toBe('dj2fast')
  })

  it('handles leading/trailing whitespace', () => {
    expect(generateSlug('  artist  ')).toBe('artist')
  })

  it('produces consistent slugs (same input → same output)', () => {
    const name = 'Origins Radio'
    expect(generateSlug(name)).toBe(generateSlug(name))
  })

  it('two different names produce different slugs', () => {
    expect(generateSlug('Artist One')).not.toBe(generateSlug('Artist Two'))
  })
})

// ---------------------------------------------------------------------------
// generateRandomSlug
// ---------------------------------------------------------------------------

describe('generateRandomSlug', () => {
  it('returns a string of length 8', () => {
    expect(generateRandomSlug()).toHaveLength(8)
  })

  it('only contains alphanumeric characters', () => {
    const slug = generateRandomSlug()
    expect(slug).toMatch(/^[a-z0-9]+$/)
  })

  it('produces different values on repeated calls (probabilistic)', () => {
    const results = new Set(Array.from({ length: 20 }, generateRandomSlug))
    // With 36^8 possible values, the chance of collision in 20 tries is negligible
    expect(results.size).toBeGreaterThan(1)
  })

  it('never returns an empty string', () => {
    for (let i = 0; i < 10; i++) {
      expect(generateRandomSlug().length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// getArtists — Supabase-dependent (tests the unconfigured branch)
// ---------------------------------------------------------------------------

describe('getArtists', () => {
  beforeEach(() => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false)
  })

  it('returns an empty array when Supabase is not configured', async () => {
    const result = await getArtists()
    expect(result).toEqual([])
  })

  it('does not call getSupabaseClient when Supabase is not configured', async () => {
    await getArtists()
    expect(getSupabaseClient).not.toHaveBeenCalled()
  })

  it('throws when Supabase is configured but returns an error', async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true)
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'DB connection failed' },
          }),
        }),
      }),
    }
    vi.mocked(getSupabaseClient).mockReturnValue(mockClient as any)

    await expect(getArtists()).rejects.toMatchObject({ message: 'DB connection failed' })
  })

  it('returns data when Supabase query succeeds', async () => {
    const mockArtists = [
      { id: '1', name: 'Artist One' },
      { id: '2', name: 'Artist Two' },
    ]
    vi.mocked(isSupabaseConfigured).mockReturnValue(true)
    const mockClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockArtists, error: null }),
        }),
      }),
    }
    vi.mocked(getSupabaseClient).mockReturnValue(mockClient as any)

    const result = await getArtists()
    expect(result).toEqual(mockArtists)
  })
})
