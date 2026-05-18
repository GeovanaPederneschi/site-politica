import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye } from 'lucide-react'
import { ArticleWithAuthor } from '@/types'

interface ArticleCardProps {
  article: ArticleWithAuthor
  variant?: 'default' | 'featured' | 'compact'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const date = article.published_at
    ? format(new Date(article.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : ''

  const authorName = article.profiles?.full_name ?? 'Autor'
  const imgPosition = article.cover_position ?? 'center center'

  if (variant === 'featured') {
    return (
      <Link href={`/${article.slug}`} className="group block">
        <article className="grid md:grid-cols-2 gap-0 border border-border bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative aspect-[4/3] md:aspect-auto min-h-[240px] bg-ink-light">
            {article.cover_image_url ? (
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                className="object-cover"
                style={{ objectPosition: imgPosition }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-paper-warm">
                <span className="font-serif text-4xl text-ink-muted opacity-30">AS</span>
              </div>
            )}
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className="category-badge block mb-3">{article.category}</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink leading-tight mb-3 group-hover:text-accent transition-colors">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-ink-muted text-sm leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>
            )}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div>
                <p className="text-xs font-semibold text-ink">{authorName}</p>
                <p className="text-xs text-ink-muted">{date}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-ink-muted">
                <Eye size={13} />
                <span>{article.views.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/${article.slug}`} className="group block">
        <article className="flex gap-4 py-4 border-b border-border last:border-0">
          {article.cover_image_url && (
            <div className="relative w-20 h-20 flex-shrink-0 bg-paper-warm">
              <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="category-badge block mb-1">{article.category}</span>
            <h3 className="font-serif text-base font-bold text-ink leading-snug group-hover:text-accent transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-xs text-ink-muted mt-1">{authorName} · {date}</p>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/${article.slug}`} className="group block">
      <article className="bg-white border border-border hover:shadow-md transition-shadow overflow-hidden">
        <div className="relative aspect-[16/9] bg-paper-warm">
          {article.cover_image_url ? (
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              style={{ objectPosition: imgPosition }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-3xl text-ink-muted opacity-20">AS</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <span className="category-badge block mb-2">{article.category}</span>
          <h3 className="font-serif text-lg font-bold text-ink leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-3">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-ink-muted leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <p className="text-xs font-semibold text-ink">{authorName}</p>
              <p className="text-xs text-ink-muted">{date}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-ink-muted">
              <Eye size={12} />
              <span>{article.views.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
