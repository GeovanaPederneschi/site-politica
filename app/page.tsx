import { createServerSupabaseClient } from '@/lib/supabase-server'
import ArticleCard from '@/components/ArticleCard'
import { ArticleWithAuthor } from '@/types'
import Image from 'next/image'

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

      {/* Institutional about — shown only on unfiltered home */}
      {!categoria && (
        <section className="mb-10 pb-8 border-b border-border">
          <p className="text-sm text-ink leading-relaxed max-w-3xl">
            O Atlantis Sul é um portal de ensaios e reflexões sobre política, economia, história,
            filosofia, direito e geopolítica. O site reúne textos, análises e intervenções de autores
            que compartilham o interesse por questões fundamentais de ordem pública, formação histórica,
            economia política e interpretação do Brasil.
          </p>
          <p className="text-sm text-ink-muted leading-relaxed max-w-3xl mt-3">
            O nome Atlantis Sul evoca a tradição clássica greco-romana e a civilização atlântica, ao
            mesmo tempo que se ancora no hemisfério sul, no Brasil e na América do Sul. É uma revista
            de ideias que não abre mão da densidade teórica, da clareza editorial e da responsabilidade
            intelectual.
          </p>
        </section>
      )}

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

      {/* Founder & Editor — shown only on unfiltered home */}
      {!categoria && (
        <section className="mt-16 pt-10 border-t border-border">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold tracking-widest uppercase text-ink-muted">Fundador e editor</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-col sm:flex-row gap-8 items-start max-w-3xl">
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-full border border-border">
              <Image
                src="/tuca.jpeg"
                alt="João Arthur Mendes Castro"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-ink mb-1">João Arthur Mendes Castro</h3>
              <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">Fundador e editor</p>
              <p className="text-sm text-ink leading-relaxed mb-2">
                Advogado (OAB/SP), com estudos voltados para Direito Econômico, Finanças Públicas e Tributário,
                e bacharel em Filosofia pela Universidade Católica de Brasília (UCB).
              </p>
              <p className="text-sm text-ink-muted leading-relaxed">
                Fundador e editor do Atlantis Sul, onde escreve sobre política, economia, história, filosofia,
                direito e geopolítica. Criador de conteúdo audiovisual para YouTube e pesquisador independente
                em história das ideias, economia institucional e pensamento político clássico.
              </p>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
