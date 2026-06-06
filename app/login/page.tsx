'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const senhaRedefinida = searchParams.get('senha_redefinida') === '1'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    router.push(profile?.role === 'admin' ? '/admin' : '/painel')
    router.refresh()
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl font-bold text-ink">
            Atlantis Sul
          </Link>
          <p className="text-sm text-ink-muted mt-2 font-sans">Entre na sua conta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {senhaRedefinida && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3">
              Senha redefinida com sucesso. Faça login com a nova senha.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted">
                Senha
              </label>
              <Link href="/esqueci-senha" className="text-xs text-accent hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-border bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-ink transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-3 text-sm font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Não tem uma conta?{' '}
          <Link href="/cadastro" className="text-accent font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
