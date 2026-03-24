import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js server-only modules before importing the actions
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
}))

// Mock the Supabase client helper — must match the alias auth.ts uses: @/lib/supabase
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(),
}))

import { loginArtist, signupArtist, logoutArtist } from '../../app/actions/auth'
import { getSupabaseClient } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
  return fd
}

function makeAuthClient(overrides: {
  signInWithPassword?: Partial<{ error: { message: string } | null }>
  signUp?: Partial<{ error: { message: string } | null }>
  signOut?: Partial<{ error: null }>
} = {}) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(
        overrides.signInWithPassword ?? { error: null }
      ),
      signUp: vi.fn().mockResolvedValue(
        overrides.signUp ?? { error: null }
      ),
      signOut: vi.fn().mockResolvedValue(
        overrides.signOut ?? { error: null }
      ),
    },
  }
}

// ---------------------------------------------------------------------------
// loginArtist
// ---------------------------------------------------------------------------

describe('loginArtist', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue(makeAuthClient() as any)
  })

  it('returns success and redirect on valid credentials', async () => {
    const fd = makeFormData({ email: 'dj@example.com', password: 'secret123' })
    const result = await loginArtist(fd)
    expect(result.success).toBe(true)
    expect(result.redirect).toBe('/artist/dashboard')
  })

  it('returns error for invalid email format', async () => {
    const fd = makeFormData({ email: 'not-an-email', password: 'secret123' })
    const result = await loginArtist(fd)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/email/i)
  })

  it('returns error when password is shorter than 6 characters', async () => {
    const fd = makeFormData({ email: 'dj@example.com', password: '123' })
    const result = await loginArtist(fd)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/password/i)
  })

  it('returns error when email is missing', async () => {
    const fd = makeFormData({ password: 'secret123' })
    const result = await loginArtist(fd)
    expect(result.success).toBe(false)
  })

  it('returns error when password is missing', async () => {
    const fd = makeFormData({ email: 'dj@example.com' })
    const result = await loginArtist(fd)
    expect(result.success).toBe(false)
  })

  it('returns error when Supabase auth returns an error', async () => {
    vi.mocked(getSupabaseClient).mockReturnValue(
      makeAuthClient({ signInWithPassword: { error: { message: 'Invalid login credentials' } } }) as any
    )
    const fd = makeFormData({ email: 'dj@example.com', password: 'wrongpassword' })
    const result = await loginArtist(fd)
    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid login credentials')
  })

  it('calls signInWithPassword with the correct email and password', async () => {
    const mockClient = makeAuthClient()
    vi.mocked(getSupabaseClient).mockReturnValue(mockClient as any)

    await loginArtist(makeFormData({ email: 'dj@example.com', password: 'secret123' }))

    expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'dj@example.com',
      password: 'secret123',
    })
  })
})

// ---------------------------------------------------------------------------
// signupArtist
// ---------------------------------------------------------------------------

describe('signupArtist', () => {
  beforeEach(() => {
    vi.mocked(getSupabaseClient).mockReturnValue(makeAuthClient() as any)
  })

  it('returns success message on valid signup', async () => {
    const fd = makeFormData({
      email: 'newdj@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    })
    const result = await signupArtist(fd)
    expect(result.success).toBe(true)
    expect(result.message).toMatch(/email/i)
  })

  it('returns error when passwords do not match', async () => {
    const fd = makeFormData({
      email: 'newdj@example.com',
      password: 'secret123',
      confirmPassword: 'different',
    })
    const result = await signupArtist(fd)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/match/i)
  })

  it('returns error for invalid email', async () => {
    const fd = makeFormData({
      email: 'not-valid',
      password: 'secret123',
      confirmPassword: 'secret123',
    })
    const result = await signupArtist(fd)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/email/i)
  })

  it('returns error when password is too short', async () => {
    const fd = makeFormData({
      email: 'dj@example.com',
      password: '123',
      confirmPassword: '123',
    })
    const result = await signupArtist(fd)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/password/i)
  })

  it('returns Supabase error message on auth failure', async () => {
    vi.mocked(getSupabaseClient).mockReturnValue(
      makeAuthClient({ signUp: { error: { message: 'User already registered' } } }) as any
    )
    const fd = makeFormData({
      email: 'existing@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    })
    const result = await signupArtist(fd)
    expect(result.success).toBe(false)
    expect(result.error).toBe('User already registered')
  })

  it('calls signUp with correct email and password', async () => {
    const mockClient = makeAuthClient()
    vi.mocked(getSupabaseClient).mockReturnValue(mockClient as any)

    await signupArtist(makeFormData({
      email: 'newdj@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    }))

    expect(mockClient.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'newdj@example.com', password: 'secret123' })
    )
  })
})

// ---------------------------------------------------------------------------
// logoutArtist
// ---------------------------------------------------------------------------

describe('logoutArtist', () => {
  it('returns success and redirect to login page', async () => {
    vi.mocked(getSupabaseClient).mockReturnValue(makeAuthClient() as any)
    const result = await logoutArtist()
    expect(result.success).toBe(true)
    expect(result.redirect).toBe('/artist/login')
  })

  it('calls signOut on the Supabase auth client', async () => {
    const mockClient = makeAuthClient()
    vi.mocked(getSupabaseClient).mockReturnValue(mockClient as any)
    await logoutArtist()
    expect(mockClient.auth.signOut).toHaveBeenCalledOnce()
  })

  it('returns error when signOut throws', async () => {
    vi.mocked(getSupabaseClient).mockImplementation(() => {
      throw new Error('Connection lost')
    })
    const result = await logoutArtist()
    expect(result.success).toBe(false)
    expect(result.error).toBe('Logout failed')
  })
})
