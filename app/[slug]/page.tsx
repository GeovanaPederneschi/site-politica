import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Clock, ArrowLeft } from 'lucide-react'
import { ArticleWithAuthor } from '@/types'
import ViewCounter from './ViewCounter'

interface ArticlePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'Artigo não encontrado' }
  return { title: data.title, description: data.excerpt }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const supabase = createServerSupabaseClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*, profiles(*)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  const a = article as ArticleWithAuthor

  const date = a.published_at
    ? format(new Date(a.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : ''

  const wordCount = a.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent transition-colors font-sans">
          <ArrowLeft size={13} />
          Voltar para início
        </Link>
      </div>

      {/* Category */}
      <div className="mb-4">
        <Link
          href={`/?categoria=${encodeURIComponent(a.category)}`}
          className="category-badge hover:text-accent-light transition-colors"
        >
          {a.category}
        </Link>
      </div>

      {/* Title */}
      <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-ink leading-tight mb-6">
        {a.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-8 pb-6 border-b border-border">
        <div>
          <span className="text-sm font-semibold text-ink">{a.profiles.full_name}</span>
        </div>
        <span className="text-ink-muted text-sm">{date}</span>
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <Clock size={12} />
          <span>{readTime} min de leitura</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <Eye size={12} />
          <span>{a.views.toLocaleString('pt-BR')} visualizações</span>
        </div>
      </div>

      {/* Cover image */}
      {a.cover_image_url && (
        <div className="relative aspect-[16/9] mb-8 overflow-hidden bg-paper-warm">
          <Image
            src={a.cover_image_url}
            alt={a.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Excerpt */}
      {a.excerpt && (
        <p className="font-serif text-xl text-ink-light italic leading-relaxed mb-8 pb-6 border-b border-border">
          {a.excerpt}
        </p>
      )}

      {/* Body */}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: a.content }}
      />

      {/* Tags */}
      {a.tags && a.tags.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
          {a.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-paper-warm border border-border text-xs text-ink-muted font-sans rounded-none">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author bio */}
      <div className="mt-10 pt-8 border-t-2 border-ink">
        <h3 className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-4">Sobre o autor</h3>
        <div className="flex gap-4 items-start">
          {a.profiles.avatar_url && (
            <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden bg-paper-warm">
              <Image src={a.profiles.avatar_url} alt={a.profiles.full_name} fill className="object-cover" sizes="64px" />
            </div>
          )}
          <div>
            <p className="font-serif text-lg font-bold text-ink">{a.profiles.full_name}</p>
            {a.profiles.bio && (
              <p className="text-sm text-ink-muted leading-relaxed mt-1">{a.profiles.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* View counter (increments on mount) */}
      <ViewCounter slug={params.slug} />
    </article>
  )
}
