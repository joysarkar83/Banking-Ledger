import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="top-nav">
      <div>
        <p className="pill">Secure Banking</p>
        <h1 style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 700 }}>Banking Ledger</h1>
      </div>
      <div className="top-nav-actions">
        <Link to="/dashboard" className="btn btn-muted">
          Dashboard
        </Link>
        <Link to="/profile" className="btn btn-muted">
          Profile
        </Link>
        <button type="button" className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
