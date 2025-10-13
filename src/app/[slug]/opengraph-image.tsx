import { ImageResponse } from 'next/og'
import { getArtistBySlug } from '../../lib/artists'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const artist = await getArtistBySlug(params.slug)
  const name = artist?.name ?? 'Origins Radio'
  const photo = artist?.photo_url
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          background: '#0b0b0b',
          color: 'white',
          padding: '48px',
          gap: '36px',
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={420}
            height={420}
            style={{ borderRadius: 16, objectFit: 'cover' }}
          />
        ) : null}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 72, fontWeight: 700 }}>{name}</div>
          <div style={{ marginTop: 16, fontSize: 36, opacity: 0.8 }}>Origins Radio</div>
        </div>
      </div>
    ),
    { ...size }
  )
}


