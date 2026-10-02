// Preserve existing anonymous likes; blocked storage uses an in-memory identity.
let sessionUserId: string | undefined
export const generateUserId = (): string => {
  if (typeof window === 'undefined') return ''
  if (sessionUserId) return sessionUserId
  try {
    const saved = window.localStorage.getItem('origins_radio_user_id')
    if (saved) return (sessionUserId = saved)
  } catch { /* Storage may be disabled in private or embedded browsers. */ }
  sessionUserId = `user_${window.crypto.randomUUID()}`
  try {
    window.localStorage.setItem('origins_radio_user_id', sessionUserId)
  } catch { /* Keep a stable ID for this tab when storage is unavailable. */ }
  return sessionUserId
}
