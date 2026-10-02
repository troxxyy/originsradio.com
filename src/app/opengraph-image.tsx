import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const alt = 'OriginsRadio — electronic music radio, DJs and events'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const font = await readFile(path.join(process.cwd(), 'public/fonts/NewakeFont-Demo.otf'))
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: 'linear-gradient(135deg, #221710, #08090d 60%)', color: '#eeeef4' }}>
      <div style={{ fontSize: 22, letterSpacing: 6, color: '#a6b2e1', marginBottom: 28 }}>INDEPENDENT SOUNDS. SHARED FREQUENCIES.</div>
      <div style={{ fontFamily: 'Newake', fontSize: 100 }}>ORIGINSRADIO</div>
      <div style={{ fontSize: 30, color: '#cfc6db', marginTop: 28 }}>Electronic music radio · DJs · Events</div>
      <div style={{ fontSize: 22, color: '#a6b2e1', marginTop: 50 }}>originsradio.com</div>
    </div>,
    { ...size, fonts: [{ name: 'Newake', data: font, weight: 400 }] },
  )
}
