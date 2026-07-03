import { Download, FileSpreadsheet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { dashboardApi } from '../../services/goalStoreApi'
import { formatCurrency } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

function AdminReportsPage() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardApi.statistics().then(setStats).catch((err) => setError(getErrorMessage(err, 'Không tải được báo cáo.')))
  }, [])

  const exportReport = () => {
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
    link.download = 'goalstore-report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div>
          <h1>Báo cáo</h1>
          <p>Tổng hợp nhanh tình hình kinh doanh GoalStore</p>
        </div>
        <button className="admin-red-btn" type="button" onClick={exportReport} disabled={!stats}>
          <Download size={18} />
          Xuất CSV
        </button>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {!stats && !error && <div className="loading-block compact">Đang tải báo cáo...</div>}
      {stats && (
        <>
          <section className="admin-stat-grid">
            <ReportCard label="Sản phẩm" value={stats.totalProducts} />
            <ReportCard label="Đơn hôm nay" value={stats.todayOrders} />
            <ReportCard label="Doanh thu hôm nay" value={formatCurrency(stats.todayRevenue)} />
            <ReportCard label="Khách mới" value={stats.newCustomers} />
            <ReportCard label="Sắp hết hàng" value={stats.lowStockProducts} />
          </section>

          <div className="admin-card">
            <div className="admin-card-head">
              <h2>Trạng thái đơn hàng</h2>
            </div>
            <div className="status-list report-status-list">
              {(stats.orderStatusStats || []).map((item) => (
                <div key={item.status}>
                  <span>{item.status}</span>
                  <strong>{item.total} đơn ({item.percent}%)</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ReportCard({ label, value }) {
  return (
    <div className="admin-stat-card">
      <div><span>{label}</span><strong>{value}</strong><small>Cập nhật theo dữ liệu hiện tại</small></div>
      <div className="stat-icon blue"><FileSpreadsheet size={28} /></div>
    </div>
  )
}

export default AdminReportsPage
