import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { imageUrl } from '../services/axiosClient'
import { productApi } from '../services/goalStoreApi'
import { formatCurrency } from '../utils/format'
import { getErrorMessage } from '../utils/http'

function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [sizeName, setSizeName] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([productApi.getById(id), productApi.related(id, 4)])
      .then(([productData, relatedData]) => {
        setProduct(productData)
        setSizeName(productData.sizes?.[0]?.sizeName || 'M')
        setQuantity(1)
        setRelated(relatedData.filter((item) => String(item.id) !== String(id)).slice(0, 4))
      })
      .catch((err) => {
        setProduct(null)
        setRelated([])
        setError(getErrorMessage(err, 'Không tải được sản phẩm.'))
      })
      .finally(() => setLoading(false))
  }, [id])

  const currentSize = useMemo(
    () => product?.sizes?.find((item) => item.sizeName === sizeName),
    [product, sizeName],
  )
  const maxQuantity = Number(currentSize?.stockQuantity ?? product?.stockQuantity ?? 0)
  const isOutOfStock = maxQuantity <= 0

  useEffect(() => {
    if (maxQuantity > 0) {
      setQuantity((value) => Math.min(value, maxQuantity))
    }
  }, [maxQuantity])

  const handleAddToCart = () => {
    const result = addToCart(product, sizeName, quantity)
    setNotice(result.message)
    window.setTimeout(() => setNotice(''), 2200)
  }

  if (loading) {
    return <div className="container loading-block">Đang tải sản phẩm...</div>
  }

  if (error || !product) {
    return (
      <div className="container empty-state page-empty">
        <strong>{error || 'Không tìm thấy sản phẩm.'}</strong>
        <Link to="/products" className="btn btn-red">Quay lại sản phẩm</Link>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <div className="container detail-layout">
        <div className="detail-image">
          <img src={imageUrl(product.imageUrl)} alt={product.name} />
        </div>
        <div className="detail-info">
          <Link to="/products" className="breadcrumb-link">Sản phẩm</Link>
          <h1>{product.name}</h1>
          <div className="detail-price">{formatCurrency(product.salePrice || product.price)}</div>
          <p>{product.description}</p>
          <div className="detail-meta">
            <span>Danh mục: <strong>{product.categoryName}</strong></span>
            <span>Đội bóng: <strong>{product.teamName}</strong></span>
            <span>Mùa giải: <strong>{product.season}</strong></span>
            <span>Kho: <strong>{product.stockQuantity}</strong></span>
          </div>
          <div className="size-picker">
            <strong>Size</strong>
            <div>
              {(product.sizes?.length ? product.sizes : [{ sizeName: 'M', stockQuantity: product.stockQuantity }]).map((size) => (
                <button
                  type="button"
                  key={size.sizeName}
                  className={sizeName === size.sizeName ? 'active' : ''}
                  onClick={() => setSizeName(size.sizeName)}
                >
                  {size.sizeName}
                </button>
              ))}
            </div>
            <small>{isOutOfStock ? 'Size này đã hết hàng' : `Còn ${maxQuantity} sản phẩm`}</small>
          </div>
          <div className="quantity-row">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button type="button" disabled={quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}>
              <Plus size={16} />
            </button>
          </div>
          <button type="button" className="btn btn-red detail-cart" disabled={isOutOfStock} onClick={handleAddToCart}>
            <ShoppingCart size={20} />
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </button>
          {notice && <p className="form-message success">{notice}</p>}
        </div>
      </div>

      <section className="container section-block">
        <div className="section-head">
          <h2>Sản phẩm liên quan</h2>
        </div>
        <div className="product-grid">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductDetailPage
