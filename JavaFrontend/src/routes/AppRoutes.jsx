import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import UserLayout from '../layouts/UserLayout'
import AdminLayout from '../layouts/AdminLayout'
import { useAuth } from '../context/AuthContext'
import HomePage from '../pages/HomePage'
import ProductsPage from '../pages/ProductsPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import NewsPage from '../pages/NewsPage'
import NotFoundPage from '../pages/NotFoundPage'
import LoginPage from '../pages/LoginPage'
import AccountPage from '../pages/AccountPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage'
import AdminCustomersPage from '../pages/admin/AdminCustomersPage'
import AdminPostsPage from '../pages/admin/AdminPostsPage'
import AdminInventoryPage from '../pages/admin/AdminInventoryPage'
import AdminReportsPage from '../pages/admin/AdminReportsPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'
import AdminTrashPage from '../pages/admin/AdminTrashPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import EditorHomePage from '../pages/admin/EditorHomePage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="admin" element={<RequireRole roles={['ADMIN']}><AdminLayout workspace="admin" /></RequireRole>}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="trash" element={<AdminTrashPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route path="editor" element={<RequireRole roles={['EDITOR', 'ADMIN']}><AdminLayout workspace="editor" /></RequireRole>}>
          <Route index element={<EditorHomePage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="*" element={<Navigate to="/editor" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function RequireRole({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="container loading-block">Đang kiểm tra tài khoản...</div>
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="container empty-state page-empty">
        <strong>Không có quyền truy cập</strong>
        <p>Tài khoản {user.email} thuộc vai trò {user.role}, không được vào khu vực này.</p>
        <NavigateLink role={user.role} />
      </div>
    )
  }

  return children
}

function NavigateLink({ role }) {
  if (role === 'EDITOR') {
    return <a className="btn btn-red" href="/editor">Vào khu editor</a>
  }
  return <a className="btn btn-red" href="/">Về trang cửa hàng</a>
}

export default AppRoutes
