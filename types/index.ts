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
  cover_position: string
  author_id: string
  category: string
  subcategory: string | null
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

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  display_order: number
  created_at: string
  subcategories?: Category[]
}
