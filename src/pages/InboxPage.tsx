import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatAddress, formatDate } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { Order } from '../types'

export function InboxPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        setOrders(await ordersApi.list(token, 'waiting'))
      } catch (e: unknown) {
        setError((e as { message?: string })?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  return (
    <>
      <PageHeader title="Inbox" />
      <div className="admin-content">
        <p className="muted" style={{ marginTop: 0 }}>
          Pending pickups waiting for a collector.
        </p>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Pickup</th>
                  <th>Weight</th>
                  <th>Address</th>
                  <th>Customer</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.title}</strong>
                      <div className="muted">{o.material || o.category?.name}</div>
                    </td>
                    <td>{o.approxWeight != null ? `${o.approxWeight} kg` : '-'}</td>
                    <td>{formatAddress(o) || '-'}</td>
                    <td>{o.customer?.name || '-'}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>
                      <Link className="btn btn-primary btn-sm" to={`/orders/${o.id}/assign`}>
                        Assign
                      </Link>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={6} className="empty">
                      Inbox empty
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
