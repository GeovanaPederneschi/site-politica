'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CheckCircle, XCircle, Star, StarOff, EyeOff, ExternalLink, Pencil } from 'lucide-react'
import Link from 'next/link'
import { ArticleStatus } from '@/types'

interface AdminActionsProps {
  articleId: string
  slug: string
  currentStatus: ArticleStatus
  featured: boolean
}

export default function AdminActions({ articleId, slug, currentStatus, featured }: AdminActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function update(updates: Record<string, unknown>) {
    setLoading(true)
    await supabase.from('articles').update(updates).eq('id', articleId)
    router.refresh()
    setLoading(false)
  }

  async function approve() {
    await update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
  }

  async function reject() {
    await update({ status: 'rejected' })
  }

  async function unpublish() {
    await update({ status: 'pending', published_at: null })
  }

  async function toggleFeatured() {
    await update({ featured: !featured })
  }

  return (
    <div className={`flex flex-col gap-1.5 flex-shrink-0 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <Link
        href={`/painel/editar/${articleId}`}
        className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted border border-border px-3 py-1.5 hover:bg-paper-warm transition-colors"
      >
        <Pencil size={13} />
        Editar
      </Link>

      {currentStatus === 'pending' && (
        <>
          <button
            onClick={approve}
            className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 hover:bg-green-100 transition-colors"
          >
            <CheckCircle size={13} />
            Aprovar
          </button>
          <button
            onClick={reject}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 hover:bg-red-100 transition-colors"
          >
            <XCircle size={13} />
            Rejeitar
          </button>
        </>
      )}

      {currentStatus === 'published' && (
        <>
          <Link
            href={`/${slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted border border-border px-3 py-1.5 hover:border-ink transition-colors"
          >
            <ExternalLink size={13} />
            Ver artigo
          </Link>
          <button
            onClick={toggleFeatured}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 hover:bg-amber-100 transition-colors"
          >
            {featured ? <><StarOff size={13} />Remover destaque</> : <><Star size={13} />Destacar</>}
          </button>
          <button
            onClick={unpublish}
            className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted border border-border px-3 py-1.5 hover:bg-paper-warm transition-colors"
          >
            <EyeOff size={13} />
            Despublicar
          </button>
        </>
      )}
    </div>
  )
}
