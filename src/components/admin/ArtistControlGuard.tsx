import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ArtistControlGuardProps {
  children: React.ReactNode
}

const LOCKOUT_KEY = 'artistcontrol_lockout_until'
const ATTEMPTS_KEY = 'artistcontrol_attempts'
const AUTH_KEY = 'artistcontrol_authenticated'

export default function ArtistControlGuard({ children }: ArtistControlGuardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true'
  })
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const lockoutUntil = useMemo<number>(() => {
    const v = localStorage.getItem(LOCKOUT_KEY)
    return v ? parseInt(v) : 0
  }, [now])

  const remainingLockSeconds = Math.max(0, Math.ceil((lockoutUntil - now) / 1000))

  useEffect(() => {
    // If locked out, send them away from secret path
    if (remainingLockSeconds > 0 && location.pathname.startsWith('/artistcontrolsecret')) {
      navigate('/', { replace: true })
    }
  }, [remainingLockSeconds, location.pathname, navigate])

  if (authenticated) {
    return <>{children}</>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0')
    const lockedUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0')
    const nowTs = Date.now()

    if (lockedUntil && nowTs < lockedUntil) {
      setError('Too many attempts. Try again later.')
      return
    }

    if (password === 'cheerstoorigins') {
      localStorage.setItem(AUTH_KEY, 'true')
      localStorage.removeItem(ATTEMPTS_KEY)
      localStorage.removeItem(LOCKOUT_KEY)
      setAuthenticated(true)
      return
    }

    const nextAttempts = attempts + 1
    localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts))
    if (nextAttempts >= 5) {
      // Lock for 15 minutes
      const fifteenMinutes = 15 * 60 * 1000
      localStorage.setItem(LOCKOUT_KEY, String(nowTs + fifteenMinutes))
      setError('Too many wrong attempts. You are locked out for 15 minutes.')
      navigate('/', { replace: true })
      return
    }
    setError(`Wrong password. ${5 - nextAttempts} tries left.`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-black/60 p-6 shadow-xl backdrop-blur">
        <h1 className="text-xl font-semibold text-white mb-2">Admin Access</h1>
        <p className="text-sm text-gray-400 mb-4">Enter the access password.</p>
        {remainingLockSeconds > 0 ? (
          <div className="text-red-400 text-sm mb-4">
            Locked out. Try again in {remainingLockSeconds}s.
          </div>
        ) : null}
        {error ? <div className="text-red-400 text-sm mb-3">{error}</div> : null}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="w-full">Enter</Button>
        </form>
        <div className="mt-4 text-xs text-gray-500">
          Attempts remaining: {Math.max(0, 5 - parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0'))}
        </div>
      </div>
    </div>
  )
}


