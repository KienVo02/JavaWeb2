import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  FileText,
  Home,
  Layers3,
  Mail,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  UserCog,
  UsersRound,
  Warehouse,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'
import { dashboardApi, trashApi } from '../services/goalStoreApi'
import { formatCurrency, formatDateTime } from '../utils/format'

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: Home, end: true },
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/categories', label: 'Danh mục', icon: Layers3 },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Khách hàng', icon: UsersRound },
  { to: '/admin/inventory', label: 'Kho hàng', icon: Warehouse },
  { to: '/admin/posts', label: 'Tin tức', icon: FileText },
  { to: '/admin/reports', label: 'Báo cáo', icon: BarChart3 },
  { to: '/admin/settings', label: 'Cài đặt', icon: Settings },
  { to: '/admin/users', label: 'Tài khoản', icon: UserCog },
]

const editorLinks = [
  { to: '/editor', label: 'Bảng biên tập', icon: Home, end: true },
  { to: '/editor/posts', label: 'Tin tức', icon: FileText },
]

const quickLinks = [
  { keywords: ['dashboard', 'tong quan', 'thong ke'], path: '/admin' },
  { keywords: ['san pham', 'ao dau', 'product'], path: '/admin/products' },
  { keywords: ['danh muc', 'category'], path: '/admin/categories' },
  { keywords: ['don hang', 'order'], path: '/admin/orders' },
  { keywords: ['khach hang', 'customer'], path: '/admin/customers' },
  { keywords: ['kho', 'ton kho', 'inventory'], path: '/admin/inventory' },
  { keywords: ['tin tuc', 'post', 'bai viet'], path: '/admin/posts' },
  { keywords: ['bao cao', 'report'], path: '/admin/reports' },
  { keywords: ['cai dat', 'setting'], path: '/admin/settings' },
  { keywords: ['tai khoan', 'user', 'editor', 'admin'], path: '/admin/users' },
  { keywords: ['thung rac', 'trash', 'xoa tam'], path: '/admin/trash' },
  { keywords: ['editor', 'bien tap'], path: '/editor' },
]

function AdminLayout({ workspace = 'admin' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [panel, setPanel] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState(null)
  const [trashCount, setTrashCount] = useState(0)
  const isEditorWorkspace = workspace === 'editor'
  const links = isEditorWorkspace ? editorLinks : adminLinks

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      dashboardApi.statistics().then(setStats).catch(() => setStats(null))
    }
  }, [user])

  useEffect(() => {
    if (isEditorWorkspace || user?.role !== 'ADMIN') {
      setTrashCount(0)
      return undefined
    }

    let cancelled = false
    const refreshTrashCount = () => {
      trashApi.getAll()
        .then((items) => {
          if (!cancelled) setTrashCount(items.length)
        })
        .catch(() => {
          if (!cancelled) setTrashCount(0)
        })
    }

    refreshTrashCount()
    window.addEventListener('goalstore-trash-updated', refreshTrashCount)
    return () => {
      cancelled = true
      window.removeEventListener('goalstore-trash-updated', refreshTrashCount)
    }
  }, [isEditorWorkspace, location.pathname, user?.role])

  const notifications = useMemo(() => {
    const lowStock = stats?.featuredProducts?.filter((product) => Number(product.stockQuantity) <= 20).slice(0, 3) || []
    const recentOrders = stats?.recentOrders?.slice(0, 2) || []
    return [
      ...lowStock.map((product) => ({ title: `${product.name} sắp hết hàng`, detail: `Kho còn ${product.stockQuantity}` })),
      ...recentOrders.map((order) => ({ title: `Đơn #${order.orderCode}`, detail: `${order.status} - ${formatCurrency(order.totalAmount)}` })),
    ]
  }, [stats])

  const messages = useMemo(() => {
    const recentOrders = stats?.recentOrders?.slice(0, 3) || []
    if (recentOrders.length === 0) {
      return [
        { title: 'Tư vấn áo đấu đội bóng', detail: 'Khách cần báo giá in tên số' },
        { title: 'Hỗ trợ đổi size', detail: 'Kiểm tra đơn gần nhất' },
      ]
    }
    return recentOrders.map((order) => ({
      title: order.customerName || `Khách đơn #${order.orderCode}`,
      detail: `Cần theo dõi đơn #${order.orderCode} - ${formatDateTime(order.orderDate)}`,
    }))
  }, [stats])

  const submitSearch = (event) => {
    event.preventDefault()
    const normalized = search.trim().toLowerCase()
    if (!normalized) return
    if (isEditorWorkspace) {
      navigate('/editor/posts')
      setSearch('')
      return
    }
    const matched = quickLinks.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))
    navigate(matched?.path || (isEditorWorkspace ? '/editor/posts' : '/admin/products'))
    setSearch('')
  }

  const signOut = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`admin-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <Logo dark variant="admin" />
        </div>
        <nav className="admin-nav">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={`${item.label}-${item.to}`} to={item.to} end={item.end}>
                <Icon size={20} />
                <span>{item.label}</span>
                {item.label === 'Đơn hàng' && <b>{stats?.todayOrders || 0}</b>}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-btn" aria-label="Menu" onClick={() => setSidebarCollapsed((value) => !value)}>
            <Menu size={22} />
          </button>
          <form className="admin-search" onSubmit={submitSearch}>
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isEditorWorkspace ? 'Tìm bài viết, tin tức...' : 'Tìm sản phẩm, đơn hàng, khách hàng...'} />
            <kbd>Ctrl + K</kbd>
          </form>
          <div className="admin-actions">
            {!isEditorWorkspace && user?.role === 'ADMIN' && (
              <button
                type="button"
                className={`admin-icon-btn ${location.pathname === '/admin/trash' ? 'is-active' : ''}`}
                aria-label="Thung rac"
                onClick={() => {
                  setPanel('')
                  navigate('/admin/trash')
                }}
              >
                <Trash2 size={20} />
                {trashCount > 0 && <span>{trashCount}</span>}
              </button>
            )}
            <button type="button" className="admin-icon-btn" aria-label="Thông báo" onClick={() => setPanel(panel === 'notifications' ? '' : 'notifications')}>
              <Bell size={20} />
              <span>{notifications.length}</span>
            </button>
            <button type="button" className="admin-icon-btn" aria-label="Tin nhắn" onClick={() => setPanel(panel === 'messages' ? '' : 'messages')}>
              <Mail size={20} />
              <span>{messages.length}</span>
            </button>
            <button type="button" className="admin-profile profile-button" onClick={() => setPanel(panel === 'profile' ? '' : 'profile')}>
              <div className="admin-avatar">A</div>
              <div>
                <strong>{user?.fullName || 'GoalStore'}</strong>
                <small>{user?.role === 'EDITOR' ? 'Biên tập viên' : 'Quản trị viên'}</small>
              </div>
              <ChevronDown size={18} />
            </button>
          </div>
          {panel && (
            <div className="admin-popover">
              {panel === 'notifications' && (
                <PanelList
                  title="Thông báo"
                  empty="Chưa có thông báo mới"
                  items={notifications}
                  actionLabel={isEditorWorkspace ? 'Xem tin tức' : 'Xem kho hàng'}
                  onAction={() => navigate(isEditorWorkspace ? '/editor/posts' : '/admin/inventory')}
                />
              )}
              {panel === 'messages' && (
                <PanelList
                  title="Hộp thư"
                  empty="Chưa có thư mới"
                  items={messages}
                  actionLabel={isEditorWorkspace ? 'Xem tin tức' : 'Xem đơn hàng'}
                  onAction={() => navigate(isEditorWorkspace ? '/editor/posts' : '/admin/orders')}
                />
              )}
              {panel === 'profile' && (
                <div className="profile-menu">
                  <strong>{user?.fullName}</strong>
                  <span>{user?.email}</span>
                  <button type="button" onClick={() => navigate('/account')}>Tài khoản của tôi</button>
                  {user?.role === 'ADMIN' && <button type="button" onClick={() => navigate('/admin/users')}>Quản lý tài khoản</button>}
                  <button type="button" onClick={signOut}>Đăng xuất</button>
                </div>
              )}
            </div>
          )}
        </header>

        <Outlet />
      </div>
    </div>
  )
}

function PanelList({ title, empty, items, actionLabel, onAction }) {
  return (
    <div>
      <h3>{title}</h3>
      <div className="popover-list">
        {items.length === 0 && <p>{empty}</p>}
        {items.map((item) => (
          <div key={`${item.title}-${item.detail}`}>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
        ))}
      </div>
      <button type="button" onClick={onAction}>{actionLabel}</button>
    </div>
  )
}

export default AdminLayout
