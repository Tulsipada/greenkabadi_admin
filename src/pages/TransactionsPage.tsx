import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../api/client'
import { txnApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatDate } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { Transaction } from '../types'

export function TransactionsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<Transaction[]>([])
  const [mismatchOnly, setMismatchOnly] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (mismatchOnly) params.mismatch = 'true'
      setItems(await txnApi.list(token, params))
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, mismatchOnly])

  const downloadCsv = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_URL}/transactions/export.csv`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'text/csv' },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'transactions.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Export failed')
    }
  }

  return (
    <>
      <PageHeader
        title="Transactions"
        actions={
          <button type="button" className="btn btn-ghost btn-sm" onClick={downloadCsv}>
            Export CSV
          </button>
        }
      />
      <div className="admin-content">
        <div className="toolbar">
          <label className="row" style={{ fontSize: 13, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={mismatchOnly}
              onChange={(e) => setMismatchOnly(e.target.checked)}
            />
            Mismatch only
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Final</th>
                  <th>Paid</th>
                  <th>Mode</th>
                  <th>Paid at</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td className="muted" style={{ fontSize: 12 }}>
                      {t.orderId?.slice(0, 8)}…
                    </td>
                    <td>₹{t.finalAmount ?? '-'}</td>
                    <td>₹{t.amountPaid ?? '-'}</td>
                    <td>{t.paymentMode || '-'}</td>
                    <td>{formatDate(t.paidAt)}</td>
                    <td>
                      <Link className="btn btn-ghost btn-sm" to={`/transactions/${t.id}`}>
                        Edit paid
                      </Link>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={6} className="empty">
                      No transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
