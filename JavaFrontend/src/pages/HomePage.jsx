import { ArrowRight, Headphones, RotateCcw, Search, Settings, ShieldCheck, Shirt, Trophy, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { imageUrl } from '../services/axiosClient'
import { categoryApi, postApi, productApi } from '../services/goalStoreApi'

const serviceCards = [
  {
    title: '100% Chính hãng',
    subtitle: 'Cam kết Authentic',
    Icon: ShieldCheck,
  },
  {
    title: 'Miễn phí vận chuyển',
    subtitle: 'Đơn hàng từ 500k',
    Icon: Truck,
  },
  {
    title: 'Đổi trả dễ dàng',
    subtitle: 'Trong 7 ngày',
    Icon: RotateCcw,
  },
  {
    title: 'Hỗ trợ 24/7',
    subtitle: 'Tư vấn nhanh chóng',
    Icon: Headphones,
  },
]

const categoryCards = [
  { title: 'CLB nổi bật', image: '/image/ChatGPT Image 19_51_19 19 thg 6, 2026 (1).png' },
  { title: 'Đội tuyển quốc gia', image: '/image/ChatGPT Image 19_51_20 19 thg 6, 2026 (2).png' },
  { title: 'Áo sân nhà', image: '/image/ChatGPT Image 19_51_21 19 thg 6, 2026 (3).png' },
  { title: 'Áo sân khách', image: '/image/ChatGPT Image 19_52_57 19 thg 6, 2026.png' },
  { title: 'Phụ kiện', image: '/image/ChatGPT Image 19_51_21 19 thg 6, 2026 (4).png' },
  { title: 'Áo thủ môn', image: '/image/ChatGPT Image 19_51_21 19 thg 6, 2026 (5).png' },
]

const leagueCards = [
  { name: 'Premier League', image: '/image/ChatGPT Image 19_51_19 19 thg 6, 2026 (1).png' },
  { name: 'La Liga', image: '/image/ChatGPT Image 19_55_07 19 thg 6, 2026 (4).png' },
  { name: 'Serie A', image: '/image/ChatGPT Image 19_56_40 19 thg 6, 2026 (10).png' },
  { name: 'Champions League', image: '/image/ChatGPT Image 19_57_35 19 thg 6, 2026 (4).png' },
  { name: 'World Cup', image: '/image/ChatGPT Image 19_57_36 19 thg 6, 2026 (5).png' },
  { name: 'V-League', image: '/image/ChatGPT Image 19_57_36 19 thg 6, 2026 (6).png' },
]

const collectionItems = [
  { label: 'Manchester United', image: '/image/ChatGPT Image 19_56_38 19 thg 6, 2026 (5).png' },
  { label: 'Real Madrid', image: '/image/ChatGPT Image 19_56_39 19 thg 6, 2026 (6).png' },
  { label: 'Bayern Munich', image: '/image/ChatGPT Image 19_56_39 19 thg 6, 2026 (7).png' },
  { label: 'Barcelona', image: '/image/ChatGPT Image 19_56_39 19 thg 6, 2026 (8).png' },
  { label: 'Manchester City', image: '/image/ChatGPT Image 19_56_40 19 thg 6, 2026 (9).png' },
  { label: 'AC Milan', image: '/image/ChatGPT Image 19_56_40 19 thg 6, 2026 (10).png' },
]

const brandLogos = [
  '/image/ChatGPT Image 19_35_28 20 thg 6, 2026 (1).png',
  '/image/ChatGPT Image 19_35_28 20 thg 6, 2026 (2).png',
  '/image/ChatGPT Image 19_35_28 20 thg 6, 2026 (3).png',
  '/image/ChatGPT Image 19_35_28 20 thg 6, 2026 (4).png',
  '/image/ChatGPT Image 19_35_28 20 thg 6, 2026 (5).png',
  '/image/ChatGPT Image 19_35_28 20 thg 6, 2026 (6).png',
  '/image/ChatGPT Image 19_35_28 20 thg 6, 2026 (7).png',
]

const newsImages = [
  '/image/ChatGPT Image 19_57_34 19 thg 6, 2026 (1).png',
  '/image/ChatGPT Image 19_57_34 19 thg 6, 2026 (2).png',
  '/image/ChatGPT Image 19_57_38 19 thg 6, 2026 (8).png',
  '/image/ChatGPT Image 19_57_39 19 thg 6, 2026 (10).png',
]

function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [posts, setPosts] = useState([])
  const [keyword, setKeyword] = useState('')
  const [formNotice, setFormNotice] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([categoryApi.getAll(), productApi.newest(6), productApi.lowStock(), postApi.getAll()])
      .then(([categoryData, productData, lowStockData, postData]) => {
        setCategories(categoryData)
        setProducts(productData)
        setLowStock(lowStockData.slice(0, 4))
        setPosts(postData.slice(0, 4))
      })
      .catch(() => {
        setCategories([])
        setProducts([])
        setLowStock([])
        setPosts([])
      })
  }, [])

  const handleSearch = (event) => {
    event.preventDefault()
    navigate(keyword ? `/products?keyword=${encodeURIComponent(keyword)}` : '/products')
  }

  const handleNewsletterBandClick = (event) => {
    const button = event.target.closest('button')
    if (!button || !event.currentTarget.contains(button)) return

    const form = button.closest('form')
    if (form) {
      const inputs = Array.from(form.querySelectorAll('input')).map((input) => input.value.trim())
      const topic = form.querySelector('select')?.value || ''
      const [fullName, phone, email] = inputs
      if (!fullName || !phone || !email || !topic) {
        setFormNotice('Vui lòng điền đủ thông tin tư vấn.')
        return
      }
      form.reset()
      setFormNotice('Đã nhận yêu cầu tư vấn. GoalStore sẽ liên hệ lại trong thời gian sớm nhất.')
      return
    }

    const emailInput = event.currentTarget.querySelector('.newsletter-inner > div input')
    const email = emailInput?.value.trim() || ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormNotice('Vui lòng nhập email hợp lệ để nhận tin.')
      return
    }
    emailInput.value = ''
    setFormNotice('Đã đăng ký nhận tin thành công. GoalStore sẽ gửi ưu đãi mới cho bạn.')
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-copy">
            <h1>
              CỬA HÀNG <span>ÁO ĐẤU BÓNG ĐÁ</span>
            </h1>
            <p>Áo đấu chính hãng - Mẫu mã đa dạng</p>
            <p>Giá tốt - Chất lượng vượt trội</p>
            <div className="hero-buttons">
              <Link className="btn btn-red" to="/products">
                Mua ngay
              </Link>
              <a className="btn btn-ghost-light" href="#collections">
                Xem bộ sưu tập
              </a>
            </div>
          </div>
        </div>
        <div className="container hero-search-card">
          <form onSubmit={handleSearch} className="hero-search">
            <label>
              <Search size={20} />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm kiếm áo đấu, đội bóng..."
              />
            </label>
            <select defaultValue="">
              <option value="">Chọn đội bóng</option>
              <option>Manchester United</option>
              <option>Real Madrid</option>
              <option>Barcelona</option>
            </select>
            <select defaultValue="">
              <option value="">Chọn size</option>
              <option>S</option>
              <option>M</option>
              <option>L</option>
              <option>XL</option>
            </select>
            <select defaultValue="">
              <option value="">Khoảng giá</option>
              <option>Dưới 500k</option>
              <option>500k - 1 triệu</option>
            </select>
            <button className="btn btn-red" type="submit">
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      <section className="container service-strip">
        {serviceCards.map((item) => (
          <div key={item.title}>
            <item.Icon size={34} strokeWidth={2.1} />
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </div>
        ))}
      </section>

      <section className="container category-grid" id="categories">
        {categoryCards.map((item, index) => (
          <Link
            key={item.title}
            to={categories[index]?.id ? `/products?category=${categories[index].id}` : '/products'}
            className="category-tile"
          >
            <img src={imageUrl(item.image)} alt={item.title} loading="lazy" decoding="async" />
            <strong>{item.title}</strong>
          </Link>
        ))}
      </section>

      <section className="container section-block featured-section">
        <div className="section-head">
          <h2>SẢN PHẨM NỔI BẬT</h2>
          <Link to="/products">
            Xem tất cả <ArrowRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="container about-section">
        <div className="about-gallery">
          <img src={imageUrl('/image/ChatGPT Image 19_56_36 19 thg 6, 2026 (1).png')} alt="Cửa hàng GoalStore" loading="lazy" decoding="async" />
          <img src={imageUrl('/image/ChatGPT Image 19_56_37 19 thg 6, 2026 (2).png')} alt="Kho hàng GoalStore" loading="lazy" decoding="async" />
          <img src={imageUrl('/image/ChatGPT Image 19_56_38 19 thg 6, 2026 (4).png')} alt="Áo đấu GoalStore" loading="lazy" decoding="async" />
        </div>
        <div className="about-copy">
          <span>VỀ GOALSTORE</span>
          <h2>Nhà cung cấp áo đấu uy tín hàng đầu tại Việt Nam</h2>
          <p>
            Với hơn 5 năm kinh nghiệm trong lĩnh vực áo đấu bóng đá, GoalStore cam kết
            mang đến những sản phẩm chính hãng 100%, đa dạng mẫu mã và dịch vụ chuyên nghiệp.
          </p>
          <div className="metric-row">
            <strong>5+<small>Năm kinh nghiệm</small></strong>
            <strong>1.000+<small>Khách hàng hài lòng</small></strong>
            <strong>300+<small>Mẫu áo đa dạng</small></strong>
            <strong>24h<small>Hỗ trợ nhanh chóng</small></strong>
          </div>
        </div>
      </section>

      <section className="commit-band" id="offers">
        <div className="container commit-inner">
          <h2>CAM KẾT TỪ GOALSTORE</h2>
          <div><ShieldCheck /><strong>100% Chính hãng</strong><span>Cam kết Authentic</span></div>
          <div><Truck /><strong>Giao hàng toàn quốc</strong><span>Nhanh chóng, an toàn</span></div>
          <div><Shirt /><strong>In tên số theo yêu cầu</strong><span>Chuẩn đẹp, bền màu</span></div>
          <div><Settings /><strong>Bán sỉ & CTV toàn quốc</strong><span>Giá tốt, chính sách ưu đãi</span></div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-head">
          <h2>GIẢI ĐẤU & CLB NỔI BẬT</h2>
          <Link to="/products">
            Xem tất cả <ArrowRight size={18} />
          </Link>
        </div>
        <div className="league-grid">
          {leagueCards.map((item) => (
            <Link key={item.name} to="/products" className="league-card">
              <img src={imageUrl(item.image)} alt={item.name} loading="lazy" decoding="async" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section-block" id="collections">
        <div className="section-head">
          <h2>BST MỚI & PHONG CÁCH</h2>
          <Link to="/products">
            Xem tất cả <ArrowRight size={18} />
          </Link>
        </div>
        <div className="collection-grid">
          {collectionItems.map((item) => (
            <Link key={item.label} to="/products" className="collection-card">
              <img src={imageUrl(item.image)} alt={item.label} loading="lazy" decoding="async" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container why-section">
        <div>
          <span>VÌ SAO CHỌN GOALSTORE?</span>
          <h2>Chọn GoalStore, chọn sự khác biệt</h2>
          <ul>
            <li>Sản phẩm chính hãng 100%, nói không với hàng fake.</li>
            <li>Mẫu mã đa dạng, cập nhật theo mùa giải mới nhất.</li>
            <li>Giá cả cạnh tranh, nhiều chương trình ưu đãi hấp dẫn.</li>
            <li>In tên số sắc nét, chuẩn thi đấu và bền màu.</li>
            <li>Đổi trả dễ dàng trong 7 ngày nếu lỗi từ nhà sản xuất.</li>
            <li>Đội ngũ tư vấn nhiệt tình, hỗ trợ 24/7.</li>
          </ul>
        </div>
        <img src={imageUrl('/image/ChatGPT Image 19_57_39 19 thg 6, 2026 (10).png')} alt="Áo đấu trên kệ" loading="lazy" decoding="async" />
      </section>

      <section className="container process-section">
        <h2>QUY TRÌNH ĐẶT HÀNG</h2>
        <div className="process-grid">
          {['Chọn mẫu', 'Đặt hàng', 'In tên số', 'Giao hàng', 'Hỗ trợ sau bán'].map((item, index) => (
            <div key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="container brand-row">
        <h2>ĐỐI TÁC & THƯƠNG HIỆU</h2>
        <div>
          {brandLogos.map((logo) => (
            <span key={logo}>
              <img src={imageUrl(logo)} alt="Thương hiệu" loading="lazy" decoding="async" />
            </span>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-head">
          <h2>TIN TỨC MỚI NHẤT</h2>
          <Link to="/news">
            Xem tất cả <ArrowRight size={18} />
          </Link>
        </div>
        <div className="news-grid">
          {posts.map((post, index) => (
            <article key={post.id} className="news-card">
              <img src={imageUrl(newsImages[index] || post.imageUrl)} alt={post.title} loading="lazy" decoding="async" />
              <span>Tin mới</span>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="newsletter-band" onClick={handleNewsletterBandClick}>
        <div className="container newsletter-inner">
          <div>
            <h2>ĐĂNG KÝ NHẬN TIN</h2>
            <p>Nhận ngay ưu đãi và cập nhật mẫu áo mới nhất.</p>
            <label>
              <input placeholder="Nhập email của bạn..." />
              <button type="button">Đăng ký</button>
            </label>
          </div>
          <form>
            <h2>TƯ VẤN & BÁO GIÁ NHANH</h2>
            <p>Điền thông tin, chúng tôi sẽ liên hệ nhanh.</p>
            <div>
              <input placeholder="Họ và tên" />
              <input placeholder="Số điện thoại" />
            </div>
            <div>
              <input placeholder="Email" />
              <select defaultValue="">
                <option value="">Nội dung quan tâm</option>
                <option>Đặt áo lẻ</option>
                <option>Đặt áo đội bóng</option>
                <option>In tên số</option>
              </select>
            </div>
            <button type="button">Gửi yêu cầu</button>
          </form>
          {formNotice && <small className="form-feedback">{formNotice}</small>}
        </div>
      </section>

      {lowStock.length > 0 && (
        <section className="container low-stock-home">
          <Trophy />
          <strong>Kho sắp hết</strong>
          <span>{lowStock.map((item) => item.teamName).join(', ')}</span>
        </section>
      )}
    </div>
  )
}

export default HomePage
