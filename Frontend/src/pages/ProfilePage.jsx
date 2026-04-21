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
  const [accounts, setAccounts] = useState([])
  const [createAccountForm, setCreateAccountForm] = useState(initialFormState)
  const [pinResetForm, setPinResetForm] = useState({
    accountId: '',
    otp: '',
    newPin: '',
    confirmNewPin: '',
  })
  const [otpSentForPinReset, setOtpSentForPinReset] = useState(false)
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)

  const loadAccounts = async () => {
    const data = await bankingApi.getAllAccounts()
    const accountList = data.accounts || []
    setAccounts(accountList)

    if (!pinResetForm.accountId && accountList.length) {
      setPinResetForm((current) => ({
        ...current,
        accountId: accountList[0]._id,
      }))
    }
  }

  useEffect(() => {
    loadAccounts().catch(() => {
      setWarning('Unable to load accounts right now.')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      await loadAccounts()
    } catch (error) {
      setWarning(error?.message || 'Unable to create the account right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendPinResetOtp = async (event) => {
    event.preventDefault()
    setPinLoading(true)
    setWarning('')

    try {
      if (!pinResetForm.accountId) {
        setWarning('Please select an account for PIN reset.')
        setPinLoading(false)
        return
      }

      await bankingApi.forgotPin({ accountId: pinResetForm.accountId })
      setOtpSentForPinReset(true)
      setWarning('OTP sent for PIN reset. Please check your email.')
    } catch (error) {
      setWarning(error?.message || 'Unable to send PIN reset OTP right now.')
    } finally {
      setPinLoading(false)
    }
  }

  const handleResetPin = async (event) => {
    event.preventDefault()
    setPinLoading(true)
    setWarning('')

    try {
      if (!/^\d{4}$/.test(pinResetForm.newPin)) {
        setWarning('Please provide a valid 4-digit new PIN.')
        setPinLoading(false)
        return
      }

      if (pinResetForm.newPin !== pinResetForm.confirmNewPin) {
        setWarning('New PIN and confirm PIN do not match.')
        setPinLoading(false)
        return
      }

      await bankingApi.resetPin({
        accountId: pinResetForm.accountId,
        otp: pinResetForm.otp,
        newPin: pinResetForm.newPin,
      })

      setOtpSentForPinReset(false)
      setPinResetForm((current) => ({
        ...current,
        otp: '',
        newPin: '',
        confirmNewPin: '',
      }))
      setWarning('Account PIN reset successfully.')
    } catch (error) {
      setWarning(error?.message || 'Unable to reset account PIN right now.')
    } finally {
      setPinLoading(false)
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

          <section className="card" style={{ padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Change account PIN</h2>
            <p className="muted" style={{ paddingBottom: 16 }}>PIN reset is account-specific and verified via OTP.</p>

            <form className="grid" onSubmit={handleSendPinResetOtp}>
              <label>
                <span className="muted" style={{ fontWeight: 700 }}>Select account</span>
                <select
                  className="select"
                  required
                  value={pinResetForm.accountId}
                  onChange={(e) => setPinResetForm((current) => ({ ...current, accountId: e.target.value }))}
                >
                  <option value="">Choose account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account._id} • {account.status} • {account.currency || 'INR'}
                    </option>
                  ))}
                </select>
              </label>

              <button className="btn btn-muted" type="submit" disabled={pinLoading}>
                {pinLoading ? 'Sending OTP...' : 'Send PIN reset OTP'}
              </button>
            </form>

            {otpSentForPinReset ? (
              <form className="grid" style={{ marginTop: 14 }} onSubmit={handleResetPin}>
                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>OTP</span>
                  <input
                    required
                    minLength={6}
                    maxLength={6}
                    inputMode="numeric"
                    className="input"
                    placeholder="Enter 6-digit OTP"
                    value={pinResetForm.otp}
                    onChange={(e) => setPinResetForm((current) => ({ ...current, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  />
                </label>

                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>New 4-digit PIN</span>
                  <input
                    required
                    className="input"
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    placeholder="****"
                    value={pinResetForm.newPin}
                    onChange={(e) => setPinResetForm((current) => ({ ...current, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  />
                </label>

                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>Confirm new PIN</span>
                  <input
                    required
                    className="input"
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    placeholder="****"
                    value={pinResetForm.confirmNewPin}
                    onChange={(e) => setPinResetForm((current) => ({ ...current, confirmNewPin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  />
                </label>

                <button className="btn btn-primary" type="submit" disabled={pinLoading}>
                  {pinLoading ? 'Resetting PIN...' : 'Reset PIN'}
                </button>
              </form>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
