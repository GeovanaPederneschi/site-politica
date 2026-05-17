-- ============================================================
-- SCHEMA COMPLETO — Revista Política & Filosofia
-- Execute no Supabase SQL Editor (https://app.supabase.com)
-- ============================================================

-- 1. TABELA DE PERFIS
-- Estende auth.users com dados do autor
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  bio         text,
  avatar_url  text,
  role        text not null default 'author' check (role in ('author', 'admin')),
  created_at  timestamptz not null default now()
);

-- 2. TABELA DE ARTIGOS
create table if not exists public.articles (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  content          text not null default '',
  excerpt          text,
  cover_image_url  text,
  author_id        uuid not null references public.profiles(id) on delete cascade,
  category         text not null,
  tags             text[] not null default '{}',
  status           text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  featured         boolean not null default false,
  views            integer not null default 0,
  published_at     timestamptz,
  created_at       timestamptz not null default now()
);

-- Index para buscas comuns
create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_slug_idx on public.articles(slug);
create index if not exists articles_author_idx on public.articles(author_id);
create index if not exists articles_published_at_idx on public.articles(published_at desc);

-- ============================================================
-- 3. FUNÇÃO PARA INCREMENTAR VIEWS (chamada via RPC)
-- ============================================================
create or replace function public.increment_views(article_slug text)
returns void
language sql
security definer
as $$
  update public.articles
  set views = views + 1
  where slug = article_slug
    and status = 'published';
$$;

-- ============================================================
-- 4. TRIGGER: cria perfil automaticamente após signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Novo usuário'),
    'author'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.articles enable row level security;

-- PROFILES: cada um lê apenas o próprio perfil; admin lê todos
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ARTICLES: leitura pública para publicados
create policy "articles_public_read" on public.articles
  for select using (status = 'published');

-- Autor lê os próprios artigos (qualquer status)
create policy "articles_author_read_own" on public.articles
  for select using (auth.uid() = author_id);

-- Admin lê tudo
create policy "articles_admin_read_all" on public.articles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Autor cria artigo com status pending
create policy "articles_author_insert" on public.articles
  for insert with check (
    auth.uid() = author_id
    and status = 'pending'
  );

-- Autor pode atualizar apenas o próprio artigo pendente (para edição futura)
create policy "articles_author_update_own_pending" on public.articles
  for update using (
    auth.uid() = author_id
    and status = 'pending'
  );

-- Admin pode atualizar qualquer artigo
create policy "articles_admin_update_all" on public.articles
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- 6. STORAGE — bucket para capas
-- ============================================================
-- Execute no Supabase Dashboard > Storage > New bucket
-- Bucket name: covers
-- Public bucket: SIM (para URLs públicas das imagens)

-- Política de storage: autenticados fazem upload; todos leem
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');

create policy "covers_auth_upload" on storage.objects
  for insert with check (
    bucket_id = 'covers'
    and auth.role() = 'authenticated'
  );

create policy "covers_auth_delete_own" on storage.objects
  for delete using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 7. TORNAR UM USUÁRIO ADMIN (rode após criar sua conta)
-- Substitua 'seu-email@exemplo.com' pelo seu email real
-- ============================================================
-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id from auth.users where email = 'seu-email@exemplo.com'
-- );
