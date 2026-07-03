import {
  AlertTriangle,
  Download,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../../components/StatusBadge'
import { imageUrl } from '../../services/axiosClient'
import { dashboardApi } from '../../services/goalStoreApi'
import { formatCurrency, formatDateTime } from '../../utils/format'

function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    dashboardApi.statistics().then(setStats).catch(() => setStats(null))
  }, [])

  const orderStats = stats?.orderStatusStats || []
  const donutStyle = useMemo(() => {
    const colors = ['#22c55e', '#2f8cff', '#f5b914', '#8b5cf6']
    let current = 0
    const segments = orderStats.map((item, index) => {
      const next = current + Number(item.percent || 0)
      const segment = `${colors[index % colors.length]} ${current}% ${next}%`
      current = next
      return segment
    })
    return { background: `conic-gradient(${segments.join(', ') || '#1f2937 0 100%'})` }
  }, [orderStats])

  const exportDashboard = () => {
    const rows = [
      ['Chỉ số', 'Giá trị'],
      ['Tổng sản phẩm', stats?.totalProducts || 0],
      ['Đơn hàng hôm nay', stats?.todayOrders || 0],
      ['Doanh thu hôm nay', stats?.todayRevenue || 0],
      ['Khách hàng mới', stats?.newCustomers || 0],
      ['Sản phẩm sắp hết', stats?.lowStockProducts || 0],
    ]
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'goalstore-dashboard.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div>
          <h1>Quản trị GoalStore</h1>
          <p>Dashboard / Tổng quan</p>
        </div>
        <div className="admin-title-actions">
          <button className="admin-secondary-btn" type="button" onClick={exportDashboard} disabled={!stats}><Download size={18} /> Xuất dữ liệu</button>
          <button className="admin-red-btn" type="button" onClick={() => navigate('/admin/products')}><Plus size={18} /> Thêm sản phẩm</button>
        </div>
      </div>

      <section className="admin-stat-grid">
        <StatCard icon={Package} label="Tổng sản phẩm" value={stats?.totalProducts || 0} trend="+ 12.5%" />
        <StatCard icon={ShoppingCart} label="Đơn hàng hôm nay" value={stats?.todayOrders || 0} trend="+ 18.7%" blue />
        <StatCard icon={WalletCards} label="Doanh thu hôm nay" value={formatCurrency(stats?.todayRevenue || 0)} trend="+ 21.3%" green />
        <StatCard icon={UsersRound} label="Khách hàng mới" value={stats?.newCustomers || 0} trend="+ 14.1%" purple />
        <StatCard icon={AlertTriangle} label="Sản phẩm sắp hết" value={stats?.lowStockProducts || 0} trend="- 8.2%" warning />
      </section>

      <section className="admin-dashboard-grid">
        <div className="admin-card revenue-card">
          <div className="admin-card-head">
            <div>
              <h2>Doanh thu</h2>
              <strong>{formatCurrency(894250000)}</strong>
              <span>+ 16.8% so với 7 ngày trước</span>
            </div>
            <select defaultValue="7"> <option value="7">7 ngày qua</option> </select>
          </div>
          <svg viewBox="0 0 720 240" className="revenue-chart" role="img" aria-label="Biểu đồ doanh thu">
            <defs>
              <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#e11d2e" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#e11d2e" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[40, 90, 140, 190].map((y) => <line key={y} x1="30" x2="700" y1={y} y2={y} />)}
            <path d="M35 188 L135 150 L235 112 L335 102 L435 72 L535 96 L665 70" />
            <path d="M35 188 L135 150 L235 112 L335 102 L435 72 L535 96 L665 70 L665 220 L35 220 Z" className="chart-fill" />
            {['12/05', '13/05', '14/05', '15/05', '16/05', '17/05', '18/05'].map((item, index) => (
              <text key={item} x={35 + index * 105} y="235">{item}</text>
            ))}
          </svg>
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Đơn hàng theo trạng thái</h2>
            <select defaultValue="30"><option value="30">30 ngày qua</option></select>
          </div>
          <div className="donut-layout">
            <div className="donut-chart" style={donutStyle}>
              <div><span>Tổng</span><strong>{stats?.recentOrders?.length || 0}</strong><span>đơn hàng</span></div>
            </div>
            <div className="status-list">
              {orderStats.map((item) => (
                <div key={item.status}>
                  <span>{item.status}</span>
                  <strong>{item.total} ({item.percent}%)</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="admin-lower-grid">
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Sản phẩm nổi bật</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Sản phẩm</th><th>Danh mục</th><th>Kho</th><th>Giá bán</th><th>Trạng thái</th></tr>
              </thead>
              <tbody>
                {(stats?.featuredProducts || []).slice(0, 5).map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td><div className="table-product"><img src={imageUrl(product.imageUrl)} alt="" /><span>{product.name}<small>Player Version</small></span></div></td>
                    <td>{product.categoryName}</td>
                    <td className={product.stockQuantity <= 20 ? 'danger-text' : ''}>{product.stockQuantity}</td>
                    <td>{formatCurrency(product.salePrice || product.price)}</td>
                    <td><StatusBadge status={product.stockQuantity <= 20 ? 'Sắp hết' : 'Đang bán'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Đơn hàng gần đây</h2>
          </div>
          <div className="recent-orders">
            {(stats?.recentOrders || []).map((order) => (
              <div key={order.id}>
                <div className="order-thumb"><ShoppingCart size={18} /></div>
                <span><strong>#{order.orderCode}</strong><small>{formatDateTime(order.orderDate)}</small></span>
                <b>{formatCurrency(order.totalAmount)}</b>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, trend, blue, green, purple, warning }) {
  return (
    <div className="admin-stat-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{trend}</small>
      </div>
      <div className={`stat-icon ${blue ? 'blue' : ''} ${green ? 'green' : ''} ${purple ? 'purple' : ''} ${warning ? 'warning' : ''}`}>
        <Icon size={28} />
      </div>
    </div>
  )
}

export default AdminDashboardPage
