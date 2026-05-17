'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function ViewCounter({ slug }: { slug: string }) {
  const supabase = createClient()

  useEffect(() => {
    supabase.rpc('increment_views', { article_slug: slug })
  }, [slug])

  return null
}
