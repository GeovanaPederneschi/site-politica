import { createServerSupabaseClient } from '@/lib/supabase-server'
import ArticleCard from '@/components/ArticleCard'
import { ArticleWithAuthor } from '@/types'

interface HomePageProps {
  searchParams: { categoria?: string }
}

export const revalidate = 60

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = createServerSupabaseClient()
  const categoria = searchParams.categoria

  let query = supabase
    .from('articles')
    .select('*, profiles(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (categoria) {
    query = query.eq('category', categoria)
  }

  const { data: articles } = await query
  const all = (articles as ArticleWithAuthor[]) ?? []

  const featured = all.filter(a => a.featured)
  const rest = all.filter(a => !a.featured)
  const topFeatured = featured[0] ?? rest[0]
  const sideItems = featured.slice(1, 4).length > 0 ? featured.slice(1, 4) : rest.slice(0, 3)
  const gridItems = all.filter(a => a.id !== topFeatured?.id && !sideItems.find(s => s.id === a.id))

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {categoria && (
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold text-ink border-b-2 border-accent pb-2 inline-block">
            {categoria}
          </h2>
        </div>
      )}

      {all.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-serif text-xl text-ink-muted">Nenhum artigo publicado ainda.</p>
          <p className="text-sm text-ink-muted mt-2">Volte em breve.</p>
        </div>
      ) : (
        <>
          {/* Hero section */}
          {topFeatured && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold tracking-widest uppercase text-ink-muted">Destaque</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ArticleCard article={topFeatured} variant="featured" />
                </div>
                <div className="flex flex-col">
                  {sideItems.map(a => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* More articles grid */}
          {gridItems.length > 0 && (
            <>
              <hr className="divider-rule" />
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold tracking-widest uppercase text-ink-muted">
                  {categoria ? `Mais em ${categoria}` : 'Mais artigos'}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridItems.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}
