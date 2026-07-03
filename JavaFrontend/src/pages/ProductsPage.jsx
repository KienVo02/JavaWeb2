import { Filter, RotateCcw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { categoryApi, productApi } from '../services/goalStoreApi'
import { getErrorMessage } from '../utils/http'

const pageSize = 12

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '')
  const [size, setSize] = useState(searchParams.get('size') || '')
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'new')
  const [page, setPage] = useState(Number(searchParams.get('page') || 1))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '')
    setCategoryId(searchParams.get('category') || '')
    setSize(searchParams.get('size') || '')
    setPriceRange(searchParams.get('price') || '')
    setSort(searchParams.get('sort') || 'new')
    setPage(Number(searchParams.get('page') || 1))
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([productApi.getAll(), categoryApi.getAll()])
      .then(([productData, categoryData]) => {
        setProducts(productData)
        setCategories(categoryData)
      })
      .catch((err) => {
        setProducts([])
        setCategories([])
        setError(getErrorMessage(err, 'Không tải được danh sách sản phẩm.'))
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    const result = products.filter((product) => {
      const price = Number(product.salePrice || product.price || 0)
      const matchesKeyword =
        !normalizedKeyword ||
        product.name?.toLowerCase().includes(normalizedKeyword) ||
        product.teamName?.toLowerCase().includes(normalizedKeyword) ||
        product.leagueName?.toLowerCase().includes(normalizedKeyword)
      const matchesCategory = !categoryId || String(product.categoryId) === String(categoryId)
      const matchesSize = !size || product.sizes?.some((item) => item.sizeName === size && Number(item.stockQuantity) > 0)
      const matchesPrice =
        !priceRange ||
        (priceRange === 'under700' && price < 700000) ||
        (priceRange === '700to1000' && price >= 700000 && price <= 1000000) ||
        (priceRange === 'over1000' && price > 1000000)

      return matchesKeyword && matchesCategory && matchesSize && matchesPrice
    })

    return result.sort((a, b) => {
      const aPrice = Number(a.salePrice || a.price || 0)
      const bPrice = Number(b.salePrice || b.price || 0)
      if (sort === 'priceAsc') return aPrice - bPrice
      if (sort === 'priceDesc') return bPrice - aPrice
      if (sort === 'stock') return Number(b.stockQuantity || 0) - Number(a.stockQuantity || 0)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [products, keyword, categoryId, size, priceRange, sort])

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const visibleProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize)

  const updateQuery = (updates) => {
    const next = {
      keyword,
      category: categoryId,
      size,
      price: priceRange,
      sort,
      page,
      ...updates,
    }

    Object.keys(next).forEach((key) => {
      if (!next[key] || (key === 'sort' && next[key] === 'new') || (key === 'page' && Number(next[key]) === 1)) {
        delete next[key]
      }
    })

    setSearchParams(next)
  }

  const resetFilters = () => {
    setSearchParams({})
  }

  return (
    <div className="catalog-page">
      <section className="page-banner">
        <div className="container">
          <h1>Áo đấu bóng đá</h1>
          <p>Chọn áo theo đội bóng, mùa giải, size và khoảng giá.</p>
        </div>
      </section>

      <div className="container catalog-layout">
        <aside className="filter-panel">
          <h2>
            <Filter size={20} />
            Bộ lọc
          </h2>
          <label>
            Tìm kiếm
            <span>
              <Search size={18} />
              <input
                value={keyword}
                onChange={(event) => updateQuery({ keyword: event.target.value, page: 1 })}
                placeholder="Tên áo, CLB, giải đấu..."
              />
            </span>
          </label>
          <label>
            Danh mục
            <select value={categoryId} onChange={(event) => updateQuery({ category: event.target.value, page: 1 })}>
              <option value="">Tất cả</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Size
            <select value={size} onChange={(event) => updateQuery({ size: event.target.value, page: 1 })}>
              <option value="">Tất cả</option>
              {['S', 'M', 'L', 'XL', 'XXL'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Khoảng giá
            <select value={priceRange} onChange={(event) => updateQuery({ price: event.target.value, page: 1 })}>
              <option value="">Tất cả</option>
              <option value="under700">Dưới 700.000đ</option>
              <option value="700to1000">700.000đ - 1.000.000đ</option>
              <option value="over1000">Trên 1.000.000đ</option>
            </select>
          </label>
          <button className="admin-secondary-btn reset-filter" type="button" onClick={resetFilters}>
            <RotateCcw size={16} />
            Xóa lọc
          </button>
        </aside>

        <section className="catalog-results">
          <div className="catalog-head">
            <strong>{loading ? 'Đang tải...' : `${filteredProducts.length} sản phẩm`}</strong>
            <select value={sort} onChange={(event) => updateQuery({ sort: event.target.value, page: 1 })}>
              <option value="new">Mới nhất</option>
              <option value="priceAsc">Giá thấp đến cao</option>
              <option value="priceDesc">Giá cao đến thấp</option>
              <option value="stock">Còn hàng nhiều</option>
            </select>
          </div>

          {error && <div className="form-message error">{error}</div>}
          {loading && <div className="loading-block compact">Đang tải sản phẩm...</div>}
          {!loading && !error && visibleProducts.length === 0 && (
            <div className="empty-state">
              <strong>Không tìm thấy sản phẩm phù hợp</strong>
              <button type="button" className="btn btn-red" onClick={resetFilters}>Xóa bộ lọc</button>
            </div>
          )}
          {!loading && !error && visibleProducts.length > 0 && (
            <>
              <div className="product-grid catalog-grid">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {pageCount > 1 && (
                <div className="pagination">
                  {Array.from({ length: pageCount }, (_, index) => (
                    <button
                      type="button"
                      key={index + 1}
                      className={safePage === index + 1 ? 'active' : ''}
                      onClick={() => updateQuery({ page: index + 1 })}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default ProductsPage
