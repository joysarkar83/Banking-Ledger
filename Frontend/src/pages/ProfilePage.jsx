import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { bankingApi } from '../api/bankingApi'
import { useAuth } from '../context/AuthContext'

const initialFormState = {
  pin: '',
  confirmPin: '',
  currency: 'INR',
}

const ProfilePage = () => {
  const { user, isSystemUser } = useAuth()
  const navigate = useNavigate()
  const [createAccountForm, setCreateAccountForm] = useState(initialFormState)
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!warning) return undefined

    const timeoutId = window.setTimeout(() => setWarning(''), 3500)
    return () => window.clearTimeout(timeoutId)
  }, [warning])

  const handleCreateAccount = async (event) => {
    event.preventDefault()
    setLoading(true)
    setWarning('')

    try {
      if (!/^\d{4}$/.test(createAccountForm.pin)) {
        setWarning('Please provide a valid 4-digit PIN.')
        setLoading(false)
        return
      }

      if (createAccountForm.pin !== createAccountForm.confirmPin) {
        setWarning('PIN and confirm PIN do not match.')
        setLoading(false)
        return
      }

      const payload = {
        pin: createAccountForm.pin,
        currency: createAccountForm.currency,
      }

      await bankingApi.createAccount(payload)
      setCreateAccountForm(initialFormState)
      setWarning('Bank account created successfully.')
    } catch (error) {
      setWarning(error?.message || 'Unable to create the account right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      {warning ? (
        <div className="floating-warning" role="status" aria-live="polite">
          <div>
            <strong>Profile update</strong>
            <p>{warning}</p>
          </div>
          <button type="button" className="floating-warning-close" onClick={() => setWarning('')} aria-label="Dismiss warning">
            ×
          </button>
        </div>
      ) : null}
      <div className="container">
        <Navbar title="Profile" />

        <div className="grid grid-cols-2" style={{ alignItems: 'start' }}>
          <section className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0, fontWeight: 700, fontSize: '1.25rem' }}>Profile details</h2>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <button type="button" className="btn btn-muted" onClick={() => navigate('/edit-profile')}>
                Edit Profile
              </button>
            </div>

            <div className="grid" style={{ marginTop: 12 }}>
              <div>
                <p className="muted" style={{ margin: '0 0 4px' }}>Name</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{user?.name || '—'}</p>
              </div>
              <div>
                <p className="muted" style={{ margin: '0 0 4px' }}>Email</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{user?.email || '—'}</p>
              </div>
              <div>
                <p className="muted" style={{ margin: '0 0 4px' }}>Mobile</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{user?.mobileNo || '—'}</p>
              </div>
              <div>
                <p className="muted" style={{ margin: '0 0 4px' }}>Role</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{isSystemUser ? 'System User' : 'Standard User'}</p>
              </div>
            </div>
          </section>

          <section className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Create bank account</h2>
            <p className="muted" style={{paddingBottom: 16}}>Create additional accounts for your profile.</p>

            <form className="grid" onSubmit={handleCreateAccount}>
              <label>
                <span className="muted" style={{fontWeight: 700}}>4-digit PIN</span>
                <input
                  required
                  className="input"
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  placeholder="****"
                  value={createAccountForm.pin}
                  onChange={(e) => setCreateAccountForm((current) => ({ ...current, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                />
              </label>

              <label>
                <span className="muted" style={{fontWeight: 700}}>Confirm PIN</span>
                <input
                  required
                  className="input"
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  placeholder="****"
                  value={createAccountForm.confirmPin}
                  onChange={(e) => setCreateAccountForm((current) => ({ ...current, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                />
              </label>

              <label>
                <span className="muted" style={{fontWeight: 700}}>Currency</span>
                <input
                  className="input"
                  value={createAccountForm.currency}
                  onChange={(e) => setCreateAccountForm((current) => ({ ...current, currency: e.target.value.toUpperCase() }))}
                />
              </label>

              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Bank Account'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
