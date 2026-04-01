import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Post, Comment } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { session, user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchData() {
      const [{ data: postData }, { data: commentsData }] = await Promise.all([
        supabase.from('posts').select(`*, author:profiles(id, username, avatar_url)`).eq('id', id).single(),
        supabase.from('comments').select(`*, author:profiles(id, username, avatar_url)`).eq('post_id', id).order('created_at'),
      ])
      setPost(postData as any)
      setComments((commentsData as any[]) ?? [])
      setLoading(false)
      await supabase.from('posts').update({ view_count: (postData as any)?.view_count + 1 }).eq('id', id)
    }
    fetchData()
  }, [id])

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !session) return
    setSubmitting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: id, author_id: user!.id, content: commentText.trim() })
      .select(`*, author:profiles(id, username, avatar_url)`)
      .single()
    if (!error && data) {
      setComments((prev) => [...prev, data as any])
      setCommentText('')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="loading">加载中...</div>
  if (!post) return <div className="empty">帖子不存在</div>

  return (
    <div>
      <div className="card">
        <div className="post-category">{post.category}</div>
        <h1 className="post-detail-title">{post.title}</h1>
        <div className="post-meta">
          <span>👤 {(post.author as any)?.username ?? '匿名'}</span>
          <span>👁 {post.view_count} 浏览</span>
          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: zhCN })}</span>
        </div>
        <div className="md-preview" style={{ marginTop: '1.5rem' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>

      <hr className="divider" />
      <h3 style={{ marginBottom: '1rem' }}>💬 {comments.length} 条评论</h3>

      {comments.map((comment) => (
        <div key={comment.id} className="comment-item">
          <div className="comment-author">{(comment.author as any)?.username ?? '匿名'}</div>
          <div className="comment-text">{comment.content}</div>
          <div className="post-meta" style={{ marginTop: '0.3rem' }}>
            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: zhCN })}</span>
          </div>
        </div>
      ))}

      {session ? (
        <form onSubmit={handleSubmitComment} style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <textarea
              placeholder="写下你的评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '7px', minHeight: '100px', fontFamily: 'inherit', fontSize: '0.95rem' }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? '提交中...' : '发表评论'}
          </button>
        </form>
      ) : (
        <div className="empty" style={{ marginTop: '1rem' }}>
          <a href="/login">登录</a> 后才能发表评论
        </div>
      )}
    </div>
  )
}
