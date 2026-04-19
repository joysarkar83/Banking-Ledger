import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    mobileNo: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { confirmPassword, ...payload } = form
      await register(payload)
      setForm({
        name: '',
        mobileNo: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Unable to register at the moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <p className="pill">Create profile</p>
        <h2 style={{ marginTop: 12, fontSize: '1.5rem', fontWeight: 700 }}>Register</h2>
        <p className="muted" style={{ marginBottom: 20 }}>
          Start with your basics. We’ll keep the vault secure.
        </p>

        <div className="grid" style={{ gap: 12 }}>
          <label>
            <span className="muted"  style={{ fontWeight: 700 }}>Full name</span>
            <input
              required
              className="input"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </label>

          <label>
            <span className="muted" style={{ fontWeight: 700 }}>Mobile number (E.164)</span>
            <input
              required
              className="input"
              placeholder="+919999999999"
              value={form.mobileNo}
              onChange={(e) => setForm((s) => ({ ...s, mobileNo: e.target.value }))}
            />
          </label>

          <label>
            <span className="muted" style={{ fontWeight: 700 }}>Email</span>
            <input
              required
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
          </label>

          <label>
            <span className="muted" style={{ fontWeight: 700 }}>Password</span>
            <input
              required
              minLength={6}
              type="password"
              className="input"
              placeholder="Choose a strong password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            />
          </label>

          <label>
            <span className="muted" style={{ fontWeight: 700 }}>Confirm password</span>
            <input
              required
              minLength={6}
              type="password"
              className="input"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
            />
          </label>

          {error ? (
            <p style={{ margin: 0, color: 'var(--danger-500)', fontWeight: 600 }}>{error}</p>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </div>

        <p className="muted" style={{ marginTop: 16 }}>
          Already have access? <Link to="/login" style={{ color: '#9ed7ff', fontWeight: 700 }}>Login</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
