import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bankingApi } from '../api/bankingApi'
import Navbar from '../components/Navbar'
import { formatINR } from '../utils/currency'
import { useAuth } from '../context/AuthContext'

const ITEMS_PER_PAGE = 5

const getTransactionType = (transaction, accountId) => {
  if (!accountId) return 'TRANSFER'
  if (String(transaction.fromAccount) === String(accountId)) return 'DEBIT'
  if (String(transaction.toAccount) === String(accountId)) return 'CREDIT'
  return 'TRANSFER'
}

const TransactionsPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchParams] = useSearchParams()

  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState(searchParams.get('accountId') || '')
  const [accountPin, setAccountPin] = useState('')
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState('')

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE))
  const currentTransactions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return transactions.slice(start, start + ITEMS_PER_PAGE)
  }, [page, transactions])

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true)
      setWarning('')
      try {
        const accountResponse = await bankingApi.getAllAccounts()
        const accountList = accountResponse.accounts || []
        setAccounts(accountList)

        const accountId = selectedAccountId || accountList[0]?._id || ''
        if (!selectedAccountId && accountId) {
          setSelectedAccountId(accountId)
        }
      } catch (err) {
        setWarning(err?.message || 'Unable to load transactions right now.')
      } finally {
        setLoading(false)
      }
    }

    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const handleAccountChange = async (event) => {
    const accountId = event.target.value
    setSelectedAccountId(accountId)
    setTransactions([])
    setPage(1)
  }

  const handleLoadTransactions = async () => {
    if (!selectedAccountId) {
      setWarning('Please choose an account first.')
      return
    }

    if (!/^\d{4}$/.test(accountPin)) {
      setWarning('Please enter your 4-digit account PIN.')
      return
    }

    setLoading(true)
    setWarning('')

    try {
      const historyResponse = await bankingApi.getTransactionHistory({ accountId: selectedAccountId, pin: accountPin })
      setTransactions(historyResponse.transactions || [])
      setPage(1)
    } catch (err) {
      if (err?.payload?.forceLogout) {
        await logout()
        navigate('/login', { replace: true })
        return
      }
      setWarning(err?.message || 'Unable to load transactions right now.')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (nextPage) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), totalPages)
    setPage(boundedPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <Navbar title="Transactions" />

        <section className="card transactions-filter-card" style={{ padding: 18, marginBottom: 16 }}>
          <div className="transactions-heading">
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem' }}>Transaction history</h2>
            </div>
            <div className="transactions-heading-actions">
              <button type="button" className="btn btn-muted" onClick={() => navigate('/dashboard')}>
                Back to dashboard
              </button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 12 }}>
              <span className="muted" style={{marginBottom: 8, fontWeight: 700}}>Select account</span>
              <select className="select" value={selectedAccountId} onChange={handleAccountChange}>
                <option value="">Choose an account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account._id} • {account.status} • {account.currency || 'INR'}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span className="muted" style={{marginBottom: 8, fontWeight: 700}}>Account PIN</span>
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

            <button type="button" className="btn btn-primary" onClick={handleLoadTransactions} disabled={loading}>
              {loading ? 'Loading transactions...' : 'Load Transactions'}
            </button>
          </div>
        </section>

        <section className="card transactions-list-card" style={{ padding: 18 }}>
          <div className="transactions-list-top" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Transactions</h3>
              <p className="muted" style={{ margin: '6px 0 0' }}>
                Page {page} of {totalPages}
              </p>
            </div>
            <div className="transactions-nav">
              <button type="button" className="btn btn-muted" onClick={() => handlePageChange(page - 1)} disabled={loading || page <= 1}>
                Previous
              </button>
              <button type="button" className="btn btn-muted" onClick={() => handlePageChange(page + 1)} disabled={loading || page >= totalPages}>
                Next
              </button>
            </div>
          </div>

          {loading ? (
            <p className="muted">Loading transactions...</p>
          ) : !/^\d{4}$/.test(accountPin) ? (
            <p className="muted" style={{ marginBottom: 0 }}>
              Enter your 4-digit account PIN to load transactions.
            </p>
          ) : currentTransactions.length === 0 ? (
            <p className="muted" style={{ marginBottom: 0 }}>
              No transactions found for the selected account.
            </p>
          ) : (
            <div className="grid" style={{ gap: 10 }}>
              {currentTransactions.map((transaction) => (
                <article key={transaction._id} className="card transaction-item">
                  <div className="transaction-item-head">
                    <p style={{ margin: 0, fontWeight: 700 }}>{formatINR(transaction.amount)}</p>
                    <div className="transaction-item-badges">
                      <span className="pill">{getTransactionType(transaction, selectedAccountId)}</span>
                      <span className={`pill status-${String(transaction.status || '').toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <p className="muted transaction-route" style={{ margin: '6px 0 4px', fontSize: 12 }}>
                    {String(transaction.fromAccount)} → {String(transaction.toAccount)}
                  </p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    {new Date(transaction.createdAt).toLocaleString('en-IN')}
                  </p>
                </article>
              ))}
            </div>
          )}

          {transactions.length > 0 ? (
            <div className="transactions-page-list" style={{ marginTop: 18 }}>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className="btn"
                  onClick={() => handlePageChange(pageNumber)}
                  style={{
                    background: pageNumber === page ? 'linear-gradient(135deg, var(--accent-500), var(--accent-400))' : 'rgba(123, 141, 204, 0.16)',
                    color: '#fff',
                  }}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default TransactionsPage
