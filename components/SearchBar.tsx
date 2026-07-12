'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { mapSearchRow, SearchArticleRow, MIN_SEARCH_LENGTH } from '@/lib/search'
import { ArticleWithAuthor } from '@/types'

export default function SearchBar() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const requestIdRef = useRef(0)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ArticleWithAuthor[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = query.trim()
    if (trimmed.length < MIN_SEARCH_LENGTH) {
      setResults([])
      setLoading(false)
      setSearched(false)
      return
    }

    setLoading(true)
    const currentRequestId = ++requestIdRef.current

    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('search_articles', {
        search_query: trimmed,
        result_limit: 6,
      })

      if (currentRequestId !== requestIdRef.current) return

      if (error) {
        console.error('[SearchBar] erro na busca:', error)
        setResults([])
      } else {
        setResults(((data as SearchArticleRow[]) ?? []).map(mapSearchRow))
      }
      setLoading(false)
      setSearched(true)
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  function goToResultsPage() {
    const trimmed = query.trim()
    if (trimmed.length < MIN_SEARCH_LENGTH) return
    setOpen(false)
    router.push(`/busca?q=${encodeURIComponent(trimmed)}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    goToResultsPage()
  }

  return (
    <div ref={containerRef} className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Buscar"
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <Search size={13} />
          <span>Buscar</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-1">
          <Search size={13} className="flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar artigos..."
            className="bg-transparent border-b border-paper-warm/40 focus:border-paper-warm outline-none text-xs w-32 sm:w-48 py-0.5 placeholder:text-paper-warm/50"
          />
          <button
            type="button"
            onClick={() => { setOpen(false); setQuery('') }}
            aria-label="Fechar busca"
            className="hover:opacity-70 transition-opacity flex-shrink-0"
          >
            <X size={13} />
          </button>
        </form>
      )}

      {open && query.trim().length >= MIN_SEARCH_LENGTH && (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-[90vw] bg-white border border-border shadow-lg z-50 text-ink">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-ink-muted text-xs">
              <Loader2 size={14} className="animate-spin" />
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="max-h-96 overflow-y-auto">
                {results.map(article => (
                  <li key={article.id} className="border-b border-border last:border-0">
                    <Link
                      href={`/${article.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 p-3 hover:bg-paper-warm transition-colors"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 bg-paper-warm">
                        {article.cover_image_url ? (
                          <Image
                            src={article.cover_image_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-serif text-xs text-ink-muted opacity-30">AS</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-accent block">
                          {article.category}
                        </span>
                        <p className="font-serif text-sm font-bold text-ink leading-snug line-clamp-2">
                          {article.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                onClick={goToResultsPage}
                className="block w-full text-center py-2.5 text-xs font-semibold tracking-widest uppercase text-accent hover:bg-paper-warm transition-colors border-t border-border"
              >
                Ver todos os resultados
              </button>
            </>
          ) : searched ? (
            <div className="py-8 text-center text-xs text-ink-muted px-4">
              Nenhum artigo encontrado para &quot;{query.trim()}&quot;.
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
