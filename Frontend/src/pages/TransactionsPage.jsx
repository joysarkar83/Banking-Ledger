import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bankingApi } from '../api/bankingApi'
import Navbar from '../components/Navbar'
import { formatINR } from '../utils/currency'

const ITEMS_PER_PAGE = 5

const getTransactionType = (transaction, accountId) => {
  if (!accountId) return 'TRANSFER'
  if (String(transaction.fromAccount) === String(accountId)) return 'DEBIT'
  if (String(transaction.toAccount) === String(accountId)) return 'CREDIT'
  return 'TRANSFER'
}

const TransactionsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [accounts, setAccounts] = useState([])
  const [selectedAccountId, setSelectedAccountId] = useState(searchParams.get('accountId') || '')
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState('')

  const selectedAccount = useMemo(
    () => accounts.find((account) => account._id === selectedAccountId) || null,
    [accounts, selectedAccountId],
  )

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE))
  const currentTransactions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return transactions.slice(start, start + ITEMS_PER_PAGE)
  }, [page, transactions])

  useEffect(() => {
    const loadData = async () => {
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

        if (!accountId) {
          setTransactions([])
          return
        }

        const historyResponse = await bankingApi.getTransactionHistory({ accountId })
        setTransactions(historyResponse.transactions || [])
        setPage(1)
      } catch (err) {
        setWarning(err?.message || 'Unable to load transactions right now.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const handleAccountChange = async (event) => {
    const accountId = event.target.value
    setSelectedAccountId(accountId)
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

        <section className="card" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem' }}>Transaction history</h2>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
          </div>
        </section>

        <section className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0 }}>Transactions</h3>
              <p className="muted" style={{ margin: '6px 0 0' }}>
                Page {page} of {totalPages}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
          ) : currentTransactions.length === 0 ? (
            <p className="muted" style={{ marginBottom: 0 }}>
              No transactions found for the selected account.
            </p>
          ) : (
            <div className="grid" style={{ gap: 10 }}>
              {currentTransactions.map((transaction) => (
                <article key={transaction._id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 700 }}>{formatINR(transaction.amount)}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span className="pill">{getTransactionType(transaction, selectedAccountId)}</span>
                      <span className={`pill status-${String(transaction.status || '').toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <p className="muted" style={{ margin: '6px 0 4px', fontSize: 12 }}>
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
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
