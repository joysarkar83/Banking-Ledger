import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bankingApi } from '../api/bankingApi'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { formatINR } from '../utils/currency'
import { createIdempotencyKey } from '../utils/idempotency'

const DashboardPage = () => {
  const { user, isSystemUser, logout } = useAuth()
  const navigate = useNavigate()
  const accountsListRef = useRef(null)

  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState('')
  const [accountPin, setAccountPin] = useState('')
  const [transferForm, setTransferForm] = useState({
    toAccount: '',
    amount: '',
    pin: '',
  })
  const [depositForm, setDepositForm] = useState({
    toAccount: '',
    amount: '',
  })

  const selectedAccount = useMemo(
    () => accounts.find((account) => account._id === selectedAccountId) || null,
    [accounts, selectedAccountId],
  )

  useEffect(() => {
    if (!warning) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setWarning('')
    }, 3500)

    return () => window.clearTimeout(timeoutId)
  }, [warning])

  const withLoader = async (work) => {
    setLoading(true)
    setWarning('')
    try {
      await work()
    } catch (err) {
      if (err?.payload?.forceLogout) {
        await logout()
        navigate('/login', { replace: true })
        return
      }
      setWarning(err?.message || 'Action failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadAccounts = async () => {
    await withLoader(async () => {
      const data = await bankingApi.getAllAccounts()
      setAccounts(data.accounts || [])
      if (!selectedAccountId && data.accounts?.length) {
        setSelectedAccountId(data.accounts[0]._id)
      }
      window.requestAnimationFrame(() => {
        accountsListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  useEffect(() => {
    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onShowBalance = async () => {
    if (!selectedAccountId) {
      setWarning('Please select an account first.')
      return
    }

    if (!/^\d{4}$/.test(accountPin)) {
      setWarning('Please enter your 4-digit account PIN.')
      return
    }

    await withLoader(async () => {
      const data = await bankingApi.getBalance({ accountId: selectedAccountId, pin: accountPin })
      setBalance(data.balance)
    })
  }

  const onShowTransactions = async () => {
    if (!selectedAccountId) {
      setWarning('Please select an account first.')
      return
    }

    navigate(`/transactions?accountId=${selectedAccountId}`)
  }

  const onTransfer = async (event) => {
    event.preventDefault()

    if (!selectedAccountId) {
      setWarning('Please choose an account from the All Accounts section first.')
      return
    }

    if (!/^\d{4}$/.test(transferForm.pin)) {
      setWarning('Please enter your 4-digit account PIN for transfer.')
      return
    }

    await withLoader(async () => {
      await bankingApi.transfer({
        fromAccount: selectedAccountId,
        toAccount: transferForm.toAccount,
        amount: Number(transferForm.amount),
        pin: transferForm.pin,
        idempotencyKey: createIdempotencyKey(),
      })

      setTransferForm({ toAccount: '', amount: '', pin: '' })
      await loadAccounts()
      const data = await bankingApi.getBalance({ accountId: selectedAccountId, pin: accountPin })
      setBalance(data.balance)
    })
  }

  const onDeposit = async (event) => {
    event.preventDefault()

    await withLoader(async () => {
      await bankingApi.deposit({
        toAccount: depositForm.toAccount,
        amount: Number(depositForm.amount),
        idempotencyKey: createIdempotencyKey(),
      })

      setDepositForm({ toAccount: '', amount: '' })
      await loadAccounts()
    })
  }

  return (
    <div className="app-shell">
      {warning ? (
        <div className="floating-warning" role="status" aria-live="polite">
          <div>
            <strong>Warning</strong>
            <p>{warning}</p>
          </div>
          <button type="button" className="floating-warning-close" onClick={() => setWarning('')} aria-label="Dismiss warning">
            ×
          </button>
        </div>
      ) : null}
      <div className="container">
        <Navbar title="Dashboard" />

        <div className="grid grid-cols-2" style={{ marginBottom: 16 }}>
          <article className="card" style={{ padding: 16 }}>
            <p className="muted" style={{ marginTop: 0, fontWeight: 700 }}>Logged in as</p>
            <h3 style={{ marginTop: 8}}>{user?.name || 'User'}</h3>
            <p className="muted" style={{ margin: 0 }}>{user?.email}</p>
          </article>

          <article className="card" style={{ padding: 16 }}>
            <p className="muted" style={{ marginTop: 0, fontWeight: 700 }}>Role</p>
            <h3 style={{ marginTop: 8}}>{isSystemUser ? 'System User' : 'Standard User'}</h3>
          </article>
        </div>

        <section ref={accountsListRef} className="card accounts-panel" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 700 }}>All accounts</h3>
              <p className="muted" style={{ marginTop: 8}}>
                Scroll through every account tied to this profile.
              </p>
            </div>
          </div>

          <div className="accounts-scroll">
            {accounts.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                No accounts found yet.
              </p>
            ) : (
              <div className="grid" style={{ gap: 10 }}>
                {accounts.map((account, index) => {
                  const isSelected = account._id === selectedAccountId
                  return (
                    <button
                      key={account._id}
                      type="button"
                      className="card account-item"
                      onClick={() => setSelectedAccountId(account._id)}
                      style={{
                        borderColor: isSelected ? 'rgba(89, 182, 255, 0.75)' : 'rgba(146, 163, 219, 0.22)',
                        boxShadow: isSelected ? '0 0 0 1px rgba(89, 182, 255, 0.35)' : 'none',
                      }}
                    >
                      <div className="account-item-head">
                        <div>
                          <p style={{ margin: 0, fontWeight: 700 }}>Account #{index + 1}</p>
                          <p className="muted" style={{ margin: '6px 0 0', fontSize: 12, wordBreak: 'break-all' }}>
                            {account._id}
                          </p>
                        </div>
                        <div className="account-item-badges">
                          <span className="pill">{account.status}</span>
                          <span className="pill">{account.currency || 'INR'}</span>
                          {isSelected ? <span className="pill">Selected</span> : null}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2" style={{ alignItems: 'start' }}>
          <section className="card" style={{ padding: 18 }}>
            <h3 style={{ marginTop: 0, fontWeight: 700 }}>Account operations</h3>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span className="muted" style={{ fontWeight: 700 }}>Account PIN</span>
              <input
                required
                className="input"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={accountPin}
                onChange={(e) => setAccountPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </label>

            <div className="account-actions">
              <button type="button" className="btn btn-muted" onClick={onShowBalance}>
                Show Balance
              </button>
              <button type="button" className="btn btn-muted" onClick={onShowTransactions}>
                Show Transactions
              </button>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <p className="muted" style={{ margin: 0 }}>Current balance</p>
              <h2 style={{ margin: '8px 0 0' }}>{formatINR(balance)}</h2>
              {selectedAccount ? (
                <p className="muted selected-account-id" style={{ marginBottom: 0 }}>
                  Selected: {selectedAccount._id}
                </p>
              ) : null}
            </div>
          </section>

          {!isSystemUser ? (
            <section className="card" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0, fontWeight: 700}}>Transfer money</h3>
              <p className="muted" style={{ marginTop: 8, marginBottom: 8}}>
                Source account is the selected account from the list above.
              </p>
              <form className="grid" onSubmit={onTransfer}>
                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>From account</span>
                  <input
                    className="input"
                    value={selectedAccountId}
                    readOnly
                    placeholder="Select account from list"
                  />
                </label>
                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>To account</span>
                  <input
                    required
                    className="input"
                    value={transferForm.toAccount}
                    onChange={(e) => setTransferForm((current) => ({ ...current, toAccount: e.target.value }))}
                    placeholder="Destination account ID"
                  />
                </label>
                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>Amount (₹)</span>
                  <input
                    required
                    min={1}
                    step="0.01"
                    type="number"
                    className="input"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm((current) => ({ ...current, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </label>

                <label>
                  <span className="muted" style={{ fontWeight: 700 }}>Account PIN</span>
                  <input
                    required
                    className="input"
                    type="password"
                    inputMode="numeric"
                    pattern="\d{4}"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                    value={transferForm.pin}
                    onChange={(e) => setTransferForm((current) => ({ ...current, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  />
                </label>

                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Transferring...' : 'Transfer Money'}
                </button>
              </form>
            </section>
          ) : (
            <section className="card" style={{ padding: 18 }}>
              <h3 style={{ marginTop: 0 }}>Deposit to account</h3>
              <form className="grid" onSubmit={onDeposit}>
                <label>
                  <span className="muted">To account</span>
                  <input
                    required
                    className="input"
                    value={depositForm.toAccount}
                    onChange={(e) => setDepositForm((current) => ({ ...current, toAccount: e.target.value }))}
                    placeholder="Recipient account ID"
                  />
                </label>
                <label>
                  <span className="muted">Amount (₹)</span>
                  <input
                    required
                    min={1}
                    step="0.01"
                    type="number"
                    className="input"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm((current) => ({ ...current, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </label>

                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Depositing...' : 'Deposit'}
                </button>
              </form>
            </section>
          )}
        </div>

      </div>
    </div>
  )
}

export default DashboardPage
