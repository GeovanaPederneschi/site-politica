'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CATEGORIES } from '@/types'
import ArticleEditor from '@/components/ArticleEditor'
import { Upload, X } from 'lucide-react'
import slugify from 'slugify'
import Image from 'next/image'

export default function NovoArtigoPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<typeof CATEGORIES[number]>(CATEGORIES[0])
  const [tags, setTags] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
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

      let coverUrl: string | null = null

      if (coverFile) {
        const ext = coverFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, coverFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage.from('covers').getPublicUrl(fileName)
        coverUrl = publicData.publicUrl
      }

      const baseSlug = slugify(title, { lower: true, strict: true, locale: 'pt' })
      const slug = `${baseSlug}-${Date.now()}`

      const tagsArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)

      const { error: insertError } = await supabase.from('articles').insert({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        cover_image_url: coverUrl,
        author_id: user.id,
        category,
        tags: tagsArray,
        status: 'pending',
        featured: false,
        views: 0,
      })

      if (insertError) throw insertError

      router.push('/painel')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao submeter artigo.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-1">Painel do Autor</p>
        <h1 className="font-serif text-3xl font-bold text-ink">Novo artigo</h1>
        <p className="text-sm text-ink-muted mt-1">Após submeter, o artigo aguardará aprovação do administrador.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
            Título *
          </label>
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
            Resumo / Lead <span className="font-normal normal-case text-ink-muted">(opcional — aparece no card e no início do artigo)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors resize-none"
            placeholder="Uma breve descrição do argumento central do artigo..."
          />
        </div>

        {/* Category + Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
              Categoria *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as typeof CATEGORIES[number])}
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
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
            <div className="relative">
              <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden bg-paper-warm">
                <Image src={coverPreview} alt="Capa" fill className="object-cover" sizes="400px" />
              </div>
              <button
                type="button"
                onClick={() => { setCoverPreview(null); setCoverFile(null) }}
                className="absolute top-2 left-2 bg-ink text-paper p-1 hover:bg-accent transition-colors"
              >
                <X size={14} />
              </button>
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
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
            Corpo do artigo *
          </label>
          <ArticleEditor content={content} onChange={setContent} />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-paper px-8 py-3 text-sm font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Submetendo...' : 'Submeter para aprovação'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/painel')}
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
