import { Link } from 'react-router-dom'
function Logo({ dark = false, variant = 'store' }) {
  const logo = variant === 'admin' ? '/assets/goalstore-admin-logo.png' : '/assets/goalstore-logo.png'

  return (
    <Link to={variant === 'admin' ? '/admin' : '/'} className={`brand ${dark ? 'brand-dark' : ''}`}>
      <img className="brand-img" src={logo} alt="GoalStore" />
    </Link>
  )
}

export default Logo
