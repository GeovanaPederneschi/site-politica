import { ImageResponse } from 'next/og'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const alt = 'Capa do artigo'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: { slug: string }
}

export default async function Image({ params }: Props) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('articles')
    .select('title, cover_image_url')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  const hasCover = Boolean(data?.cover_image_url)

  if (hasCover) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            backgroundImage: `url(${data!.cover_image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ),
      { ...size }
    )
  }

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
        <div style={{ display: 'flex', width: 90, height: 4, backgroundColor: '#8b1a1a', marginTop: 32 }} />
      </div>
    ),
    { ...size }
  )
}
