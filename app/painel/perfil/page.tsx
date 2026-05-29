'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setFullName(profile.full_name ?? '')
        setBio(profile.bio ?? '')
        setExistingAvatarUrl(profile.avatar_url)
        setAvatarPreview(profile.avatar_url)
      }
      setLoadingProfile(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarRemoved(false)
  }

  function removeAvatar() {
    setAvatarPreview(null)
    setAvatarFile(null)
    setAvatarRemoved(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError('O nome é obrigatório.'); return }
    setLoading(true)
    setError('')
    setSaved(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      let avatarUrl: string | null = existingAvatarUrl

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const fileName = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: publicData } = supabase.storage.from('covers').getPublicUrl(fileName)
        avatarUrl = publicData.publicUrl
      } else if (avatarRemoved) {
        avatarUrl = null
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, bio: bio || null, avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setExistingAvatarUrl(avatarUrl)
      setAvatarFile(null)
      setAvatarRemoved(false)
      setSaved(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-ink-muted text-sm">Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-ink-muted mb-1">Painel do Autor</p>
        <h1 className="font-serif text-3xl font-bold text-ink">Meu perfil</h1>
        <p className="text-sm text-ink-muted mt-1">Estas informações aparecem nos artigos que você publicar.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>
        )}
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">Perfil atualizado com sucesso.</div>
        )}

        {/* Avatar */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
            Foto de perfil <span className="font-normal normal-case text-ink-muted">(opcional)</span>
          </label>
          {avatarPreview ? (
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-paper-warm flex-shrink-0">
                <Image src={avatarPreview} alt="Avatar" fill className="object-cover" sizes="96px" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-ink-muted border border-border px-3 py-1.5 cursor-pointer hover:bg-paper-warm transition-colors">
                  <Upload size={13} />
                  Trocar foto
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="flex items-center gap-2 text-xs font-semibold text-red-600 border border-red-200 px-3 py-1.5 hover:bg-red-50 transition-colors"
                >
                  <X size={13} />
                  Remover foto
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center gap-3 w-fit cursor-pointer border-2 border-dashed border-border bg-white px-6 py-4 hover:border-ink-muted transition-colors">
              <div className="w-12 h-12 rounded-full bg-paper-warm flex items-center justify-center text-ink-muted">
                <Upload size={20} />
              </div>
              <div>
                <span className="text-sm text-ink-muted block">Clique para enviar foto</span>
                <span className="text-xs text-ink-muted">JPG, PNG, WebP</span>
              </div>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Nome */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">Nome completo *</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
            placeholder="Dr. João Silva"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
            Mini bio <span className="font-normal normal-case text-ink-muted">(opcional)</span>
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors resize-none"
            placeholder="Professor de filosofia política na USP. Pesquisador de teoria democrática e pensamento político contemporâneo..."
          />
          <p className="text-xs text-ink-muted mt-1">Aparece na seção &ldquo;Sobre o autor&rdquo; abaixo de cada artigo.</p>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={loading}
            className="bg-ink text-paper px-8 py-3 text-sm font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar perfil'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/painel')}
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Voltar ao painel
          </button>
        </div>
      </form>
    </div>
  )
}
