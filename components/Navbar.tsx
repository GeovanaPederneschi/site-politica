'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types'
import { Menu, X, User, LogOut } from 'lucide-react'
import { CATEGORIES } from '@/types'

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }
    loadProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile()
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    window.location.href = '/'
  }

  return (
    <header className="bg-paper border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border bg-ink text-paper-warm">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between text-xs tracking-wide">
          <span className="font-sans opacity-70">Política · Filosofia · Direito</span>
          <div className="flex items-center gap-4">
            {profile ? (
              <div className="flex items-center gap-3">
                <Link href={profile.role === 'admin' ? '/admin' : '/painel'} className="hover:opacity-70 transition-opacity flex items-center gap-1">
                  <User size={12} />
                  <span>{profile.full_name.split(' ')[0]}</span>
                </Link>
                <button onClick={handleSignOut} className="hover:opacity-70 transition-opacity flex items-center gap-1">
                  <LogOut size={12} />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hover:opacity-70 transition-opacity">Entrar</Link>
                <Link href="/cadastro" className="hover:opacity-70 transition-opacity">Cadastrar</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <Link href="/" className="inline-block">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink tracking-tight">
            Atlantis Sul
          </h1>
        </Link>
        <p className="font-sans text-xs text-ink-muted tracking-widest mt-1 uppercase">
          Política · Filosofia · Economia
        </p>
      </div>

      {/* Category nav */}
      <nav className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop */}
          <ul className="hidden md:flex items-center gap-0 overflow-x-auto">
            <li>
              <Link
                href="/"
                className="block px-4 py-3 text-xs font-semibold tracking-widest uppercase text-ink hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent"
              >
                Todos
              </Link>
            </li>
            {CATEGORIES.map(cat => (
              <li key={cat}>
                <Link
                  href={`/?categoria=${encodeURIComponent(cat)}`}
                  className="block px-4 py-3 text-xs font-semibold tracking-widest uppercase text-ink hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center justify-between py-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-ink-muted">Categorias</span>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
          {mobileOpen && (
            <ul className="md:hidden pb-2 border-t border-border mt-1">
              <li>
                <Link href="/" onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-xs font-semibold tracking-wider uppercase text-ink">Todos</Link>
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link href={`/?categoria=${encodeURIComponent(cat)}`} onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-xs font-semibold tracking-wider uppercase text-ink">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}
