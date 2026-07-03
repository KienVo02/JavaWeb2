import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { imageUrl } from '../services/axiosClient'
import { formatCurrency } from '../utils/format'

function CartPage() {
  const { items, totals, updateQuantity, removeFromCart } = useCart()

  return (
    <div className="cart-page">
      <section className="page-banner">
        <div className="container">
          <h1>Giỏ hàng</h1>
          <p>Kiểm tra sản phẩm trước khi thanh toán.</p>
        </div>
      </section>
      <div className="container cart-layout">
        <div className="cart-list">
          {items.length === 0 && (
            <div className="empty-state">
              <strong>Giỏ hàng đang trống</strong>
              <Link to="/products" className="btn btn-red">Mua sắm ngay</Link>
            </div>
          )}
          {items.map((item) => (
            <article key={item.key} className="cart-item">
              <img src={imageUrl(item.imageUrl)} alt={item.name} loading="lazy" decoding="async" />
              <div>
                <h3>{item.name}</h3>
                <span>Size {item.sizeName}</span>
                {item.maxStock && <span>Còn {item.maxStock} sản phẩm</span>}
                <strong>{formatCurrency(item.price)}</strong>
              </div>
              <div className="quantity-row compact">
                <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)}>
                  <Minus size={15} />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  disabled={item.maxStock && item.quantity >= item.maxStock}
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                >
                  <Plus size={15} />
                </button>
              </div>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
              <button type="button" className="icon-btn danger" onClick={() => removeFromCart(item.key)}>
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <h2>Tổng đơn hàng</h2>
          <div><span>Số lượng</span><strong>{totals.count}</strong></div>
          <div><span>Tạm tính</span><strong>{formatCurrency(totals.amount)}</strong></div>
          <div><span>Vận chuyển</span><strong>Miễn phí</strong></div>
          <div className="summary-total"><span>Tổng cộng</span><strong>{formatCurrency(totals.amount)}</strong></div>
          <Link to="/checkout" className={`btn btn-red ${items.length === 0 ? 'disabled' : ''}`}>
            Thanh toán
          </Link>
        </aside>
      </div>
    </div>
  )
}

export default CartPage
