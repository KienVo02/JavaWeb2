import { LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleLabels = {
  ADMIN: 'Admin - toàn quyền quản trị',
  EDITOR: 'Editor - biên tập nội dung',
  USER: 'User - tài khoản mua hàng',
}

function AccountPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return <Navigate to="/login?redirect=/account" replace />
  }

  const signOut = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="container account-page">
      <div className="account-card">
        <div className="account-avatar"><UserRound size={42} /></div>
        <div>
          <span className="auth-kicker"><ShieldCheck size={16} /> {roleLabels[user.role] || user.role}</span>
          <h1>{user.fullName}</h1>
          <p>{user.email}</p>
        </div>
        <div className="account-actions">
          {user.role === 'ADMIN' && <Link className="btn btn-red" to="/admin">Vào trang admin</Link>}
          {user.role === 'EDITOR' && <Link className="btn btn-red" to="/editor">Vào khu editor</Link>}
          <Link className="btn admin-secondary-btn" to="/products">Tiếp tục mua hàng</Link>
          <button className="btn btn-ghost-dark" type="button" onClick={signOut}><LogOut size={18} /> Đăng xuất</button>
        </div>
      </div>
    </div>
  )
}

export default AccountPage
