import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import { orderApi } from '../../services/goalStoreApi'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

const statuses = ['Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy']

function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    orderApi.getAll()
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err, 'Không tải được đơn hàng.')))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  const updateStatus = async (id, status) => {
    setMessage('')
    setError('')
    try {
      await orderApi.updateStatus(id, status)
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không cập nhật được trạng thái đơn hàng.'))
    }
  }

  const deleteOrder = async (id) => {
    if (!window.confirm('Chuyển đơn hàng này vào thùng rác?')) return
    setMessage('')
    try {
      await orderApi.remove(id)
      setMessage('Đã chuyển đơn hàng vào thùng rác.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không chuyển được đơn hàng vào thùng rác.'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row"><div><h1>Quản lý đơn hàng</h1><p>Theo dõi và cập nhật trạng thái đơn</p></div></div>
      <div className="admin-card admin-table-wrap">
        {loading && <div className="loading-block compact">Đang tải đơn hàng...</div>}
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
        {!loading && !error && orders.length === 0 && <div className="empty-state"><strong>Chưa có đơn hàng</strong></div>}
        {!loading && !error && orders.length > 0 && (
        <table className="admin-table">
          <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.orderCode}</td>
                <td><strong>{order.customerName}</strong><small>{order.customerPhone}</small></td>
                <td>{formatDateTime(order.orderDate)}</td>
                <td>{formatCurrency(order.totalAmount)}</td>
                <td>
                  <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                    {statuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                  <StatusBadge status={order.status} />
                </td>
                <td className="table-actions"><button type="button" onClick={() => deleteOrder(order.id)}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  )
}

export default AdminOrdersPage
