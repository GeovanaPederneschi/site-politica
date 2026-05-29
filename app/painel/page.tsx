import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Eye, Clock, CheckCircle, XCircle, Pencil, UserCircle } from 'lucide-react'
import { Article } from '@/types'

const statusMap = {
  pending: { label: 'Aguardando aprovação', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  published: { label: 'Publicado', icon: CheckCircle, color: 'text-green-700 bg-green-50 border-green-200' },
  rejected: { label: 'Rejeitado', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200' },
}

export default async function PainelPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const myArticles = (articles as Article[]) ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 pb-6 border-b border-border">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-1">Painel do Autor</p>
          <h1 className="font-serif text-3xl font-bold text-ink">
            Olá, {profile?.full_name?.split(' ')[0] ?? 'autor'}
          </h1>
          <p className="text-sm text-ink-muted mt-1">Gerencie seus artigos e submeta novos textos.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/painel/perfil"
            className="flex items-center gap-2 border border-border text-ink px-5 py-2.5 text-xs font-semibold tracking-wide uppercase hover:bg-paper-warm transition-colors"
          >
            <UserCircle size={14} />
            Meu perfil
          </Link>
          <Link
            href="/painel/novo-artigo"
            className="flex items-center gap-2 bg-ink text-paper px-5 py-2.5 text-xs font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors"
          >
            <Plus size={14} />
            Novo artigo
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {(['pending', 'published', 'rejected'] as const).map(status => {
          const count = myArticles.filter(a => a.status === status).length
          const { label } = statusMap[status]
          return (
            <div key={status} className="border border-border bg-white p-4 text-center">
              <p className="text-3xl font-serif font-bold text-ink">{count}</p>
              <p className="text-xs text-ink-muted mt-1">{label}</p>
            </div>
          )
        })}
      </div>

      {/* Articles list */}
      <div>
        <h2 className="font-serif text-xl font-bold text-ink mb-4">Meus artigos</h2>

        {myArticles.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border">
            <p className="text-ink-muted font-sans text-sm">Você ainda não submeteu nenhum artigo.</p>
            <Link href="/painel/novo-artigo" className="inline-block mt-4 text-accent text-sm font-semibold hover:underline">
              Escrever meu primeiro artigo →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myArticles.map(article => {
              const { label, icon: Icon, color } = statusMap[article.status]
              return (
                <div key={article.id} className="bg-white border border-border p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="category-badge">{article.category}</span>
                    </div>
                    <h3 className="font-serif font-bold text-ink text-base leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-ink-muted mt-1">
                      Submetido em {format(new Date(article.created_at), "d/MM/yyyy", { locale: ptBR })}
                      {article.status === 'published' && article.views > 0 && (
                        <span className="ml-3 flex items-center gap-1 inline-flex">
                          <Eye size={11} /> {article.views.toLocaleString('pt-BR')} views
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 border ${color}`}>
                      <Icon size={12} />
                      {label}
                    </span>
                    <div className="flex items-center gap-3">
                      {article.status === 'published' && (
                        <Link href={`/${article.slug}`} className="text-xs text-accent hover:underline">
                          Ver publicado →
                        </Link>
                      )}
                      <Link
                        href={`/painel/editar/${article.id}`}
                        className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
                      >
                        <Pencil size={11} />
                        Editar
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
