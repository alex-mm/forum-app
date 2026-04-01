import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const CATEGORIES = ['技术', '生活', '问答', '公告', '闲聊']

type EditorTab = 'edit' | 'preview'

export default function NewPostPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [activeTab, setActiveTab] = useState<EditorTab>('edit')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空')
      return
    }
    setSubmitting(true)
    setError('')
    const { data, error: err } = await supabase
      .from('posts')
      .insert({ title: title.trim(), content: content.trim(), category, author_id: user!.id })
      .select()
      .single()
    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }
    navigate(`/post/${(data as any).id}`)
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>发布新帖子</h1>
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
                  <span style={{ color: '#9ca3af' }}>暂无内容，请先在编辑模式输入...</span>
                )}
              </div>
            )}
          </div>
          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? '发布中...' : '发布帖子'}
          </button>
        </form>
      </div>
    </div>
  )
}
