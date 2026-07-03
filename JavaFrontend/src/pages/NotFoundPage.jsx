import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="container empty-state page-empty">
      <strong>Không tìm thấy trang</strong>
      <p>Đường dẫn này không tồn tại hoặc đã được thay đổi.</p>
      <Link className="btn btn-red" to="/">Về trang chủ</Link>
    </div>
  )
}

export default NotFoundPage
