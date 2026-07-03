import { ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { imageUrl } from '../services/axiosClient'
import { formatCurrency } from '../utils/format'
import { useCart } from '../context/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()
  const firstSize = product.sizes?.[0]?.sizeName || 'M'
  const firstSizeStock = product.sizes?.[0]?.stockQuantity
  const availableStock = Number(firstSizeStock ?? product.stockQuantity ?? 0)
  const isOutOfStock = availableStock <= 0
  const [notice, setNotice] = useState('')

  const handleAddToCart = () => {
    const result = addToCart(product, firstSize, 1)
    setNotice(result.message)
    window.setTimeout(() => setNotice(''), 1800)
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <span className="sale-chip">{isOutOfStock ? 'Hết hàng' : 'Mới'}</span>
        <img src={imageUrl(product.imageUrl)} alt={product.name} loading="lazy" decoding="async" />
      </Link>
      <div className="product-card-body">
        <p className="product-team">{product.teamName || product.categoryName}</p>
        <h3>{product.name}</h3>
        <div className="price-row">
          <strong>{formatCurrency(product.salePrice || product.price)}</strong>
          {product.salePrice && Number(product.salePrice) < Number(product.price) && (
            <span>{formatCurrency(product.price)}</span>
          )}
        </div>
        <div className="product-actions">
          <Link to={`/products/${product.id}`} className="btn btn-red btn-sm">
            Xem chi tiết
          </Link>
          <button
            type="button"
            className="icon-btn"
            aria-label="Thêm vào giỏ"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
        {notice && <small className="cart-note">{notice}</small>}
      </div>
    </article>
  )
}

export default ProductCard
