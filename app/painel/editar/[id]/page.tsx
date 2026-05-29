'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Category } from '@/types'
import ArticleEditor from '@/components/ArticleEditor'
import FocalPointPicker from '@/components/FocalPointPicker'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

export default function EditarArtigoPage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [tags, setTags] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverRemoved, setCoverRemoved] = useState(false)
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null)
  const [coverPosition, setCoverPosition] = useState('center center')
  const [loading, setLoading] = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [profileResult, articleResult, categoriesResult] = await Promise.all([
        supabase.from('profiles').select('role').eq('id', user.id).single(),
        supabase.from('articles').select('*').eq('id', articleId).single(),
        supabase.from('categories').select('*').order('display_order'),
      ])

      const admin = profileResult.data?.role === 'admin'
      setIsAdmin(admin)

      const article = articleResult.data
      if (!article) { router.push(admin ? '/admin' : '/painel'); return }
      if (!admin && article.author_id !== user.id) { router.push('/painel'); return }

      const all = categoriesResult.data ?? []
      const topLevel = all.filter((c: Category) => !c.parent_id).map((c: Category) => ({
        ...c,
        subcategories: all.filter((s: Category) => s.parent_id === c.id),
      }))
      setCategories(topLevel)

      setTitle(article.title)
      setExcerpt(article.excerpt ?? '')
      setContent(article.content)
      setCategory(article.category)
      setSubcategory(article.subcategory ?? '')
      setTags((article.tags ?? []).join(', '))
      setExistingCoverUrl(article.cover_image_url)
      setCoverPreview(article.cover_image_url)
      setCoverPosition(article.cover_position ?? 'center center')
      setLoadingArticle(false)
    }
    load()
  }, [articleId]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedCategory = categories.find(c => c.name === category)
  const subcategories = selectedCategory?.subcategories ?? []

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setCoverRemoved(false)
  }

  function removeCover() {
    setCoverPreview(null)
    setCoverFile(null)
    setCoverRemoved(true)
  }

  async function handleInlineImageUpload(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Não autenticado')
    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/inline/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(fileName, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: publicData } = supabase.storage.from('covers').getPublicUrl(fileName)
    return publicData.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content || content === '<p></p>') {
      setError('Preencha o título e o corpo do artigo.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      let coverUrl: string | null = existingCoverUrl

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, coverFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicData } = supabase.storage.from('covers').getPublicUrl(fileName)
        coverUrl = publicData.publicUrl
      } else if (coverRemoved) {
        coverUrl = null
      }

      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)

      const { error: updateError } = await supabase.from('articles').update({
        title,
        content,
        excerpt: excerpt || null,
        cover_image_url: coverUrl,
        cover_position: coverPosition,
        category,
        subcategory: subcategory || null,
        tags: tagsArray,
      }).eq('id', articleId)

      if (updateError) throw updateError
      router.push(isAdmin ? '/admin' : '/painel')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar artigo.')
      setLoading(false)
    }
  }

  if (loadingArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-ink-muted text-sm">Carregando artigo...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-1">
          {isAdmin ? 'Painel Admin' : 'Painel do Autor'}
        </p>
        <h1 className="font-serif text-3xl font-bold text-ink">Editar artigo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">Título *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border border-border bg-white px-3 py-3 font-serif text-xl text-ink focus:outline-none focus:border-ink transition-colors"
            placeholder="Título do artigo"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
            Resumo / Lead <span className="font-normal normal-case text-ink-muted">(opcional)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors resize-none"
            placeholder="Breve descrição do argumento central..."
          />
        </div>

        {/* Category + Subcategory + Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">Categoria *</label>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setSubcategory('') }}
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            >
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
              Subcategoria <span className="font-normal normal-case text-ink-muted">(opcional)</span>
            </label>
            <select
              value={subcategory}
              onChange={e => setSubcategory(e.target.value)}
              disabled={subcategories.length === 0}
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors disabled:opacity-40"
            >
              <option value="">— nenhuma —</option>
              {subcategories.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
              Tags <span className="font-normal normal-case text-ink-muted">(separadas por vírgula)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
              placeholder="democracia, Rawls, justiça"
            />
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
            Foto de capa <span className="font-normal normal-case text-ink-muted">(opcional)</span>
          </label>
          {coverPreview ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden bg-paper-warm">
                  <Image src={coverPreview} alt="Capa" fill className="object-cover" style={{ objectPosition: coverPosition }} sizes="400px" />
                </div>
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 left-2 bg-ink text-paper p-1 hover:bg-accent transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-ink-muted mb-2">Enquadramento da imagem</p>
                <FocalPointPicker value={coverPosition} onChange={setCoverPosition} imageUrl={coverPreview} />
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-md aspect-[16/9] border-2 border-dashed border-border bg-white cursor-pointer hover:border-ink-muted transition-colors">
              <Upload size={24} className="text-ink-muted mb-2" />
              <span className="text-sm text-ink-muted">Clique para enviar imagem</span>
              <span className="text-xs text-ink-muted mt-1">JPG, PNG, WebP — máx. 5MB</span>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">Corpo do artigo *</label>
          <ArticleEditor content={content} onChange={setContent} onUploadImage={handleInlineImageUpload} />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-paper px-8 py-3 text-sm font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
          <button
            type="button"
            onClick={() => router.push(isAdmin ? '/admin' : '/painel')}
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
