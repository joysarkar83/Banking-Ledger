import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RegisterPage = () => {
  const { register, verifyRegisterOtp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    mobileNo: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
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
      if (!otpRequested) {
        const { confirmPassword, ...payload } = form
        await register(payload)
        setOtpRequested(true)
      } else {
        await verifyRegisterOtp({
          name: form.name,
          mobileNo: form.mobileNo,
          email: form.email,
          password: form.password,
          otp,
        })

        setForm({
          name: '',
          mobileNo: '',
          email: '',
          password: '',
          confirmPassword: '',
        })
        setOtp('')
        setOtpRequested(false)
        navigate('/dashboard', { replace: true })
      }
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
          {otpRequested ? 'Enter the OTP sent to your email to finish registration.' : 'Start with your basics. We’ll keep the vault secure.'}
        </p>

        <div className="grid" style={{ gap: 12 }}>
          {!otpRequested ? (
            <>
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
            {loading ? 'Please wait...' : otpRequested ? 'Verify OTP & Register' : 'Send OTP'}
          </button>

          {otpRequested ? (
            <button
              type="button"
              className="btn btn-muted"
              onClick={() => {
                setOtpRequested(false)
                setOtp('')
                setError('')
              }}
            >
              Edit registration info
            </button>
          ) : null}
        </div>

        <p className="muted" style={{ marginTop: 16 }}>
          Already have access? <Link to="/login" style={{ color: '#9ed7ff', fontWeight: 700 }}>Login</Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
