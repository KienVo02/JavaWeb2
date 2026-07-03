import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ImageUploadField from '../../components/ImageUploadField'
import { imageUrl } from '../../services/axiosClient'
import { categoryApi } from '../../services/goalStoreApi'
import { getErrorMessage } from '../../utils/http'

const emptyCategory = { name: '', imageUrl: '', description: '', status: 'ACTIVE' }

function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyCategory)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    categoryApi.getAll()
      .then(setCategories)
      .catch((err) => setError(getErrorMessage(err, 'Không tải được danh mục.')))
      .finally(() => setLoading(false))
  }
  useEffect(loadData, [])

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const updateImage = (nextImageUrl) => setForm((current) => ({ ...current, imageUrl: nextImageUrl }))

  const submitForm = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      if (editingId) await categoryApi.update(editingId, form)
      else await categoryApi.create(form)
      setForm(emptyCategory)
      setEditingId(null)
      setMessage('Đã lưu danh mục.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được danh mục.'))
    }
  }

  const editCategory = (category) => {
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      imageUrl: category.imageUrl || '',
      description: category.description || '',
      status: category.status || 'ACTIVE',
    })
    setMessage('')
    setError('')
  }

  const deleteCategory = async (id) => {
    if (!window.confirm('Chuyển danh mục này vào thùng rác?')) return
    setMessage('')
    setError('')
    try {
      await categoryApi.remove(id)
      setMessage('Đã chuyển danh mục vào thùng rác.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không chuyển được danh mục vào thùng rác.'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row"><div><h1>Quản lý danh mục</h1><p>Danh mục sản phẩm GoalStore</p></div></div>
      <div className="admin-management-grid">
        <form className="admin-card admin-form" onSubmit={submitForm}>
          <h2>{editingId ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}
          <input name="name" value={form.name} onChange={updateForm} placeholder="Tên danh mục" required />
          <ImageUploadField value={form.imageUrl} onChange={updateImage} label="Ảnh danh mục" />
          <textarea name="description" value={form.description} onChange={updateForm} placeholder="Mô tả" />
          <button className="admin-red-btn"><Plus size={18} /> Lưu danh mục</button>
        </form>
        <div className="admin-card admin-table-wrap">
          {loading && <div className="loading-block compact">Đang tải danh mục...</div>}
          {!loading && categories.length === 0 && !error && <div className="empty-state"><strong>Chưa có danh mục</strong></div>}
          {!loading && categories.length > 0 && (
          <table className="admin-table">
            <thead><tr><th>Danh mục</th><th>Slug</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td><div className="table-product"><img src={imageUrl(category.imageUrl)} alt="" /><span>{category.name}</span></div></td>
                  <td>{category.slug}</td>
                  <td>{category.description}</td>
                  <td className="table-actions">
                    <button type="button" onClick={() => editCategory(category)}><Edit3 size={16} /></button>
                    <button type="button" onClick={() => deleteCategory(category.id)}><Trash2 size={16} /></button>
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

export default AdminCategoriesPage
