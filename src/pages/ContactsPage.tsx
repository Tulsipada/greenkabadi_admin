import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { contactApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { formatDate } from '../components/ui'
import { PageHeader } from '../layout/AdminShell'
import type { ContactEnquiry } from '../types'

export function ContactsPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<ContactEnquiry[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        setItems(await contactApi.list(token))
      } catch (e: unknown) {
        setError((e as { message?: string })?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  return (
    <>
      <PageHeader title="Contact" />
      <div className="admin-content">
        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.status || 'new'}</td>
                    <td>{formatDate(c.createdAt)}</td>
                    <td>
                      <Link className="btn btn-ghost btn-sm" to={`/contacts/${c.id}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={5} className="empty">
                      No enquiries
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

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const [item, setItem] = useState<ContactEnquiry | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    if (!token || !id) return
    try {
      setItem(await contactApi.get(token, id))
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load')
    }
  }

  useEffect(() => {
    void load()
  }, [token, id])

  const setStatus = async (status: string) => {
    if (!token || !id) return
    await contactApi.patch(token, id, status)
    await load()
  }

  return (
    <>
      <PageHeader
        title="Contact detail"
        actions={
          <Link className="btn btn-ghost btn-sm" to="/contacts">
            Back
          </Link>
        }
      />
      <div className="admin-content">
        {error && <p className="error">{error}</p>}
        {item && (
          <div className="card stack">
            <div>
              <strong>{item.name}</strong>
              <div className="muted">
                {item.email}
                {item.phone ? ` · ${item.phone}` : ''}
              </div>
            </div>
            <p>{item.message}</p>
            <div className="muted">
              Status: {item.status || 'new'} · {formatDate(item.createdAt)} ·{' '}
              {item.source || '-'}
            </div>
            <div className="row">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus('read')}>
                Mark read
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setStatus('closed')}
              >
                Close
              </button>
              <a className="btn btn-primary btn-sm" href={`mailto:${item.email}`}>
                Reply email
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
