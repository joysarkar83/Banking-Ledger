import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { login, verifyLoginOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [pendingUserId, setPendingUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!pendingUserId) {
        const response = await login(form)
        setPendingUserId(response?.userId || '')
        return
      }

      await verifyLoginOtp({ userId: pendingUserId, otp })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message || 'Unable to sign in right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell auth-wrap">
      <form className="card auth-card" onSubmit={onSubmit}>
        <p className="pill">Welcome back</p>
        <h2 style={{ marginTop: 12, fontSize: '1.5rem', fontWeight: 700 }}>Banking Ledger</h2>
        <p className="muted" style={{ marginBottom: 20 }}>
          {pendingUserId ? 'Enter the OTP sent to your email.' : 'Login to your banking portal.'}
        </p>

        <div className="grid" style={{ gap: 12 }}>
          {!pendingUserId ? (
            <>
              <label>
                <span className="muted" style={{fontWeight: 700}}>Email</span>
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
                <span className="muted" style={{fontWeight: 700}}>Password</span>
                <input
                  required
                  minLength={6}
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                />
              </label>
            </>
          ) : (
            <label>
              <span className="muted" style={{ fontWeight: 700 }}>One-time password</span>
              <input
                required
                minLength={6}
                maxLength={6}
                inputMode="numeric"
                pattern="\d{6}"
                className="input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </label>
          )}

          {error ? (
            <p style={{ margin: 0, color: 'var(--danger-500)', fontWeight: 600 }}>{error}</p>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : pendingUserId ? 'Verify OTP' : 'Send OTP'}
          </button>

          {pendingUserId ? (
            <button
              type="button"
              className="btn btn-muted"
              onClick={() => {
                setPendingUserId('')
                setOtp('')
                setError('')
              }}
            >
              Edit credentials
            </button>
          ) : null}
        </div>

        <p className="muted" style={{ marginTop: 16 }}>
          New user? <Link to="/register" style={{ color: '#9ed7ff', fontWeight: 700 }}>Create an account</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
