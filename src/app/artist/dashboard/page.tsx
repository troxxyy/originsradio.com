'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/layout/PageLayout'
import { isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase'
import { getArtists, getArtistById, updateArtist } from '@/data/artists-supabase'
import { uploadAudioFile, uploadImageFile, getLinkedArtistForCurrentUser, linkCurrentUserToArtist } from '@/lib/supabase-utils'
import { addArtist } from '@/data/artists-supabase'

type Artist = Awaited<ReturnType<typeof getArtistById>>

export default function ArtistDashboardPage() {
  const router = useRouter()
  const [sessionChecked, setSessionChecked] = useState(false)
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const [artists, setArtists] = useState<Awaited<ReturnType<typeof getArtists>>>([])
  const [search, setSearch] = useState('')
  const [loadingArtists, setLoadingArtists] = useState(true)
  const [lockedByAccount, setLockedByAccount] = useState(false)

  const [activeTab, setActiveTab] = useState<'profile' | 'sets'>('profile')
  const [artist, setArtist] = useState<Artist>(null)
  const [bio, setBio] = useState('')
  const [locationVal, setLocationVal] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [photoUploading, setPhotoUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [setAudioFile, setSetAudioFile] = useState<File | null>(null)
  const [setSubmitting, setSetSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reviewUntilTs, setReviewUntilTs] = useState<number | null>(null)

  // Guard: require session
  useEffect(() => {
    const guard = async () => {
      if (!isSupabaseConfigured()) {
        setSessionChecked(true)
        return
      }
      const supabase = getSupabaseClient()
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace('/artist/login')
        return
      }
      setSessionChecked(true)
    }
    guard()
  }, [router])

  // Load selection and artists
  useEffect(() => {
    const saved = localStorage.getItem('selected_artist_id')
    setSelectedArtistId(saved)
    if (saved) {
      const ts = parseInt(localStorage.getItem(`review_until_${saved}`) || '0', 10)
      setReviewUntilTs(Number.isFinite(ts) && ts > 0 ? ts : null)
    }
    const loadArtists = async () => {
      try {
        const list = await getArtists()
        setArtists(list)
      } finally {
        setLoadingArtists(false)
      }
    }
    const checkLinked = async () => {
      try {
        const linked = await getLinkedArtistForCurrentUser()
        if (linked) {
          setSelectedArtistId(linked)
          localStorage.setItem('selected_artist_id', linked)
          setLockedByAccount(true)
        }
      } catch {
        // ignore
      }
    }
    loadArtists()
    checkLinked()
  }, [])

  // Load artist details when selected
  useEffect(() => {
    const load = async () => {
      if (!selectedArtistId) return
      const ts = parseInt(localStorage.getItem(`review_until_${selectedArtistId}`) || '0', 10)
      setReviewUntilTs(Number.isFinite(ts) && ts > 0 ? ts : null)
      const a = await getArtistById(selectedArtistId)
      setArtist(a)
      setBio(a?.bio || '')
      setLocationVal(a?.location || '')
      setGenres(((a?.genre as unknown) as string[]) || [])
    }
    load()
  }, [selectedArtistId])

  const filteredArtists = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return artists
    return artists.filter(a => a.name.toLowerCase().includes(q))
  }, [artists, search])

  const handleSelectArtist = async (id: string) => {
    if (lockedByAccount) return
    setMessage(null)
    const ok = await linkCurrentUserToArtist(id)
    if (ok) {
      localStorage.setItem('selected_artist_id', id)
      setSelectedArtistId(id)
      setLockedByAccount(true)
      const until = Date.now() + 30 * 60 * 1000
      localStorage.setItem(`review_until_${id}`, String(until))
      setReviewUntilTs(until)
      setActiveTab('profile')
      setMessage('Artist linked to your account')
    } else {
      setMessage('Could not link artist. You may already be linked.')
    }
  }

  const handleClearSelection = () => {
    if (lockedByAccount) return
    localStorage.removeItem('selected_artist_id')
    setSelectedArtistId(null)
    setArtist(null)
  }

  // Create new artist flow
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createLocation, setCreateLocation] = useState('')
  const [createBusy, setCreateBusy] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const handleCreateArtist = async () => {
    if (!createName.trim()) {
      setCreateError('Name is required')
      return
    }
    setCreateBusy(true)
    setCreateError(null)
    try {
      const inserted = await addArtist({
        name: createName.trim(),
        location: createLocation.trim() || null,
      } as any)
      if (!inserted) {
        setCreateError('Failed to create artist')
        setCreateBusy(false)
        return
      }
      const ok = await linkCurrentUserToArtist(inserted.id)
      if (!ok) {
        setCreateError('Artist created but failed to link account')
        setCreateBusy(false)
        return
      }
      localStorage.setItem('selected_artist_id', inserted.id)
      setSelectedArtistId(inserted.id)
      setLockedByAccount(true)
      const until = Date.now() + 30 * 60 * 1000
      localStorage.setItem(`review_until_${inserted.id}`, String(until))
      setReviewUntilTs(until)
      setActiveTab('profile')
      setMessage('Artist created and linked to your account')
      setShowCreate(false)
      setCreateName('')
      setCreateLocation('')
      // refresh list
      const list = await getArtists()
      setArtists(list)
    } catch (e) {
      setCreateError('Unexpected error creating artist')
    } finally {
      setCreateBusy(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!selectedArtistId) return
    if (reviewUntilTs && reviewUntilTs > Date.now()) return
    setMessage(null)
    const payload: any = {
      bio,
      location: locationVal || null,
      genre: genres.length ? genres : null,
    }
    const updated = await updateArtist(selectedArtistId, payload)
    if (updated) {
      setArtist(updated)
      setMessage('Profile updated')
    } else {
      setMessage('Failed to update profile')
    }
  }

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedArtistId) return
    if (reviewUntilTs && reviewUntilTs > Date.now()) return
    setPhotoUploading(true)
    setMessage(null)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const url = await uploadImageFile(file, `artists/${Date.now()}-${safeName}`)
      if (url) {
        const updated = await updateArtist(selectedArtistId, { photo_url: url })
        if (updated) {
          setArtist(updated)
          setMessage('Photo updated')
        } else {
          setMessage('Failed to save photo URL')
        }
      } else {
        setMessage('Image upload failed')
      }
    } catch (err) {
      setMessage('Unexpected image upload error')
    } finally {
      setPhotoUploading(false)
      e.target.value = ''
    }
  }

  const handleUploadSet = async () => {
    if (!selectedArtistId || !title || !setAudioFile) {
      setMessage('Please provide title and audio file')
      return
    }
    if (reviewUntilTs && reviewUntilTs > Date.now()) return
    setSetSubmitting(true)
    setMessage(null)
    try {
      const safeName = setAudioFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const audioUrl = await uploadAudioFile(setAudioFile, `sets/${selectedArtistId}/${Date.now()}-${safeName}`)
      if (!audioUrl) {
        setMessage('Audio upload failed')
        setSetSubmitting(false)
        return
      }
      const { createSet } = await import('@/lib/supabase-utils')
      const inserted = await createSet({
        title: title,
        artist_id: selectedArtistId,
        audio_url: audioUrl,
        release_date: new Date().toISOString(),
      } as any)
      if (inserted) {
        setMessage('Set uploaded')
        setTitle('')
        setSetAudioFile(null)
      } else {
        setMessage('Failed to create set')
      }
    } catch (err) {
      setMessage('Unexpected error uploading set')
    } finally {
      setSetSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
    }
    localStorage.removeItem('selected_artist_id')
    router.replace('/artist/login')
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">Loading…</div>
    )
  }

  return (
    <PageLayout>
      {/* Cyan/teal background for artist pages */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        {/* Deep dark base */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-stone-950 to-zinc-950"></div>
        
        {/* Cyan/teal undertone */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-teal-900/30"></div>
        
        {/* Top left - cyan glow */}
        <div className="absolute -left-20 -top-20 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-700/15 to-teal-800/10 blur-[100px] transform-gpu"></div>
        
        {/* Top right - soft teal glow */}
        <div className="absolute -right-20 top-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-l from-teal-900/12 to-cyan-900/8 blur-[80px] transform-gpu"></div>
        
        {/* Center - cyan neutral glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-cyan-700/10 via-teal-600/8 to-cyan-700/10 blur-[120px] transform-gpu"></div>
        
        {/* Bottom left - teal tint */}
        <div className="absolute -left-20 bottom-1/4 w-[350px] h-[350px] rounded-full bg-gradient-to-r from-teal-600/10 to-cyan-700/8 blur-[80px] transform-gpu"></div>
        
        {/* Bottom right - cyan glow */}
        <div className="absolute -right-10 -bottom-20 w-[450px] h-[450px] rounded-full bg-gradient-to-l from-cyan-800/12 via-teal-900/10 to-stone-800/8 blur-[100px] transform-gpu"></div>
        
        {/* Subtle noise/grain overlay for organic texture */}
        <div className="absolute inset-0 opacity-[0.025] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]"></div>
      </div>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Artist Dashboard</h1>
            <button onClick={handleLogout} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all">Logout</button>
          </div>

          {selectedArtistId && reviewUntilTs && reviewUntilTs > Date.now() && (
            <div className="mb-6 p-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
              Your profile is under review. It should be ready in 30 minutes. Until then, editing is disabled.
            </div>
          )}

          {!selectedArtistId ? (
            <div className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Select your artist</h2>
                {!lockedByAccount && (
                  <button onClick={() => setShowCreate(v => !v)} className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition">
                    {showCreate ? 'Close' : 'Create New Artist'}
                  </button>
                )}
              </div>
              {showCreate && !lockedByAccount && (
                <div className="mb-4 p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label htmlFor="create-name" className="block text-sm text-gray-300 mb-2">Artist Name</label>
                      <input id="create-name" type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="Artist name" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20" />
                    </div>
                    <div className="md:col-span-1">
                      <label htmlFor="create-location" className="block text-sm text-gray-300 mb-2">Location (optional)</label>
                      <input id="create-location" type="text" value={createLocation} onChange={(e) => setCreateLocation(e.target.value)} placeholder="City, Country" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20" />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <button onClick={handleCreateArtist} disabled={createBusy} className="w-full px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50">{createBusy ? 'Creating…' : 'Create & Link'}</button>
                    </div>
                  </div>
                  {createError && <div className="text-sm text-red-400 mt-2">{createError}</div>}
                </div>
              )}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search artists…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
              {loadingArtists ? (
                <div className="text-gray-400">Loading artists…</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredArtists.map(a => (
                    <button key={a.id} onClick={() => handleSelectArtist(a.id)} disabled={lockedByAccount} className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-left disabled:opacity-50">
                      <div className="flex items-center gap-3">
                        <img src={a.photo_url || '/placeholder.svg'} alt={a.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }} />
                        <div>
                          <div className="text-white font-semibold">{a.name}</div>
                          <div className="text-gray-400 text-sm">{a.location || '—'}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {lockedByAccount && (
                <div className="text-xs text-gray-400">Your account is linked to this artist and cannot be changed.</div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'profile' ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/20'}`}>Profile</button>
                <button onClick={() => setActiveTab('sets')} className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'sets' ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/20'}`}>Sets</button>
                {!lockedByAccount && (
                  <button onClick={handleClearSelection} className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg">Change artist</button>
                )}
              </div>

              {message && <div className="text-sm text-gray-300">{message}</div>}

              {activeTab === 'profile' && (
                <div className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  {!artist ? (
                    <div className="text-gray-400">Loading artist…</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="mb-3">
                          <img src={artist.photo_url || '/placeholder.svg'} alt={artist.name} className="w-32 h-32 rounded-xl object-cover border border-white/10" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }} />
                        </div>
                        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleSelectImage} aria-label="Upload artist photo" />
                        <button onClick={() => imageInputRef.current?.click()} disabled={photoUploading || (reviewUntilTs && reviewUntilTs > Date.now())} className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition disabled:opacity-50">
                          {photoUploading ? 'Uploading…' : 'Change Photo'}
                        </button>
                      </div>
                      <div className="md:col-span-2">
                        <div className="mb-3">
                          <label htmlFor="bio" className="block text-sm text-gray-300 mb-2">Bio</label>
                          <textarea id="bio" rows={6} value={bio} onChange={(e) => setBio(e.target.value)} disabled={!!(reviewUntilTs && reviewUntilTs > Date.now())} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50" />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="location" className="block text-sm text-gray-300 mb-2">Location</label>
                          <input id="location" type="text" value={locationVal} onChange={(e) => setLocationVal(e.target.value)} placeholder="City, Country" disabled={!!(reviewUntilTs && reviewUntilTs > Date.now())} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50" />
                        </div>
                        <div className="mb-4">
                          <div className="block text-sm text-gray-300 mb-2">Genres</div>
                          <div className="flex flex-wrap gap-2">
                            {['House','Techno','Minimal','Drum & Bass','Hip Hop','Ambient','Electronica','Afro House','Breakbeat','Disco'].map(g => {
                              const active = genres.includes(g)
                              const disabled = !!(reviewUntilTs && reviewUntilTs > Date.now())
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => {
                                    if (disabled) return
                                    setGenres(prev => active ? prev.filter(x => x !== g) : [...prev, g])
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm border transition ${active ? 'bg-white text-black border-transparent' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  {g}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <button onClick={handleUpdateProfile} disabled={!!(reviewUntilTs && reviewUntilTs > Date.now())} className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50">Save Profile</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sets' && (
                <div className="glass backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="set-title" className="block text-sm text-gray-300 mb-2">Set Title</label>
                      <input id="set-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My new mix" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20" />
                    </div>
                    <div>
                      <label htmlFor="set-audio" className="block text-sm text-gray-300 mb-2">Audio File</label>
                      <input id="set-audio" type="file" accept="audio/*" onChange={(e) => setSetAudioFile(e.target.files?.[0] || null)} className="w-full text-gray-300" aria-label="Upload audio file for set" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button onClick={handleUploadSet} disabled={setSubmitting} className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50">
                      {setSubmitting ? 'Uploading…' : 'Upload Set'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

