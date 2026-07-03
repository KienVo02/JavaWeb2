import { FileText, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function EditorHomePage() {
  const { user } = useAuth()

  return (
    <div className="admin-page">
      <div className="admin-title-row">
        <div>
          <h1>Khu biên tập</h1>
          <p>Xin chào {user?.fullName}. Editor được phép quản lý tin tức, không có quyền vào trang admin.</p>
        </div>
      </div>
      <div className="editor-home-grid">
        <div className="admin-card editor-card">
          <ShieldCheck size={42} />
          <h2>Quyền Editor</h2>
          <p>Được thêm, sửa, xóa bài viết tin tức. Không được quản lý đơn hàng, tài khoản, báo cáo hoặc cài đặt hệ thống.</p>
        </div>
        <Link className="admin-card editor-card link-card" to="/editor/posts">
          <FileText size={42} />
          <h2>Quản lý tin tức</h2>
          <p>Vào danh sách bài viết để biên tập nội dung cửa hàng.</p>
        </Link>
      </div>
    </div>
  )
}

export default EditorHomePage
