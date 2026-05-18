import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-ink text-paper mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-ink-light">
          <div>
            <h3 className="font-serif text-xl font-bold mb-3">Atlantis Sul</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Um espaço dedicado ao pensamento crítico, ao debate público qualificado e à produção intelectual independente.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Navegação</h4>
            <ul className="space-y-2">
              {['/', '/login', '/cadastro'].map((href, i) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-300 hover:text-paper transition-colors">
                    {['Início', 'Entrar', 'Criar conta'][i]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Publicar</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Acadêmicos, advogados e pesquisadores podem criar uma conta e submeter artigos para publicação.
            </p>
            <Link href="/cadastro" className="inline-block mt-3 text-xs font-semibold tracking-wider uppercase text-accent-muted hover:text-accent transition-colors">
              Quero colaborar →
            </Link>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} Atlantis Sul. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-600">Feito com Next.js & Supabase</p>
        </div>
      </div>
    </footer>
  )
}
