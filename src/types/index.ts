export interface User {
  id: string
  email: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  category: string
  view_count: number
  created_at: string
  updated_at: string
  author?: User
  comment_count?: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: User
}

export interface Category {
  id: string
  name: string
  description: string
  post_count?: number
}
