import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Post } from '../types'

export default function ProfilePage() {
  const { user, session } = useAuth()
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    supabase
      .from('posts')
      .select('*')
      .eq('author_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMyPosts((data as Post[]) ?? [])
        setLoading(false)
      })
  }, [session])

  const avatarLetter = user?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <div>
      <div className="card profile-header">
        <div className="avatar">{avatarLetter}</div>
        <div className="profile-info">
          <h2>{user?.username ?? '用户'}</h2>
          <p>{user?.email}</p>
          <p style={{ marginTop: '0.25rem', color: '#9ca3af', fontSize: '0.82rem' }}>
            注册于 {user?.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
          </p>
        </div>
      </div>

      <h3 style={{ margin: '1.5rem 0 1rem', fontSize: '1.1rem', fontWeight: 700 }}>我的帖子</h3>
      {loading && <div className="loading">加载中...</div>}
      {!loading && myPosts.length === 0 && <div className="empty">还没有发过帖子</div>}
      {myPosts.map((post) => (
        <Link to={`/post/${post.id}`} key={post.id} className="card post-item">
          <div className="post-category">{post.category}</div>
          <div className="post-title">{post.title}</div>
          <div className="post-meta">
            <span>👁 {post.view_count} 浏览</span>
            <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
