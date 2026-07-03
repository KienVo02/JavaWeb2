import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { orderApi } from '../services/goalStoreApi'
import { formatCurrency } from '../utils/format'
import { getErrorMessage } from '../utils/http'

function CheckoutPage() {
  const { items, totals, clearCart } = useCart()
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'Thanh toán khi nhận hàng',
  })
  const [orderCode, setOrderCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (items.length === 0) return
    setError('')

    if (!/^[0-9+\s.-]{8,15}$/.test(form.customerPhone.trim())) {
      setError('Số điện thoại chưa hợp lệ.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        items: items.map((item) => ({
          productId: item.productId,
          sizeName: item.sizeName,
          quantity: item.quantity,
        })),
      }
      const order = await orderApi.create(payload)
      setOrderCode(order.orderCode)
      clearCart()
    } catch (err) {
      setError(getErrorMessage(err, 'Không đặt được đơn hàng. Vui lòng kiểm tra lại thông tin.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !orderCode) {
    return <Navigate to="/cart" replace />
  }

  if (orderCode) {
    return (
      <div className="container success-page">
        <CheckCircle2 size={64} />
        <h1>Đặt hàng thành công</h1>
        <p>Mã đơn hàng của bạn là <strong>{orderCode}</strong>.</p>
        <Link className="btn btn-red" to="/products">Tiếp tục mua sắm</Link>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <section className="page-banner">
        <div className="container">
          <h1>Thanh toán</h1>
          <p>Điền thông tin giao hàng để hoàn tất đơn hàng.</p>
        </div>
      </section>

      <form className="container checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-form">
          <label>Họ và tên<input name="customerName" value={form.customerName} onChange={updateForm} required /></label>
          <label>Email<input name="customerEmail" type="email" value={form.customerEmail} onChange={updateForm} /></label>
          <label>Số điện thoại<input name="customerPhone" value={form.customerPhone} onChange={updateForm} required /></label>
          <label>Địa chỉ giao hàng<textarea name="shippingAddress" value={form.shippingAddress} onChange={updateForm} required /></label>
          <label>
            Phương thức thanh toán
            <select name="paymentMethod" value={form.paymentMethod} onChange={updateForm}>
              <option>Thanh toán khi nhận hàng</option>
              <option>Chuyển khoản ngân hàng</option>
            </select>
          </label>
        </div>
        <aside className="order-summary">
          <h2>Đơn hàng</h2>
          {items.map((item) => (
            <div key={item.key}>
              <span>{item.name} x {item.quantity}</span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="summary-total"><span>Tổng cộng</span><strong>{formatCurrency(totals.amount)}</strong></div>
          {error && <p className="form-message error">{error}</p>}
          <button className="btn btn-red" disabled={submitting || items.length === 0}>
            {submitting ? 'Đang gửi...' : 'Đặt hàng'}
          </button>
        </aside>
      </form>
    </div>
  )
}

export default CheckoutPage
