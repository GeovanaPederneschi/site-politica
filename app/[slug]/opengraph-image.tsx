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
    .select('title, category, cover_image_url')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  const title = data?.title ?? 'Atlantis Sul'
  const category = data?.category
  const hasCover = Boolean(data?.cover_image_url)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#1a1a1a',
          backgroundImage: hasCover ? `url(${data!.cover_image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: hasCover
              ? 'linear-gradient(180deg, rgba(26,26,26,0.05) 30%, rgba(26,26,26,0.92) 100%)'
              : 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            width: '100%',
            height: '100%',
            padding: '64px',
            position: 'relative',
          }}
        >
          {category && (
            <div
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#c0504d',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              {category}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontWeight: 700,
              color: '#fafaf8',
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#e2e0da', marginTop: 28, fontWeight: 600 }}>
            Atlantis Sul
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
