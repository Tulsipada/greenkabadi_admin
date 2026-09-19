import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi, usersApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatDate, StatusChip } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { Order } from '../types'

export function DashboardPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        const [o, u] = await Promise.all([
          ordersApi.list(token),
          usersApi.list(token, 'customer'),
        ])
        setOrders(o)
        setCustomers(u.length)
      } catch (e: unknown) {
        setError((e as { message?: string })?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const waiting = orders.filter((o) => o.status === 'waiting').length
  const inProgress = orders.filter((o) =>
    ['assigned', 'enroute', 'collected'].includes(o.status),
  ).length
  const completed = orders.filter((o) => o.status === 'completed').length
  const recent = orders.slice(0, 8)

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="admin-content">
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <div className="stat-grid">
              <div className="stat">
                <div className="label">New (waiting)</div>
                <div className="value">{waiting}</div>
              </div>
              <div className="stat">
                <div className="label">In progress</div>
                <div className="value">{inProgress}</div>
              </div>
              <div className="stat">
                <div className="label">Completed</div>
                <div className="value">{completed}</div>
              </div>
              <div className="stat">
                <div className="label">Customers</div>
                <div className="value">{customers}</div>
              </div>
            </div>
            <div className="toolbar">
              <h2 style={{ margin: 0, fontSize: 16 }}>Recent pickups</h2>
              <div className="row">
                <Link className="btn btn-ghost btn-sm" to="/inbox">
                  Inbox
                </Link>
                <Link className="btn btn-primary btn-sm" to="/jobs">
                  All jobs
                </Link>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td>{o.title}</td>
                      <td>
                        <StatusChip status={o.status} />
                      </td>
                      <td>{o.customer?.name || '-'}</td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td>
                        {o.status === 'waiting' ? (
                          <Link className="btn btn-primary btn-sm" to={`/orders/${o.id}/assign`}>
                            Assign
                          </Link>
                        ) : (
                          <Link className="btn btn-ghost btn-sm" to={`/jobs?id=${o.id}`}>
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!recent.length && (
                    <tr>
                      <td colSpan={5} className="empty">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}
