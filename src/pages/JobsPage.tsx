import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ordersApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatDate, StatusChip } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { Order, OrderStatus } from '../types'

type Filter = 'active' | 'done' | 'all'

const ACTIVE: OrderStatus[] = ['waiting', 'assigned', 'enroute', 'collected']
const DONE: OrderStatus[] = ['completed', 'cancelled']

export function JobsPage() {
  const { token } = useAuth()
  const [params, setParams] = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<Filter>('active')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const highlight = params.get('id')

  useEffect(() => {
    if (!token) return
    ;(async () => {
      setLoading(true)
      try {
        setOrders(await ordersApi.list(token))
      } catch (e: unknown) {
        setError((e as { message?: string })?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const filtered = useMemo(() => {
    if (filter === 'all') return orders
    if (filter === 'active') return orders.filter((o) => ACTIVE.includes(o.status))
    return orders.filter((o) => DONE.includes(o.status))
  }, [orders, filter])

  return (
    <>
      <PageHeader title="Jobs" />
      <div className="admin-content">
        <div className="toolbar">
          <div className="filters">
            {(['active', 'done', 'all'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => {
                  setFilter(f)
                  setParams({})
                }}
              >
                {f === 'active' ? 'Active' : f === 'done' ? 'Done' : 'All'}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Pickup</th>
                  <th>Status</th>
                  <th>Collector</th>
                  <th>Customer</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr
                    key={o.id}
                    style={
                      highlight === o.id
                        ? { outline: '2px solid var(--gk-green-500)' }
                        : undefined
                    }
                  >
                    <td>
                      <strong>{o.title}</strong>
                      <div className="muted">
                        {o.approxWeight != null ? `${o.approxWeight} kg` : ''}
                      </div>
                    </td>
                    <td>
                      <StatusChip status={o.status} />
                    </td>
                    <td>{o.collector?.name || '-'}</td>
                    <td>{o.customer?.name || '-'}</td>
                    <td>{formatDate(o.updatedAt || o.createdAt)}</td>
                    <td>
                      {o.status === 'waiting' && (
                        <Link className="btn btn-primary btn-sm" to={`/orders/${o.id}/assign`}>
                          Assign
                        </Link>
                      )}
                      {o.status !== 'waiting' && o.collectorId && (
                        <Link
                          className="btn btn-ghost btn-sm"
                          to={`/orders/${o.id}/assign`}
                        >
                          Reassign
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="empty">
                      No jobs
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
