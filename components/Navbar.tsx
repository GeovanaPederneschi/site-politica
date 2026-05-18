'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile, Category } from '@/types'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
    }

    async function loadCategories() {
      const { data: all } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')

      if (!all) return
      const topLevel = all.filter(c => !c.parent_id)
      const withSubs = topLevel.map(c => ({
        ...c,
        subcategories: all.filter(s => s.parent_id === c.id),
      }))
      setCategories(withSubs)
    }

    loadProfile()
    loadCategories()

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
          <span className="font-sans opacity-70">Política · Filosofia · Economia</span>
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
      <nav className="border-t border-border" onMouseLeave={() => setOpenDropdown(null)}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop */}
          <ul className="hidden md:flex items-center overflow-x-auto">
            <li>
              <Link href="/" className="block px-4 py-3 text-xs font-semibold tracking-widest uppercase text-ink hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent">
                Todos
              </Link>
            </li>
            {categories.map(cat => (
              <li key={cat.id} className="relative">
                {cat.subcategories && cat.subcategories.length > 0 ? (
                  <>
                    <button
                      onMouseEnter={() => setOpenDropdown(cat.id)}
                      className="flex items-center gap-1 px-4 py-3 text-xs font-semibold tracking-widest uppercase text-ink hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent"
                    >
                      {cat.name}
                      <ChevronDown size={11} />
                    </button>
                    {openDropdown === cat.id && (
                      <div className="absolute top-full left-0 bg-white border border-border shadow-md z-50 min-w-[180px]">
                        <Link
                          href={`/?categoria=${encodeURIComponent(cat.name)}`}
                          className="block px-4 py-2 text-xs font-semibold text-ink hover:bg-paper-warm hover:text-accent transition-colors border-b border-border"
                        >
                          Todos em {cat.name}
                        </Link>
                        {cat.subcategories.map(sub => (
                          <Link
                            key={sub.id}
                            href={`/?categoria=${encodeURIComponent(cat.name)}&subcategoria=${encodeURIComponent(sub.name)}`}
                            className="block px-4 py-2 text-xs text-ink-muted hover:bg-paper-warm hover:text-accent transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/?categoria=${encodeURIComponent(cat.name)}`}
                    className="block px-4 py-3 text-xs font-semibold tracking-widest uppercase text-ink hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent"
                  >
                    {cat.name}
                  </Link>
                )}
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
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/?categoria=${encodeURIComponent(cat.name)}`} onClick={() => setMobileOpen(false)} className="block px-2 py-2 text-xs font-semibold tracking-wider uppercase text-ink">
                    {cat.name}
                  </Link>
                  {cat.subcategories?.map(sub => (
                    <Link key={sub.id} href={`/?categoria=${encodeURIComponent(cat.name)}&subcategoria=${encodeURIComponent(sub.name)}`} onClick={() => setMobileOpen(false)} className="block px-4 py-1.5 text-xs text-ink-muted">
                      — {sub.name}
                    </Link>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}
