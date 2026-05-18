import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ArticleWithAuthor, Profile } from '@/types'
import AdminActions from './AdminActions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Users, Plus, Tag } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/painel')

  const { data: pending } = await supabase
    .from('articles')
    .select('*, profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: published } = await supabase
    .from('articles')
    .select('*, profiles(*)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const pendingList = (pending as ArticleWithAuthor[]) ?? []
  const publishedList = (published as ArticleWithAuthor[]) ?? []
  const userList = (users as Profile[]) ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 pb-6 border-b border-border">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-1">Área Restrita</p>
          <h1 className="font-serif text-3xl font-bold text-ink">Painel Administrativo</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 border border-border text-ink px-5 py-2.5 text-xs font-semibold tracking-wide uppercase hover:bg-paper-warm transition-colors"
          >
            <Tag size={14} />
            Categorias
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="border border-border bg-white p-4 text-center">
          <p className="text-3xl font-serif font-bold text-amber-600">{pendingList.length}</p>
          <p className="text-xs text-ink-muted mt-1">Aguardando aprovação</p>
        </div>
        <div className="border border-border bg-white p-4 text-center">
          <p className="text-3xl font-serif font-bold text-green-700">{publishedList.length}</p>
          <p className="text-xs text-ink-muted mt-1">Publicados</p>
        </div>
        <div className="border border-border bg-white p-4 text-center">
          <p className="text-3xl font-serif font-bold text-ink">
            {publishedList.reduce((s, a) => s + a.views, 0).toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-ink-muted mt-1">Visualizações totais</p>
        </div>
        <div className="border border-border bg-white p-4 text-center">
          <p className="text-3xl font-serif font-bold text-ink">{userList.length}</p>
          <p className="text-xs text-ink-muted mt-1">Usuários cadastrados</p>
        </div>
      </div>

      {/* Pending articles */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink mb-4 pb-2 border-b border-border flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            {pendingList.length}
          </span>
          Artigos aguardando aprovação
        </h2>

        {pendingList.length === 0 ? (
          <p className="text-ink-muted text-sm py-6 text-center border border-dashed border-border">
            Nenhum artigo pendente.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingList.map(article => (
              <div key={article.id} className="bg-white border border-amber-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="category-badge">{article.category}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-ink leading-snug">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-sm text-ink-muted mt-1 line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
                      <span>Por <strong className="text-ink">{article.profiles.full_name}</strong></span>
                      <span>Submetido em {format(new Date(article.created_at), "d/MM/yyyy", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <AdminActions articleId={article.id} slug={article.slug} currentStatus="pending" featured={article.featured} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Published articles */}
      <section className="mb-12">
        <h2 className="font-serif text-xl font-bold text-ink mb-4 pb-2 border-b border-border">
          Artigos publicados
        </h2>
        {publishedList.length === 0 ? (
          <p className="text-ink-muted text-sm py-6 text-center border border-dashed border-border">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="space-y-3">
            {publishedList.map(article => (
              <div key={article.id} className="bg-white border border-border p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="category-badge">{article.category}</span>
                    {article.featured && (
                      <span className="text-xs font-semibold text-accent bg-red-50 px-2 py-0.5 border border-red-200">★ Destaque</span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-ink leading-snug line-clamp-1">{article.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                    <span>{article.profiles.full_name}</span>
                    <span className="flex items-center gap-1"><Eye size={11} />{article.views.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <AdminActions articleId={article.id} slug={article.slug} currentStatus="published" featured={article.featured} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Users */}
      <section>
        <h2 className="font-serif text-xl font-bold text-ink mb-4 pb-2 border-b border-border flex items-center gap-2">
          <Users size={18} />
          Usuários
        </h2>
        <div className="space-y-2">
          {userList.map(u => (
            <div key={u.id} className="bg-white border border-border px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-ink">{u.full_name}</p>
                <p className="text-xs text-ink-muted">
                  Cadastrado em {format(new Date(u.created_at), "d/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 border ${
                u.role === 'admin'
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper-warm text-ink-muted border-border'
              }`}>
                {u.role === 'admin' ? 'Admin' : 'Autor'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
