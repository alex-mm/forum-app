import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = ['技术', '生活', '问答', '公告', '闲聊']

type EditorTab = 'edit' | 'preview'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [activeTab, setActiveTab] = useState<EditorTab>('edit')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('帖子不存在')
          setLoading(false)
          return
        }
        // 只有作者才能编辑
        if (data.author_id !== user?.id) {
          navigate(`/post/${id}`, { replace: true })
          return
        }
        setTitle(data.title)
        setContent(data.content)
        setCategory(data.category)
        setLoading(false)
      })
  }, [id, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空')
      return
    }
    setSubmitting(true)
    setError('')
    const { error: err } = await supabase
      .from('posts')
      .update({ title: title.trim(), content: content.trim(), category, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }
    navigate(`/post/${id}`)
  }

  if (loading) return <div className="loading">加载中...</div>

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>编辑帖子</h1>
      <div className="card">
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>分类</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>标题</label>
            <input
              type="text"
              placeholder="请输入帖子标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <div className="editor-header">
              <label>内容</label>
              <div className="editor-tabs">
                <button
                  type="button"
                  className={activeTab === 'edit' ? 'editor-tab active' : 'editor-tab'}
                  onClick={() => setActiveTab('edit')}
                >
                  ✏️ 编辑
                </button>
                <button
                  type="button"
                  className={activeTab === 'preview' ? 'editor-tab active' : 'editor-tab'}
                  onClick={() => setActiveTab('preview')}
                >
                  👁 预览
                </button>
              </div>
            </div>
            {activeTab === 'edit' ? (
              <textarea
                className="md-textarea"
                placeholder="支持 Markdown 语法：**粗体**、# 标题、`代码`、> 引用..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div className="md-preview">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <span style={{ color: '#9ca3af' }}>暂无内容...</span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="form-submit" disabled={submitting} style={{ flex: 1 }}>
              {submitting ? '保存中...' : '保存修改'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/post/${id}`)}
              style={{ padding: '0.7rem 1.5rem' }}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
