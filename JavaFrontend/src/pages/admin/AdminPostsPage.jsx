import { Edit3, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import ImageUploadField from '../../components/ImageUploadField'
import { imageUrl } from '../../services/axiosClient'
import { postApi } from '../../services/goalStoreApi'
import { formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/http'

const emptyPost = { title: '', imageUrl: '', content: '', status: 'ACTIVE' }

function AdminPostsPage() {
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState(emptyPost)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = () => {
    setLoading(true)
    setError('')
    postApi.getAll()
      .then(setPosts)
      .catch((err) => setError(getErrorMessage(err, 'Không tải được tin tức.')))
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
      if (editingId) await postApi.update(editingId, form)
      else await postApi.create(form)
      setForm(emptyPost)
      setEditingId(null)
      setMessage('Đã lưu bài viết.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không lưu được bài viết.'))
    }
  }

  const editPost = (post) => {
    setEditingId(post.id)
    setForm({
      title: post.title || '',
      imageUrl: post.imageUrl || '',
      content: post.content || '',
      status: post.status || 'ACTIVE',
    })
    setMessage('')
    setError('')
  }

  const deletePost = async (id) => {
    if (!window.confirm('Chuyển bài viết này vào thùng rác?')) return
    setMessage('')
    setError('')
    try {
      await postApi.remove(id)
      setMessage('Đã chuyển bài viết vào thùng rác.')
      loadData()
    } catch (err) {
      setError(getErrorMessage(err, 'Không chuyển được bài viết vào thùng rác.'))
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-title-row"><div><h1>Quản lý tin tức</h1><p>Bài viết và kinh nghiệm bóng đá</p></div></div>
      <div className="admin-management-grid">
        <form className="admin-card admin-form" onSubmit={submitForm}>
          <h2>{editingId ? 'Sửa bài viết' : 'Thêm bài viết'}</h2>
          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}
          <input name="title" value={form.title} onChange={updateForm} placeholder="Tiêu đề" required />
          <ImageUploadField value={form.imageUrl} onChange={updateImage} label="Ảnh bài viết" />
          <textarea name="content" value={form.content} onChange={updateForm} placeholder="Nội dung" />
          <button className="admin-red-btn"><Plus size={18} /> Lưu bài viết</button>
        </form>
        <div className="admin-card admin-table-wrap">
          {loading && <div className="loading-block compact">Đang tải bài viết...</div>}
          {!loading && posts.length === 0 && !error && <div className="empty-state"><strong>Chưa có bài viết</strong></div>}
          {!loading && posts.length > 0 && (
          <table className="admin-table">
            <thead><tr><th>Bài viết</th><th>Ngày tạo</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td><div className="table-product wide"><img src={imageUrl(post.imageUrl)} alt="" /><span>{post.title}<small>{post.content}</small></span></div></td>
                  <td>{formatDateTime(post.createdAt)}</td>
                  <td>{post.status}</td>
                  <td className="table-actions">
                    <button type="button" onClick={() => editPost(post)}><Edit3 size={16} /></button>
                    <button type="button" onClick={() => deletePost(post.id)}><Trash2 size={16} /></button>
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

export default AdminPostsPage
