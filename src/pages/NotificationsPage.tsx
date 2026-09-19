import { useEffect, useState } from 'react'
import { notifApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatDate } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { AppNotification } from '../types'

export function NotificationsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<AppNotification[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      setItems(await notifApi.list(token))
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  const markAll = async () => {
    if (!token) return
    await notifApi.readAll(token)
    await load()
  }

  const markOne = async (id: string) => {
    if (!token) return
    await notifApi.read(token, id)
    await load()
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        actions={
          <button type="button" className="btn btn-ghost btn-sm" onClick={markAll}>
            Mark all read
          </button>
        }
      />
      <div className="admin-content">
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="stack">
            {items.map((n) => (
              <div
                key={n.id}
                className="card"
                style={{
                  borderColor: n.read ? undefined : 'var(--gk-green-500)',
                  background: n.read ? undefined : 'var(--gk-green-50)',
                }}
              >
                <div className="toolbar" style={{ marginBottom: 0 }}>
                  <div>
                    <strong>{n.title}</strong>
                    {n.body && <p className="muted" style={{ margin: '6px 0 0' }}>{n.body}</p>}
                    <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                      {formatDate(n.createdAt)}
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => markOne(n.id)}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!items.length && <div className="empty">No notifications</div>}
          </div>
        )}
      </div>
    </>
  )
}
