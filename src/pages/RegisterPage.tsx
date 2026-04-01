import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('密码至少需要 6 位')
      return
    }
    setLoading(true)
    setError('')
    try {
      await signUp(email, password, username)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    try {
      if (provider === 'google') await signInWithGoogle()
      else await signInWithGitHub()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>注册成功 🎉</h2>
          <div className="success-msg">
            验证邮件已发送到 <strong>{email}</strong>，请查收并点击链接完成验证后登录。
          </div>
          <div className="form-footer">
            <Link to="/login">前往登录</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>注册</h2>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-oauth" onClick={() => handleOAuth('google')}>
          <span>🔵</span> 使用 Google 注册
        </button>
        <button className="btn-oauth" onClick={() => handleOAuth('github')}>
          <span>⚫</span> 使用 GitHub 注册
        </button>
        <div className="or-divider">或</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input type="text" placeholder="请输入用户名" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>邮箱</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>密码（至少 6 位）</label>
            <input type="password" placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <div className="form-footer">
          已有账号？<Link to="/login">立即登录</Link>
        </div>
      </div>
    </div>
  )
}
