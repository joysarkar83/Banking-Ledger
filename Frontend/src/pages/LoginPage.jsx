import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bankingApi } from '../api/bankingApi'

const LoginPage = () => {
  const { login, verifyLoginOtp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStage, setForgotPasswordStage] = useState('request')
  const [forgotForm, setForgotForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'
  const loginMessage = location.state?.message || ''

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!pendingEmail) {
        await login(form)
        setPendingEmail(form.email)
        return
      }

      await verifyLoginOtp({ email: pendingEmail, otp })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message || 'Unable to sign in right now.')
    } finally {
      setLoading(false)
    }
  }

  const onForgotPasswordSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      if (forgotPasswordStage === 'request') {
        await bankingApi.forgotPassword({ email: forgotForm.email })
        setForgotPasswordStage('reset')
      } else {
        if (forgotForm.newPassword !== forgotForm.confirmPassword) {
          setError('New password and confirmation do not match.')
          setLoading(false)
          return
        }

        await bankingApi.resetPassword({
          email: forgotForm.email,
          otp: forgotForm.otp,
          newPassword: forgotForm.newPassword,
        })

        setShowForgotPassword(false)
        setForgotPasswordStage('request')
        setForgotForm({ email: '', otp: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) {
      setError(err?.message || 'Unable to process password reset right now.')
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
          {pendingEmail ? 'Enter the OTP sent to your email.' : 'Login to your banking portal.'}
        </p>

        {loginMessage ? (
          <div
            className="card"
            style={{
              marginBottom: 16,
              padding: 12,
              borderColor: 'rgba(255, 193, 7, 0.45)',
              background: 'rgba(255, 193, 7, 0.08)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--warning-500)' }}>{loginMessage}</p>
          </div>
        ) : null}

        <div className="grid" style={{ gap: 12 }}>
          {!pendingEmail ? (
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
            {loading ? 'Please wait...' : pendingEmail ? 'Verify OTP' : 'Send OTP'}
          </button>

          {pendingEmail ? (
            <button
              type="button"
              className="btn btn-muted"
              onClick={() => {
                setPendingEmail('')
                setOtp('')
                setError('')
              }}
            >
              Edit credentials
            </button>
          ) : null}
        </div>

        <button
          type="button"
          className="btn btn-muted"
          style={{ marginTop: 12, width: '100%' }}
          onClick={() => {
            setShowForgotPassword((current) => !current)
            setError('')
            setForgotPasswordStage('request')
          }}
        >
          {showForgotPassword ? 'Close forgot password' : 'Forgot password?'}
        </button>

        {showForgotPassword ? (
          <div className="grid" style={{ gap: 10, marginTop: 12 }}>
            <label>
              <span className="muted" style={{ fontWeight: 700 }}>Email</span>
              <input
                required
                type="email"
                className="input"
                value={forgotForm.email}
                onChange={(e) => setForgotForm((current) => ({ ...current, email: e.target.value }))}
                placeholder="you@example.com"
              />
            </label>

            {forgotPasswordStage === 'reset' ? (
              <>
                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>OTP</span>
                  <input
                    required
                    minLength={6}
                    maxLength={6}
                    inputMode="numeric"
                    className="input"
                    value={forgotForm.otp}
                    onChange={(e) => setForgotForm((current) => ({ ...current, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="Enter 6-digit OTP"
                  />
                </label>
                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>New password</span>
                  <input
                    required
                    minLength={6}
                    type="password"
                    className="input"
                    value={forgotForm.newPassword}
                    onChange={(e) => setForgotForm((current) => ({ ...current, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </label>
                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>Confirm new password</span>
                  <input
                    required
                    minLength={6}
                    type="password"
                    className="input"
                    value={forgotForm.confirmPassword}
                    onChange={(e) => setForgotForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                  />
                </label>
              </>
            ) : null}

            <button className="btn btn-primary" type="button" onClick={onForgotPasswordSubmit} disabled={loading}>
              {loading ? 'Please wait...' : forgotPasswordStage === 'request' ? 'Send password reset OTP' : 'Reset password'}
            </button>
          </div>
        ) : null}

        <p className="muted" style={{ marginTop: 16 }}>
          New user? <Link to="/register" style={{ color: '#9ed7ff', fontWeight: 700 }}>Create an account</Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
