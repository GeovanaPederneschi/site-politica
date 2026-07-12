import { ImageResponse } from 'next/og'

export const alt = 'Atlantis Sul'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafaf8',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', width: 90, height: 4, backgroundColor: '#8b1a1a', marginBottom: 32 }} />
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 700,
            color: '#1a1a1a',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          Atlantis Sul
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#6b6b6b', marginTop: 24, textAlign: 'center' }}>
          Política · Filosofia · Direito · Economia · Geopolítica
        </div>
        <div style={{ display: 'flex', width: 90, height: 4, backgroundColor: '#8b1a1a', marginTop: 32 }} />
      </div>
    ),
    { ...size }
  )
}
