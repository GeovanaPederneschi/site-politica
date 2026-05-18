'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function CadastroPage() {
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('A senha precisa ter ao menos 6 caracteres.')
      setLoading(false)
      return
    }

    // Passa full_name como metadata para o trigger criar o perfil automaticamente
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Se confirmação de email está desativada, a sessão já existe — atualiza bio e nome
    if (data.session && data.user) {
      await supabase
        .from('profiles')
        .update({ full_name: fullName, bio: bio || null })
        .eq('id', data.user.id)
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">Conta criada!</h2>
          <p className="text-sm text-ink-muted mb-6">
            Sua conta foi criada. Faça login para acessar o painel.
          </p>
          <Link href="/login" className="inline-block bg-ink text-paper px-6 py-3 text-sm font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors">
            Ir para login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl font-bold text-ink">
            Atlantis Sul
          </Link>
          <p className="text-sm text-ink-muted mt-2 font-sans">Crie sua conta de autor</p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
              placeholder="Dr. João Silva"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1.5">
              Mini bio <span className="text-ink-muted font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors resize-none"
              placeholder="Professor de filosofia política na USP..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-3 text-sm font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
