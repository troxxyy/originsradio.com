import { useEffect, useRef, useState } from 'react'

interface AnalyzerFrame {
  bass: number
  high: number
}

export function useAnalyzerStream(setId?: string) {
  const [frame, setFrame] = useState<AnalyzerFrame | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const enabled = import.meta.env.VITE_ANALYZER_STREAM === '1'
    const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!enabled || !base || !anon) return

    const url = `${base.replace(/\/$/, '')}/analyze-set${setId ? `?set_id=${encodeURIComponent(setId)}` : ''}`
    const controller = new AbortController()
    abortRef.current = controller

    ;(async () => {
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${anon}`,
            Accept: 'text/event-stream'
          },
          signal: controller.signal,
        })
        if (!res.ok || !res.body) return
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let idx
          while ((idx = buffer.indexOf('\n\n')) !== -1) {
            const chunk = buffer.slice(0, idx)
            buffer = buffer.slice(idx + 2)
            const lines = chunk.split('\n')
            // Optional: handle named events (event: xxx)
            const dataLine = lines.find(l => l.startsWith('data: '))
            if (!dataLine) continue
            const jsonStr = dataLine.slice(6)
            try {
              const data = JSON.parse(jsonStr)
              if (typeof data?.bass === 'number' && typeof data?.high === 'number') {
                const bass = Math.max(0, Math.min(1, data.bass))
                const high = Math.max(0, Math.min(1, data.high))
                setFrame({ bass, high })
              }
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // network/abort; allow fallback
      }
    })()

    return () => {
      try { abortRef.current?.abort() } catch {}
      abortRef.current = null
    }
  }, [setId])

  return frame
}


