'use client'

import { useEffect, useMemo, useState } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import { getAllWeeklyRadioSchedule, upsertWeeklyRadioSchedule, deleteWeeklyRadioSchedule, getSets, archiveOldRadioSchedules, copyScheduleToNextWeek, getCurrentWeekMonday } from '@/lib/supabase-utils'

const HOURS = [19,20,21,22,23]
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function AdminRadioSchedule() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sets, setSets] = useState<any[]>([])
  const [currentWeek, setCurrentWeek] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const weekMonday = getCurrentWeekMonday()
        setCurrentWeek(weekMonday)
        const [allRows, allSets] = await Promise.all([
          getAllWeeklyRadioSchedule(),
          getSets(),
        ])
        setRows(allRows)
        setSets(allSets)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpsert = async (payload: any) => {
    setSaving(true)
    try {
      await upsertWeeklyRadioSchedule(payload)
      const refreshed = await getAllWeeklyRadioSchedule()
      setRows(refreshed)
      alert('Saved')
    } catch (e) {
      alert('Error saving schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this schedule row?')) return
    setSaving(true)
    try {
      await deleteWeeklyRadioSchedule(id)
      const refreshed = await getAllWeeklyRadioSchedule()
      setRows(refreshed)
    } catch (e) {
      alert('Error deleting')
    } finally {
      setSaving(false)
    }
  }

  const handleArchiveOld = async () => {
    if (!confirm('Archive all schedules from previous weeks? This will set them to inactive.')) return
    setSaving(true)
    try {
      const result = await archiveOldRadioSchedules()
      if (result.success) {
        alert(`Successfully archived ${result.count} old schedule entries`)
        const refreshed = await getAllWeeklyRadioSchedule()
        setRows(refreshed)
      } else {
        alert('Error archiving old schedules')
      }
    } catch (e) {
      alert('Error archiving old schedules')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyToNextWeek = async () => {
    if (!confirm('Copy current week\'s schedule to next week?')) return
    setSaving(true)
    try {
      const result = await copyScheduleToNextWeek()
      if (result.success) {
        alert(`Successfully copied ${result.count} schedule entries to next week`)
      } else {
        alert('Error copying schedule to next week')
      }
    } catch (e) {
      alert('Error copying schedule to next week')
    } finally {
      setSaving(false)
    }
  }

  const byKey = useMemo(() => {
    const m = new Map<string, any>()
    for (const r of rows) {
      const hour = parseInt((r.start_time_local || '0:00').split(':')[0], 10)
      if (hour >= 19 && hour <= 23) {
        m.set(`${r.day_of_week}-${hour}`, r)
      }
    }
    return m
  }, [rows])

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Manage Weekly Radio Schedule</h1>
              {currentWeek && (
                <p className="text-sm text-gray-400 mt-2">
                  Current Week: <span className="text-blue-400 font-semibold">{new Date(currentWeek).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  {' '}- Schedule resets every Monday
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleArchiveOld} 
                disabled={saving} 
                className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/40 text-yellow-400 rounded-lg hover:bg-yellow-600/30 disabled:opacity-50"
              >
                Archive Old
              </button>
              <button 
                onClick={handleCopyToNextWeek} 
                disabled={saving} 
                className="px-4 py-2 bg-green-600/20 border border-green-500/40 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-50"
              >
                Copy to Next Week
              </button>
              <button disabled={saving} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg">{saving ? 'Saving…' : 'Ready'}</button>
            </div>
          </div>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="px-3 py-2">Day</th>
                      <th className="px-3 py-2">Start</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Set</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Active</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((_, dayIdx) => (
                      HOURS.map(hour => {
                        const existing = byKey.get(`${dayIdx}-${hour}`)
                        return (
                          <EditableRow
                            key={`${dayIdx}-${hour}`}
                            dayIdx={dayIdx}
                            hour={hour}
                            sets={sets}
                            existing={existing}
                            onSave={handleUpsert}
                            onDelete={existing?.id ? () => handleDelete(existing.id) : undefined}
                          />
                        )
                      })
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}

function EditableRow({ dayIdx, hour, sets, existing, onSave, onDelete }: { dayIdx: number; hour: number; sets: any[]; existing?: any; onSave: (p: any) => Promise<void>; onDelete?: () => void }) {
  const [contentType, setContentType] = useState<'set' | 'stream'>(existing?.content_type || 'set')
  const [setId, setSetId] = useState<string>(existing?.set_id || '')
  const [title, setTitle] = useState<string>(existing?.title || '')
  const [streamUrl, setStreamUrl] = useState<string>(existing?.stream_url || '')
  const [active, setActive] = useState<boolean>(existing?.is_active ?? true)

  useEffect(() => {
    if (existing) {
      setContentType(existing.content_type)
      setSetId(existing.set_id || '')
      setTitle(existing.title || '')
      setStreamUrl(existing.stream_url || '')
      setActive(existing.is_active ?? true)
    }
  }, [existing])

  const handleSave = async () => {
    const start = `${String(hour).padStart(2, '0')}:00`
    await onSave({
      id: existing?.id,
      day_of_week: dayIdx,
      start_time_local: start,
      duration_minutes: 60,
      content_type: contentType,
      set_id: contentType === 'set' ? (setId || null) : null,
      stream_url: contentType === 'stream' ? (streamUrl || null) : null,
      title,
      timezone: 'Europe/Istanbul',
      is_active: active,
    })
  }

  return (
    <tr className="glass rounded-xl border border-white/10">
      <td className="px-3 py-2 text-gray-300">{DAYS[dayIdx]}</td>
      <td className="px-3 py-2">{String(hour).padStart(2, '0')}:00</td>
      <td className="px-3 py-2">
        <select aria-label="Content type" title="Content type" value={contentType} onChange={(e) => setContentType(e.target.value as any)} className="bg-white/10 border border-white/20 rounded px-2 py-1">
          <option value="set">Set</option>
          <option value="stream">Stream</option>
        </select>
      </td>
      <td className="px-3 py-2">
        {contentType === 'set' ? (
          <select aria-label="Select set" title="Select set" value={setId} onChange={(e) => setSetId(e.target.value)} className="bg-white/10 border border-white/20 rounded px-2 py-1 max-w-[260px]">
            <option value="">Select set…</option>
            {sets.map((s) => (
              <option key={s.id} value={s.id}>{s.artists?.name ? `${s.artists.name} — ` : ''}{s.title || s.id}</option>
            ))}
          </select>
        ) : (
          <input aria-label="Stream URL" title="Stream URL" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://stream…" className="bg-white/10 border border-white/20 rounded px-2 py-1 w-64" />
        )}
      </td>
      <td className="px-3 py-2">
        <input aria-label="Title" title="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="bg-white/10 border border-white/20 rounded px-2 py-1 w-64" />
      </td>
      <td className="px-3 py-2 text-center">
        <label className="inline-flex items-center gap-2">
          <input aria-label="Active" title="Active" type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span className="text-sm text-gray-300">Active</span>
        </label>
      </td>
      <td className="px-3 py-2 flex gap-2">
        <button onClick={handleSave} className="px-3 py-1 bg-blue-600 rounded">Save</button>
        {onDelete && <button onClick={onDelete} className="px-3 py-1 bg-red-600 rounded">Delete</button>}
      </td>
    </tr>
  )
}


