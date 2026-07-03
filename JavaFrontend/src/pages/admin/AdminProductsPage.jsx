import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ImageUploadField from '../../components/ImageUploadField'
import StatusBadge from '../../components/StatusBadge'
import { imageUrl } from '../../services/axiosClient'
import { categoryApi, productApi } from '../../services/goalStoreApi'
import { formatCurrency, parseSizeInput, sizesToInput } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

const emptyProduct = {
  name: '',
  price: 899000,
  salePrice: 899000,
  imageUrl: '',
  description: '',
  teamName: '',
  leagueName: '',
  season: '24/25',
  stockQuantity: 0,
  status: 'ACTIVE',
  categoryId: '',
  sizesText: 'S:10, M:20, L:20, XL:10, XXL:5',
}

function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    Promise.all([productApi.getAll(), categoryApi.getAll()])
      .then(([productData, categoryData]) => {
        setProducts(productData)
        setCategories(categoryData)
      })
      .catch((err) => setError(getErrorMessage(err, 'Không tải được dữ liệu sản phẩm.')))
      .finally(() => setLoading(false))
  }

  useEffect(loadData, [])

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const updateImage = (imageUrl) => {
    setForm((current) => ({ ...current, imageUrl }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    const payload = {
      ...form,
      price: Number(form.price),
      salePrice: Number(form.salePrice),
      stockQuantity: Number(form.stockQuantity),
      categoryId: Number(form.categoryId),
      sizes: parseSizeInput(form.sizesText),
    }
    delete payload.sizesText
    try {
      if (editingId) {
        await productApi.update(editingId, payload)
      } else {
        await productApi.create(payload)
      }
      setForm(emptyProduct)
      setEditingId(null)
      setMessage(editingId ? 'Đã cập nhật sản phẩm.' : 'Đã thêm sản phẩm.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được sản phẩm.'))
    }
  }

  const editProduct = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name || '',
      price: product.price || 0,
      salePrice: product.salePrice || product.price || 0,
      imageUrl: product.imageUrl || '',
      description: product.description || '',
      teamName: product.teamName || '',
      leagueName: product.leagueName || '',
      season: product.season || '24/25',
      stockQuantity: product.stockQuantity || 0,
      status: product.status || 'ACTIVE',
      categoryId: product.categoryId || '',
      sizesText: sizesToInput(product.sizes || []),
    })
    setMessage('')
    setError('')
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Chuyển sản phẩm này vào thùng rác?')) return
    setMessage('')
    setError('')
    try {
      await productApi.remove(id)
      setMessage('Đã chuyển sản phẩm vào thùng rác.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không chuyển được sản phẩm vào thùng rác.'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div><h1>Quản lý sản phẩm</h1><p>Thêm, sửa, xóa áo đấu GoalStore</p></div>
      </div>
      <div className="admin-management-grid">
        <form className="admin-card admin-form" onSubmit={submitForm}>
          <h2>{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}
          <input name="name" value={form.name} onChange={updateForm} placeholder="Tên sản phẩm" required />
          <div className="two-col">
            <input name="teamName" value={form.teamName} onChange={updateForm} placeholder="Đội bóng" />
            <input name="leagueName" value={form.leagueName} onChange={updateForm} placeholder="Giải đấu" />
          </div>
          <div className="two-col">
            <input name="price" type="number" value={form.price} onChange={updateForm} placeholder="Giá" />
            <input name="salePrice" type="number" value={form.salePrice} onChange={updateForm} placeholder="Giá bán" />
          </div>
          <div className="two-col">
            <input name="stockQuantity" type="number" value={form.stockQuantity} onChange={updateForm} placeholder="Kho" />
            <input name="season" value={form.season} onChange={updateForm} placeholder="Mùa giải" />
          </div>
          <select name="categoryId" value={form.categoryId} onChange={updateForm} required>
            <option value="">Chọn danh mục</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <ImageUploadField value={form.imageUrl} onChange={updateImage} label="Ảnh sản phẩm" />
          <input name="sizesText" value={form.sizesText} onChange={updateForm} placeholder="S:10, M:20" />
          <textarea name="description" value={form.description} onChange={updateForm} placeholder="Mô tả" />
          <button className="admin-red-btn"><Plus size={18} /> {editingId ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
        </form>

        <div className="admin-card admin-table-wrap">
          {loading && <div className="loading-block compact">Đang tải sản phẩm...</div>}
          {!loading && products.length === 0 && !error && <div className="empty-state"><strong>Chưa có sản phẩm</strong></div>}
          {!loading && products.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr><th>Sản phẩm</th><th>Danh mục</th><th>Kho</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><div className="table-product"><img src={imageUrl(product.imageUrl)} alt="" /><span>{product.name}<small>{product.teamName}</small></span></div></td>
                  <td>{product.categoryName}</td>
                  <td className={product.stockQuantity <= 20 ? 'danger-text' : ''}>{product.stockQuantity}</td>
                  <td>{formatCurrency(product.salePrice || product.price)}</td>
                  <td><StatusBadge status={product.stockQuantity <= 20 ? 'Sắp hết' : 'Đang bán'} /></td>
                  <td className="table-actions">
                    <button type="button" onClick={() => editProduct(product)}><Edit3 size={16} /></button>
                    <button type="button" onClick={() => deleteProduct(product.id)}><Trash2 size={16} /></button>
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

export default AdminProductsPage
