import { useEffect, useState } from 'react'
import { imageUrl } from '../services/axiosClient'
import { postApi } from '../services/goalStoreApi'
import { formatDateTime } from '../utils/format'
import { getErrorMessage } from '../utils/http'

function NewsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    postApi.getAll()
      .then(setPosts)
      .catch((err) => {
        setPosts([])
        setError(getErrorMessage(err, 'Không tải được tin tức.'))
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="news-page">
      <section className="page-banner">
        <div className="container">
          <h1>Tin tức GoalStore</h1>
          <p>Cập nhật áo đấu mới, cách chọn size và kinh nghiệm bảo quản.</p>
        </div>
      </section>
      <section className="container news-list">
        {loading && <div className="loading-block compact">Đang tải tin tức...</div>}
        {error && <div className="form-message error">{error}</div>}
        {!loading && !error && posts.length === 0 && (
          <div className="empty-state">
            <strong>Chưa có bài viết nào</strong>
          </div>
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="news-grid">
            {posts.map((post) => (
              <article key={post.id} className="news-card">
                <img src={imageUrl(post.imageUrl)} alt={post.title} loading="lazy" decoding="async" />
                <span>{formatDateTime(post.createdAt)}</span>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default NewsPage
