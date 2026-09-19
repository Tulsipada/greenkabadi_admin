import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { txnApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatDate } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { Transaction } from '../types'

export function TransactionEditPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [txn, setTxn] = useState<Transaction | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token || !id) return
    ;(async () => {
      try {
        const t = await txnApi.get(token, id)
        setTxn(t)
        setAmount(String(t.amountPaid ?? t.finalAmount ?? ''))
      } catch (e: unknown) {
        setError((e as { message?: string })?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [token, id])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !id) return
    setSaving(true)
    setError('')
    try {
      await txnApi.patchPaid(token, id, Number(amount))
      navigate('/transactions')
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Edit paid amount"
        actions={
          <Link className="btn btn-ghost btn-sm" to="/transactions">
            Back
          </Link>
        }
      />
      <div className="admin-content">
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error}</p>}
        {txn && (
          <form className="card" style={{ maxWidth: 420 }} onSubmit={onSubmit}>
            <p className="muted">Order {txn.orderId}</p>
            <p>Final amount: ₹{txn.finalAmount ?? '-'}</p>
            <p className="muted">Paid at: {formatDate(txn.paidAt)}</p>
            <div className="field">
              <label>Amount paid (₹)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
