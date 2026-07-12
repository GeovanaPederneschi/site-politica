-- ============================================================
-- BUSCA FULL-TEXT — Atlantis Sul
-- Execute no Supabase SQL Editor (https://app.supabase.com)
-- Este script é aditivo: não mexe no schema existente, só adiciona
-- o necessário para a busca. Pode ser rodado com segurança mesmo
-- com artigos já cadastrados (faz backfill automático no final).
-- ============================================================

-- 1. Extensão para ignorar acentos na busca ("eleicao" encontra "eleição")
create extension if not exists unaccent;

-- 2. Configuração de busca em português + unaccent
do $$
begin
  if not exists (select 1 from pg_catalog.pg_ts_config where cfgname = 'portuguese_unaccent') then
    create text search configuration public.portuguese_unaccent (copy = pg_catalog.portuguese);
    alter text search configuration public.portuguese_unaccent
      alter mapping for hword, hword_part, word
      with unaccent, portuguese_stem;
  end if;
end $$;

-- 3. Coluna com o vetor de busca (título pesa mais que corpo do texto)
alter table public.articles add column if not exists search_vector tsvector;

-- 4. Trigger que mantém a coluna sempre atualizada
create or replace function public.articles_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(new.title, ''))), 'A') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(new.excerpt, ''))), 'B') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(array_to_string(new.tags, ' '), ''))), 'B') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(new.category, '') || ' ' || coalesce(new.subcategory, ''))), 'C') ||
    setweight(to_tsvector('portuguese_unaccent', unaccent(regexp_replace(coalesce(new.content, ''), '<[^>]+>', ' ', 'g'))), 'D');
  return new;
end;
$$;

drop trigger if exists articles_search_vector_trigger on public.articles;
create trigger articles_search_vector_trigger
  before insert or update on public.articles
  for each row execute procedure public.articles_search_vector_update();

-- 5. Índice GIN — é o que torna a busca instantânea mesmo com muitos artigos
create index if not exists articles_search_vector_idx on public.articles using gin(search_vector);

-- 6. Preenche o vetor para artigos já cadastrados
update public.articles set search_vector =
  setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(title, ''))), 'A') ||
  setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(excerpt, ''))), 'B') ||
  setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(array_to_string(tags, ' '), ''))), 'B') ||
  setweight(to_tsvector('portuguese_unaccent', unaccent(coalesce(category, '') || ' ' || coalesce(subcategory, ''))), 'C') ||
  setweight(to_tsvector('portuguese_unaccent', unaccent(regexp_replace(coalesce(content, ''), '<[^>]+>', ' ', 'g'))), 'D')
where search_vector is null;

-- ============================================================
-- 7. Query helper — converte o texto digitado em tsquery com
-- prefixo (permite achar "econ" -> "economia" enquanto digita)
-- ============================================================
create or replace function public.build_search_tsquery(search_text text)
returns tsquery
language sql
stable
as $$
  select to_tsquery(
    'portuguese_unaccent',
    coalesce(
      string_agg(
        regexp_replace(unaccent(lower(word)), '[^a-z0-9]', '', 'g') || ':*',
        ' & '
      ) filter (where length(regexp_replace(unaccent(lower(word)), '[^a-z0-9]', '', 'g')) > 0),
      ''
    )
  )
  from unnest(regexp_split_to_array(trim(coalesce(search_text, '')), '\s+')) as word
$$;

-- ============================================================
-- 8. RPC de busca — usada pelo site (navbar + página de resultados)
-- Só retorna artigos publicados, ordenados por relevância.
-- ============================================================
create or replace function public.search_articles(
  search_query text,
  result_limit int default 20,
  result_offset int default 0
)
returns table (
  id uuid,
  title text,
  slug text,
  content text,
  excerpt text,
  cover_image_url text,
  cover_position text,
  author_id uuid,
  category text,
  subcategory text,
  tags text[],
  status text,
  featured boolean,
  views integer,
  published_at timestamptz,
  created_at timestamptz,
  rank real,
  author_full_name text,
  author_bio text,
  author_avatar_url text,
  author_role text,
  author_created_at timestamptz
)
language sql
stable
as $$
  select
    a.id, a.title, a.slug, a.content, a.excerpt, a.cover_image_url, a.cover_position,
    a.author_id, a.category, a.subcategory, a.tags, a.status, a.featured, a.views,
    a.published_at, a.created_at,
    ts_rank(a.search_vector, public.build_search_tsquery(search_query)) as rank,
    p.full_name, p.bio, p.avatar_url, p.role, p.created_at
  from public.articles a
  join public.profiles p on p.id = a.author_id
  where a.status = 'published'
    and a.search_vector @@ public.build_search_tsquery(search_query)
  order by rank desc, a.published_at desc
  limit result_limit offset result_offset
$$;

grant execute on function public.build_search_tsquery(text) to anon, authenticated;
grant execute on function public.search_articles(text, int, int) to anon, authenticated;
