import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const BASE_URL = 'https://atlantisul.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const articleEntries: MetadataRoute.Sitemap = (articles ?? []).map(a => ({
    url: `${BASE_URL}/${a.slug}`,
    lastModified: new Date(a.published_at ?? a.created_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...articleEntries,
  ]
}
