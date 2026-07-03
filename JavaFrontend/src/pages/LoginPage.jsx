import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

const demoAccounts = [
  { label: 'Admin', email: 'admin@goalstore.vn', password: 'admin123', note: 'Toàn quyền quản trị' },
  { label: 'Editor', email: 'editor@goalstore.vn', password: 'editor123', note: 'Biên tập tin tức' },
  { label: 'User', email: 'user@goalstore.vn', password: 'user123', note: 'Tài khoản mua hàng' },
]

function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect')
  const [form, setForm] = useState({ email: 'admin@goalstore.vn', password: 'admin123' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (user && !redirect) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : user.role === 'EDITOR' ? '/editor' : '/account'} replace />
  }

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await login(form.email, form.password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }

    const nextPath = redirect || (result.user.role === 'ADMIN' ? '/admin' : result.user.role === 'EDITOR' ? '/editor' : '/account')
    navigate(nextPath, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <Logo dark />
        <div>
          <span className="auth-kicker"><ShieldCheck size={16} /> Phân quyền GoalStore</span>
          <h1>Đăng nhập tài khoản</h1>
          <p>Admin quản lý toàn bộ hệ thống. Editor chỉ vào khu biên tập. User mua hàng ở trang người dùng.</p>
        </div>

        <form className="auth-form" onSubmit={submitLogin}>
          <label>Email<input name="email" type="email" value={form.email} onChange={updateForm} required /></label>
          <label>Mật khẩu<input name="password" type="password" value={form.password} onChange={updateForm} required /></label>
          {error && <p className="form-message error">{error}</p>}
          <button className="btn btn-red" disabled={submitting}>
            <LockKeyhole size={18} />
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="demo-account-grid">
          {demoAccounts.map((account) => (
            <button
              type="button"
              key={account.email}
              onClick={() => setForm({ email: account.email, password: account.password })}
            >
              <strong>{account.label}</strong>
              <span>{account.email}</span>
              <small>{account.note}</small>
            </button>
          ))}
        </div>

        <Link to="/" className="auth-home-link">Về trang cửa hàng</Link>
      </div>
    </div>
  )
}

export default LoginPage
