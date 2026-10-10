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
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const deleteOne = async (notification: AppNotification) => {
    if (!token || !window.confirm(`Delete notification "${notification.title}"?`)) return
    setError('')
    setDeletingId(notification.id)
    try {
      await notifApi.remove(token, notification.id)
      await load()
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
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
                  <div>
                    {!n.read && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => void markOne(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === n.id}
                      onClick={() => void deleteOne(n)}
                      style={{ marginLeft: 8 }}
                    >
                      {deletingId === n.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
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
