import { ArticleWithAuthor } from '@/types'

export interface SearchArticleRow {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  cover_position: string
  author_id: string
  category: string
  subcategory: string | null
  tags: string[]
  status: string
  featured: boolean
  views: number
  published_at: string | null
  created_at: string
  rank: number
  author_full_name: string
  author_bio: string | null
  author_avatar_url: string | null
  author_role: string
  author_created_at: string
}

export function mapSearchRow(row: SearchArticleRow): ArticleWithAuthor {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    cover_image_url: row.cover_image_url,
    cover_position: row.cover_position,
    author_id: row.author_id,
    category: row.category,
    subcategory: row.subcategory,
    tags: row.tags,
    status: row.status as ArticleWithAuthor['status'],
    featured: row.featured,
    views: row.views,
    published_at: row.published_at,
    created_at: row.created_at,
    profiles: {
      id: row.author_id,
      full_name: row.author_full_name,
      bio: row.author_bio,
      avatar_url: row.author_avatar_url,
      role: row.author_role as ArticleWithAuthor['profiles']['role'],
      created_at: row.author_created_at,
    },
  }
}

export const MIN_SEARCH_LENGTH = 2
