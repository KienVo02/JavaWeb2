import { AlertTriangle, PackageCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import { imageUrl } from '../../services/axiosClient'
import { productApi } from '../../services/goalStoreApi'
import { formatCurrency } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

function AdminInventoryPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    productApi.getAll()
      .then(setProducts)
      .catch((err) => setError(getErrorMessage(err, 'Không tải được tồn kho.')))
      .finally(() => setLoading(false))
  }, [])

  const lowStock = useMemo(() => products.filter((item) => Number(item.stockQuantity) <= 20), [products])
  const totalStock = useMemo(() => products.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0), [products])

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div>
          <h1>Kho hàng</h1>
          <p>Theo dõi tồn kho và sản phẩm sắp hết hàng</p>
        </div>
      </div>

      <section className="admin-stat-grid inventory-stat-grid">
        <div className="admin-stat-card">
          <div><span>Tổng tồn kho</span><strong>{totalStock}</strong><small>{products.length} mẫu áo</small></div>
          <div className="stat-icon green"><PackageCheck size={28} /></div>
        </div>
        <div className="admin-stat-card">
          <div><span>Sắp hết hàng</span><strong>{lowStock.length}</strong><small>Cần nhập bổ sung</small></div>
          <div className="stat-icon warning"><AlertTriangle size={28} /></div>
        </div>
      </section>

      <div className="admin-card admin-table-wrap">
        {loading && <div className="loading-block compact">Đang tải tồn kho...</div>}
        {error && <p className="form-message error">{error}</p>}
        {!loading && !error && (
          <table className="admin-table">
            <thead><tr><th>Sản phẩm</th><th>Giải đấu</th><th>Size</th><th>Kho</th><th>Giá bán</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><div className="table-product"><img src={imageUrl(product.imageUrl)} alt="" /><span>{product.name}<small>{product.teamName}</small></span></div></td>
                  <td>{product.leagueName}</td>
                  <td>{product.sizes?.map((size) => `${size.sizeName}:${size.stockQuantity}`).join(', ')}</td>
                  <td className={product.stockQuantity <= 20 ? 'danger-text' : ''}>{product.stockQuantity}</td>
                  <td>{formatCurrency(product.salePrice || product.price)}</td>
                  <td><StatusBadge status={product.stockQuantity <= 20 ? 'Sắp hết' : 'Đang bán'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminInventoryPage
