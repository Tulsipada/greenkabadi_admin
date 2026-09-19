import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ordersApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatAddress, formatDate, StatusChip } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { Order, User } from '../types'

export function AssignPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [collectors, setCollectors] = useState<User[]>([])
  const [collectorId, setCollectorId] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token || !id) return
    ;(async () => {
      setLoading(true)
      try {
        const [o, c] = await Promise.all([
          ordersApi.get(token, id),
          ordersApi.collectors(token),
        ])
        setOrder(o)
        setCollectors(c)
        if (c[0]) setCollectorId(c[0].id)
      } catch (e: unknown) {
        setError((e as { message?: string })?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [token, id])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !id || !collectorId) return
    setSaving(true)
    setError('')
    try {
      await ordersApi.assign(token, id, collectorId, note.trim() || undefined)
      navigate('/jobs')
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Assign failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Assign collector"
        actions={
          <Link className="btn btn-ghost btn-sm" to="/inbox">
            Back to inbox
          </Link>
        }
      />
      <div className="admin-content">
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error}</p>}
        {order && (
          <div className="grid-2">
            <div className="card stack">
              <div>
                <strong>{order.title}</strong>
                <div style={{ marginTop: 8 }}>
                  <StatusChip status={order.status} />
                </div>
              </div>
              <div className="muted">{formatAddress(order)}</div>
              <div>
                Customer: {order.customer?.name || '-'}
                {order.customer?.phone ? ` · ${order.customer.phone}` : ''}
              </div>
              <div className="muted">Created {formatDate(order.createdAt)}</div>
              {order.approxWeight != null && <div>~{order.approxWeight} kg</div>}
              {order.instructions && <div>{order.instructions}</div>}
            </div>
            <form className="card" onSubmit={onSubmit}>
              <div className="field">
                <label>Collector</label>
                <select
                  value={collectorId}
                  onChange={(e) => setCollectorId(e.target.value)}
                  required
                >
                  {!collectors.length && <option value="">No active collectors</option>}
                  {collectors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Note (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={saving || !collectors.length}
              >
                {saving ? 'Assigning…' : 'Assign'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
