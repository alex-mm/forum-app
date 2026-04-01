import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Post } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from('posts')
        .select(`*, author:profiles(id, username, avatar_url), comment_count:comments(count)`)
        .order('created_at', { ascending: false })
        .limit(30)
      setPosts((data as any[]) ?? [])
      setLoading(false)
    }
    fetchPosts()
  }, [])

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div>
      <div className="page-header">
        <h1>最新帖子</h1>
        <Link to="/new-post" className="btn-primary">+ 发帖</Link>
      </div>
      {posts.length === 0 && <div className="empty">暂无帖子，来发第一帖吧！</div>}
      {posts.map((post) => (
        <Link to={`/post/${post.id}`} key={post.id} className="card post-item">
          <div className="post-category">{post.category}</div>
          <div className="post-title">{post.title}</div>
          <div className="post-meta">
            <span>👤 {(post.author as any)?.username ?? '匿名'}</span>
            <span>💬 {(post as any).comment_count?.[0]?.count ?? 0} 评论</span>
            <span>👁 {post.view_count} 浏览</span>
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
