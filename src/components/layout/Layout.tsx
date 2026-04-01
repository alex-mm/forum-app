import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Layout() {
  const { user, session, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">💬 Forum</Link>
          <nav className="nav">
            <Link to="/">首页</Link>
            {session ? (
              <>
                <Link to="/new-post">发帖</Link>
                <Link to="/profile">{user?.username ?? '我的'}</Link>
                <button onClick={handleSignOut} className="btn-link">退出</button>
              </>
            ) : (
              <>
                <Link to="/login">登录</Link>
                <Link to="/register" className="btn-primary">注册</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>© 2024 Forum. Powered by Supabase + Cloudflare</p>
      </footer>
    </div>
  )
}
