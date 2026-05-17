export type UserRole = 'author' | 'admin'
export type ArticleStatus = 'pending' | 'published' | 'rejected'

export interface Profile {
  id: string
  full_name: string
  bio: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  author_id: string
  category: string
  tags: string[]
  status: ArticleStatus
  featured: boolean
  views: number
  published_at: string | null
  created_at: string
  profiles?: Profile
}

export interface ArticleWithAuthor extends Article {
  profiles: Profile
}

export const CATEGORIES = [
  'Política',
  'Filosofia',
  'Direito',
  'Internacional',
  'Economia',
  'Sociedade',
] as const

export type Category = (typeof CATEGORIES)[number]
