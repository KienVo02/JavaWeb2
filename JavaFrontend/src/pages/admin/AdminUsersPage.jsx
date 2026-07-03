import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import { userApi } from '../../services/goalStoreApi'
import { formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

const emptyUser = {
  fullName: '',
  email: '',
  password: '',
  role: 'USER',
  status: 'ACTIVE',
}

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(emptyUser)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    userApi.getAll()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err, 'Không tải được tài khoản.')))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    const payload = { ...form }
    if (editingId && !payload.password) {
      delete payload.password
    }

    try {
      if (editingId) {
        await userApi.update(editingId, payload)
      } else {
        await userApi.create(payload)
      }
      setForm(emptyUser)
      setEditingId(null)
      setMessage(editingId ? 'Đã cập nhật tài khoản.' : 'Đã thêm tài khoản.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được tài khoản.'))
    }
  }

  const editUser = (user) => {
    setEditingId(user.id)
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      role: user.role || 'USER',
      status: user.status || 'ACTIVE',
    })
    setMessage('')
    setError('')
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Chuyển tài khoản này vào thùng rác?')) return
    setMessage('')
    setError('')
    try {
      await userApi.remove(id)
      setMessage('Đã chuyển tài khoản vào thùng rác.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không chuyển được tài khoản vào thùng rác.'))
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyUser)
    setMessage('')
    setError('')
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div>
          <h1>Quản lý tài khoản</h1>
          <p>Phân quyền USER, EDITOR và ADMIN rõ ràng</p>
        </div>
      </div>
      <div className="admin-management-grid">
        <form className="admin-card admin-form" onSubmit={submitForm}>
          <h2>{editingId ? 'Sửa tài khoản' : 'Thêm tài khoản'}</h2>
          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}
          <input name="fullName" value={form.fullName} onChange={updateForm} placeholder="Họ và tên" required />
          <input name="email" type="email" value={form.email} onChange={updateForm} placeholder="Email" required />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={updateForm}
            placeholder={editingId ? 'Mật khẩu mới nếu muốn đổi' : 'Mật khẩu'}
            required={!editingId}
          />
          <div className="two-col">
            <select name="role" value={form.role} onChange={updateForm}>
              <option value="USER">User</option>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select name="status" value={form.status} onChange={updateForm}>
              <option value="ACTIVE">Active</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>
          <button className="admin-red-btn"><Plus size={18} /> {editingId ? 'Cập nhật' : 'Thêm tài khoản'}</button>
          {editingId && <button className="admin-secondary-btn" type="button" onClick={resetForm}>Hủy sửa</button>}
        </form>

        <div className="admin-card admin-table-wrap">
          {loading && <div className="loading-block compact">Đang tải tài khoản...</div>}
          {!loading && users.length === 0 && !error && <div className="empty-state"><strong>Chưa có tài khoản</strong></div>}
          {!loading && users.length > 0 && (
            <table className="admin-table">
              <thead><tr><th>Tài khoản</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.fullName}</strong><small>{user.email}</small></td>
                    <td><StatusBadge status={user.role} /></td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>{formatDateTime(user.createdAt)}</td>
                    <td className="table-actions">
                      <button type="button" onClick={() => editUser(user)}><Edit3 size={16} /></button>
                      <button type="button" onClick={() => deleteUser(user.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsersPage
