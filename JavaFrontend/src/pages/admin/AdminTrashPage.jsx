import { RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import { trashApi } from '../../services/goalStoreApi'
import { formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'products', label: 'Sản phẩm' },
  { key: 'categories', label: 'Danh mục' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'customers', label: 'Khách hàng' },
  { key: 'posts', label: 'Tin tức' },
  { key: 'users', label: 'Tài khoản' },
]

function AdminTrashPage() {
  const [items, setItems] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    trashApi.getAll()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err, 'Không tải được thùng rác.')))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  const counts = useMemo(() => {
    const nextCounts = { all: items.length }
    items.forEach((item) => {
      nextCounts[item.type] = (nextCounts[item.type] || 0) + 1
    })
    return nextCounts
  }, [items])

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items
    return items.filter((item) => item.type === activeFilter)
  }, [activeFilter, items])

  const restoreItem = async (item) => {
    setMessage('')
    setError('')
    try {
      await trashApi.restore(item.type, item.id)
      setMessage(`Đã khôi phục ${item.typeLabel.toLowerCase()}.`)
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không khôi phục được mục này.'))
    }
  }

  const removePermanent = async (item) => {
    if (!window.confirm(`Xóa vĩnh viễn ${item.name}? Thao tác này không thể khôi phục.`)) return
    setMessage('')
    setError('')
    try {
      await trashApi.removePermanent(item.type, item.id)
      setMessage(`Đã xóa vĩnh viễn ${item.typeLabel.toLowerCase()}.`)
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không xóa vĩnh viễn được mục này.'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div>
          <h1>Thùng rác</h1>
          <p>Khôi phục hoặc xóa vĩnh viễn những mục đã xóa tạm</p>
        </div>
      </div>

      <div className="admin-card trash-toolbar">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`trash-filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            <span>{filter.label}</span>
            <strong>{counts[filter.key] || 0}</strong>
          </button>
        ))}
      </div>

      <div className="admin-card admin-table-wrap">
        {message && <p className="form-message success">{message}</p>}
        {error && <p className="form-message error">{error}</p>}
        {loading && <div className="loading-block compact">Đang tải thùng rác...</div>}
        {!loading && filteredItems.length === 0 && !error && (
          <div className="empty-state trash-empty">
            <Trash2 size={34} />
            <strong>Thùng rác trống</strong>
            <p>Những mục bị xóa tạm sẽ xuất hiện ở đây.</p>
          </div>
        )}
        {!loading && filteredItems.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Tên mục</th>
                <th>Thông tin</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={`${item.type}-${item.id}`}>
                  <td><StatusBadge status={item.typeLabel} /></td>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.detail || 'Không có thông tin thêm'}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td className="table-actions">
                    <button type="button" title="Khôi phục" onClick={() => restoreItem(item)}><RotateCcw size={16} /></button>
                    <button type="button" className="danger-action" title="Xóa vĩnh viễn" onClick={() => removePermanent(item)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminTrashPage
