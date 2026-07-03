import { ChevronDown, Heart, LogOut, Search, ShoppingCart, UserRound } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { imageUrl } from '../services/axiosClient'

const socialIcons = [
  '/image/ChatGPT Image 19_52_58 20 thg 6, 2026 (1).png',
  '/image/ChatGPT Image 19_52_58 20 thg 6, 2026 (2).png',
  '/image/ChatGPT Image 19_52_58 20 thg 6, 2026 (3).png',
  '/image/ChatGPT Image 19_52_59 20 thg 6, 2026 (4).png',
]

function UserLayout() {
  const { totals } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')
  const [accountOpen, setAccountOpen] = useState(false)

  const submitQuickSearch = (event) => {
    event.preventDefault()
    const query = quickSearch.trim()
    setSearchOpen(false)
    navigate(query ? `/products?keyword=${encodeURIComponent(query)}` : '/products')
  }

  const accountPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'EDITOR' ? '/editor' : user ? '/account' : '/login'
  const accountName = user?.fullName || user?.email || 'Tài khoản'

  const openAccountHome = () => {
    setAccountOpen(false)
    navigate(accountPath)
  }

  const signOut = async () => {
    setAccountOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="main-nav">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/products">Sản phẩm</NavLink>
            <a href="/#categories">Danh mục</a>
            <a href="/#offers">Khuyến mãi</a>
            <NavLink to="/news">Tin tức</NavLink>
            <a href="#footer">Liên hệ</a>
          </nav>
          <div className="header-icons">
            <button type="button" className="plain-icon" aria-label="Tìm kiếm" onClick={() => setSearchOpen((value) => !value)}>
              <Search size={22} />
            </button>
            <NavLink to="/products?sort=new" className="plain-icon" aria-label="Yêu thích">
              <Heart size={22} />
            </NavLink>
            {user ? (
              <div className="user-menu-wrap">
                <button
                  type="button"
                  className="user-menu-trigger"
                  aria-label="Tài khoản đang đăng nhập"
                  onClick={() => setAccountOpen((value) => !value)}
                >
                  <UserRound size={20} />
                  <span>{accountName}</span>
                  <ChevronDown size={15} />
                </button>
                {accountOpen && (
                  <div className="user-menu-popover">
                    <strong>{accountName}</strong>
                    <small>{user.email}</small>
                    <button type="button" onClick={openAccountHome}>
                      {user.role === 'ADMIN' ? 'Vào trang admin' : user.role === 'EDITOR' ? 'Vào khu editor' : 'Tài khoản của tôi'}
                    </button>
                    <button type="button" onClick={signOut}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to={accountPath} className="plain-icon" aria-label="Tài khoản">
                <UserRound size={22} />
              </NavLink>
            )}
            <NavLink to="/cart" className="cart-icon" aria-label="Giỏ hàng">
              <ShoppingCart size={22} />
              <span>{totals.count}</span>
            </NavLink>
          </div>
          {searchOpen && (
            <form className="header-search-popover" onSubmit={submitQuickSearch}>
              <Search size={18} />
              <input
                autoFocus
                value={quickSearch}
                onChange={(event) => setQuickSearch(event.target.value)}
                placeholder="Tìm áo đấu, đội bóng..."
              />
              <button type="submit">Tìm</button>
            </form>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer" id="footer">
        <div className="container footer-grid">
          <div>
            <Logo dark />
            <p>
              GoalStore chuyên cung cấp áo đấu bóng đá chính hãng, mẫu mã đa dạng,
              giá tốt và giao hàng toàn quốc.
            </p>
            <div className="social-row">
              {socialIcons.map((icon) => (
                <span key={icon}>
                  <img src={imageUrl(icon)} alt="GoalStore social" />
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4>Về chúng tôi</h4>
            <a>Giới thiệu</a>
            <a>Hệ thống cửa hàng</a>
            <a>Chính sách bảo mật</a>
            <a>Điều khoản sử dụng</a>
          </div>
          <div>
            <h4>Hỗ trợ khách hàng</h4>
            <a>Hướng dẫn mua hàng</a>
            <a>Chính sách đổi trả</a>
            <a>Giao hàng và chuyển khoản</a>
            <a>Thanh toán</a>
          </div>
          <div>
            <h4>Thông tin liên hệ</h4>
            <p>123 Nguyễn Trãi, Quận 1, TP.HCM</p>
            <p>0901 234 567</p>
            <p>support@goalstore.vn</p>
            <p>08:00 - 22:00 tất cả các ngày</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default UserLayout
