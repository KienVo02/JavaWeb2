import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { customerApi } from '../../services/goalStoreApi'
import { formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    customerApi.getAll()
      .then(setCustomers)
      .catch((err) => {
        setCustomers([])
        setError(getErrorMessage(err, 'Không tải được khách hàng.'))
      })
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  const deleteCustomer = async (id) => {
    if (!window.confirm('Chuyển khách hàng này vào thùng rác?')) return
    setMessage('')
    setError('')
    try {
      await customerApi.remove(id)
      setMessage('Đã chuyển khách hàng vào thùng rác.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không chuyển được khách hàng vào thùng rác.'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row"><div><h1>Quản lý khách hàng</h1><p>Thông tin khách hàng mua áo đấu</p></div></div>
      <div className="admin-card admin-table-wrap">
        {loading && <div className="loading-block compact">Đang tải khách hàng...</div>}
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
        {!loading && !error && customers.length === 0 && <div className="empty-state"><strong>Chưa có khách hàng</strong></div>}
        {!loading && !error && customers.length > 0 && (
        <table className="admin-table">
          <thead><tr><th>Khách hàng</th><th>Email</th><th>Số điện thoại</th><th>Địa chỉ</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td><strong>{customer.fullName}</strong></td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
                <td>{formatDateTime(customer.createdAt)}</td>
                <td className="table-actions"><button type="button" onClick={() => deleteCustomer(customer.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}

export default AdminCustomersPage
