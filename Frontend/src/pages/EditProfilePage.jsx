import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { bankingApi } from '../api/bankingApi'
import { useAuth } from '../context/AuthContext'

export const EditProfilePage = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    name: '',
    mobileNo: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (!user) return

    setForm((current) => ({
      ...current,
      name: user.name || '',
      mobileNo: user.mobileNo || '',
      email: user.email || '',
    }))
  }, [user])

  useEffect(() => {
    if (!warning) return undefined

    const timeoutId = window.setTimeout(() => setWarning(''), 3500)
    return () => window.clearTimeout(timeoutId)
  }, [warning])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.oldPassword) {
      setWarning('Old password is required to confirm profile changes.')
      return
    }

    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      setWarning('New password and confirmation do not match.')
      return
    }

    setLoading(true)
    setWarning('')

    try {
      const payload = {
        name: form.name,
        mobileNo: form.mobileNo,
        email: form.email,
        oldPassword: form.oldPassword,
        newPassword: form.newPassword || undefined,
      }

      await bankingApi.editProfile(payload)
      await refreshUser()
      setWarning('Profile updated successfully.')
      setForm((current) => ({
        ...current,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }))
    } catch (error) {
      setWarning(error?.message || 'Unable to update your profile right now.')
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
        <Navbar title="Edit Profile" />

        <section className="card" style={{ padding: 20, maxWidth: 760 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginTop: 0, fontWeight: 700, fontSize: '1.25rem' }}>Update your profile</h2>
            </div>
            <button type="button" className="btn btn-muted" onClick={() => navigate('/profile')}>
              Back to profile
            </button>
          </div>

          <form className="grid" style={{ marginTop: 18 }} onSubmit={handleSubmit}>
            <label>
              <span className="muted"  style={{ fontWeight: 700 }}>Full name</span>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              />
            </label>

            <label>
              <span className="muted" style={{ fontWeight: 700 }}>Mobile number</span>
              <input
                className="input"
                value={form.mobileNo}
                onChange={(e) => setForm((current) => ({ ...current, mobileNo: e.target.value }))}
              />
            </label>

            <label>
              <span className="muted" style={{ fontWeight: 700 }}>Email</span>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              />
            </label>

            <label>
              <span className="muted" style={{ fontWeight: 700 }}>Old password (required)</span>
              <input
                required
                minLength={6}
                type="password"
                className="input"
                placeholder="Enter current password"
                value={form.oldPassword}
                onChange={(e) => setForm((current) => ({ ...current, oldPassword: e.target.value }))}
              />
            </label>

            <label>
              <span className="muted" style={{ fontWeight: 700 }}>New password (optional)</span>
              <input
                minLength={6}
                type="password"
                className="input"
                placeholder="Leave blank to keep current password"
                value={form.newPassword}
                onChange={(e) => setForm((current) => ({ ...current, newPassword: e.target.value }))}
              />
            </label>

            <label>
              <span className="muted" style={{ fontWeight: 700 }}>Confirm new password</span>
              <input
                minLength={6}
                type="password"
                className="input"
                placeholder="Re-enter new password"
                value={form.confirmNewPassword}
                onChange={(e) => setForm((current) => ({ ...current, confirmNewPassword: e.target.value }))}
              />
            </label>

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default EditProfilePage