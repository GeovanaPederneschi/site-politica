import { createServerSupabaseClient } from '@/lib/supabase-server'
import { mapSearchRow, SearchArticleRow, MIN_SEARCH_LENGTH } from '@/lib/search'
import ArticleCard from '@/components/ArticleCard'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

interface BuscaPageProps {
  searchParams: { q?: string }
}

export function generateMetadata({ searchParams }: BuscaPageProps): Metadata {
  const q = searchParams.q?.trim()
  return {
    title: q ? `Resultados para "${q}"` : 'Buscar',
    robots: { index: false, follow: true },
  }
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const q = (searchParams.q ?? '').trim()
  const supabase = createServerSupabaseClient()

  let results: ReturnType<typeof mapSearchRow>[] = []

  if (q.length >= MIN_SEARCH_LENGTH) {
    const { data, error } = await supabase.rpc('search_articles', {
      search_query: q,
      result_limit: 30,
    })
    if (error) console.error('[BuscaPage] erro na busca:', error)
    results = ((data as SearchArticleRow[]) ?? []).map(mapSearchRow)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Search size={18} className="text-ink-muted" />
          <h1 className="font-serif text-2xl font-bold text-ink">Busca</h1>
        </div>
        {q ? (
          <p className="text-sm text-ink-muted">
            {results.length > 0
              ? `${results.length} resultado${results.length > 1 ? 's' : ''} para "${q}"`
              : `Nenhum resultado para "${q}"`}
          </p>
        ) : (
          <p className="text-sm text-ink-muted">Digite um termo na busca para encontrar artigos.</p>
        )}
      </div>

      {q.length > 0 && q.length < MIN_SEARCH_LENGTH && (
        <p className="text-sm text-ink-muted">Digite pelo menos {MIN_SEARCH_LENGTH} caracteres.</p>
      )}

      {results.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </section>
      )}

      {q.length >= MIN_SEARCH_LENGTH && results.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-serif text-lg text-ink-muted">Nenhum artigo encontrado.</p>
          <p className="text-sm text-ink-muted mt-2">Tente outros termos ou verifique a ortografia.</p>
        </div>
      )}
    </div>
  )
}
