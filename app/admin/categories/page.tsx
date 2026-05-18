'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Category } from '@/types'
import { Plus, Trash2, GripVertical, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import slugify from 'slugify'

export default function CategoriesPage() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [newParentId, setNewParentId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('display_order')
    if (!data) return
    const topLevel = data.filter((c: Category) => !c.parent_id).map((c: Category) => ({
      ...c,
      subcategories: data.filter((s: Category) => s.parent_id === c.id),
    }))
    setCategories(topLevel)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError('')

    const slug = slugify(newName, { lower: true, strict: true, locale: 'pt' }) + '-' + Date.now()
    const allCats = categories.flatMap(c => [c, ...(c.subcategories ?? [])])
    const maxOrder = allCats.filter(c => (newParentId ? c.parent_id === newParentId : !c.parent_id)).length

    const { error: err } = await supabase.from('categories').insert({
      name: newName.trim(),
      slug,
      parent_id: newParentId || null,
      display_order: maxOrder + 1,
    })

    if (err) { setError(err.message); setSaving(false); return }
    setNewName('')
    setNewParentId('')
    await load()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta categoria? As subcategorias também serão removidas.')) return
    await supabase.from('categories').delete().eq('id', id)
    await load()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="text-xs text-ink-muted hover:text-accent transition-colors">← Painel Admin</Link>
      </div>

      <div className="mb-8 pb-6 border-b border-border">
        <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-1">Configuração</p>
        <h1 className="font-serif text-3xl font-bold text-ink">Categorias</h1>
        <p className="text-sm text-ink-muted mt-1">Gerencie as categorias e subcategorias do site.</p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-white border border-border p-5 mb-8">
        <h2 className="text-sm font-semibold text-ink mb-4">Adicionar categoria ou subcategoria</h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1">Nome</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
              className="w-full border border-border bg-paper-warm px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink"
              placeholder="Ex: História do Brasil"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold tracking-wide uppercase text-ink-muted mb-1">
              É subcategoria de
            </label>
            <select
              value={newParentId}
              onChange={e => setNewParentId(e.target.value)}
              className="w-full border border-border bg-paper-warm px-3 py-2 text-sm text-ink focus:outline-none focus:border-ink"
            >
              <option value="">— categoria raiz —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 flex items-center gap-2 bg-ink text-paper px-5 py-2 text-xs font-semibold tracking-wide uppercase hover:bg-ink-light transition-colors disabled:opacity-50"
        >
          <Plus size={13} />
          {saving ? 'Salvando...' : 'Adicionar'}
        </button>
      </form>

      {/* Category tree */}
      {loading ? (
        <p className="text-ink-muted text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="border border-border bg-white">
              {/* Top-level category */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-ink-muted" />
                  <span className="font-semibold text-sm text-ink">{cat.name}</span>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <span className="text-xs text-ink-muted">({cat.subcategories.length} subcategorias)</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-ink-muted hover:text-red-600 transition-colors p-1"
                  title="Deletar categoria"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Subcategories */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="border-t border-border">
                  {cat.subcategories.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between px-4 py-2.5 bg-paper-warm border-b border-border last:border-0">
                      <div className="flex items-center gap-2 pl-4">
                        <ChevronRight size={12} className="text-ink-muted" />
                        <span className="text-sm text-ink-muted">{sub.name}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="text-ink-muted hover:text-red-600 transition-colors p-1"
                        title="Deletar subcategoria"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-center text-ink-muted text-sm py-8 border border-dashed border-border">
              Nenhuma categoria cadastrada ainda.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
