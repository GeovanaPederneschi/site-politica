# Guia de Deploy — Revista Política & Filosofia

## 1. Configurar o Supabase

### 1.1 Criar projeto
1. Acesse https://supabase.com e crie uma conta (gratuita)
2. Clique em **New Project** e escolha um nome (ex: `revista-politica`)
3. Escolha uma senha forte para o banco e selecione a região **South America (São Paulo)**
4. Aguarde o projeto inicializar (~2 minutos)

### 1.2 Executar o schema
1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie TODO o conteúdo de `supabase-schema.sql` e cole no editor
4. Clique em **Run** (ou Ctrl+Enter)
5. Verifique se não houve erros

### 1.3 Configurar Storage
O script já cria o bucket `covers`. Se der erro de permissão no storage:
1. Vá em **Storage** no menu lateral
2. Clique em **New bucket**
3. Nome: `covers`, marque **Public bucket**
4. Em **Policies**, adicione as políticas do arquivo SQL manualmente

### 1.4 Anotar as credenciais
1. Vá em **Settings > API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.5 Tornar-se admin
Após criar sua conta no site (pelo /cadastro), execute no SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'seu-email@aqui.com'
);
```

---

## 2. Configurar o repositório GitHub

```bash
cd site-politica
git init
git add .
git commit -m "feat: site editorial inicial"
```

Crie um repositório no GitHub (github.com/new) e siga as instruções para fazer push.

**Importante:** O arquivo `.env.local` **não** é enviado ao GitHub (está no `.gitignore`). Isso é correto — as variáveis ficam apenas no Vercel.

---

## 3. Deploy no Vercel (gratuito)

### 3.1 Conectar ao GitHub
1. Acesse https://vercel.com e faça login (pode usar sua conta GitHub)
2. Clique em **Add New > Project**
3. Selecione o repositório `revista-politica` (ou o nome que você deu)
4. Clique em **Import**

### 3.2 Configurar variáveis de ambiente
Na tela de configuração do projeto, antes de clicar em Deploy:
1. Expanda **Environment Variables**
2. Adicione:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |

3. Clique em **Deploy**

### 3.3 Configurar domínio (opcional)
- O Vercel gera automaticamente um domínio `*.vercel.app` gratuito
- Para domínio próprio: **Settings > Domains** e adicione o seu

---

## 4. Configurar autenticação no Supabase (pós-deploy)

Após o deploy, você precisa autorizar a URL do seu site no Supabase:

1. Vá em **Authentication > URL Configuration**
2. Em **Site URL**, coloque `https://seu-projeto.vercel.app`
3. Em **Redirect URLs**, adicione:
   - `https://seu-projeto.vercel.app/**`
   - `http://localhost:3000/**` (para desenvolvimento local)

---

## 5. Rodar localmente

```bash
# 1. Preencha o .env.local com suas credenciais reais
# 2. Instale as dependências (já instaladas)
npm install

# 3. Rode o servidor de desenvolvimento
npm run dev
# Acesse http://localhost:3000
```

---

## Estrutura de arquivos criados

```
site-politica/
├── app/
│   ├── layout.tsx              # Layout raiz com Navbar e Footer
│   ├── page.tsx                # Homepage com artigos em destaque
│   ├── globals.css             # Estilos globais, fontes, paleta editorial
│   ├── [slug]/
│   │   ├── page.tsx            # Página do artigo individual
│   │   └── ViewCounter.tsx     # Componente cliente que incrementa views
│   ├── login/page.tsx          # Login com email/senha
│   ├── cadastro/page.tsx       # Cadastro de novos autores
│   ├── painel/
│   │   ├── page.tsx            # Dashboard do autor (lista de artigos)
│   │   └── novo-artigo/page.tsx # Formulário com editor TipTap
│   └── admin/
│       ├── page.tsx            # Painel admin (aprovar/rejeitar/destacar)
│       └── AdminActions.tsx    # Botões de ação (componente cliente)
├── components/
│   ├── Navbar.tsx              # Barra de navegação com categorias
│   ├── Footer.tsx              # Rodapé
│   ├── ArticleCard.tsx         # Card de artigo (3 variantes)
│   └── ArticleEditor.tsx       # Editor TipTap com toolbar
├── lib/
│   ├── supabase.ts             # Cliente Supabase (browser)
│   └── supabase-server.ts      # Cliente Supabase (server components)
├── types/index.ts              # Tipos TypeScript
├── middleware.ts               # Proteção de rotas privadas
├── next.config.mjs             # Config imagens do Supabase Storage
├── supabase-schema.sql         # Schema completo do banco + RLS
└── .env.local                  # Variáveis de ambiente (NÃO commitar)
```
