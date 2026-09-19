import { useEffect, useState } from 'react'
import { usersApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../layout/AdminShell'
import type { User } from '../types'

export function UsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      setUsers(await usersApi.list(token, 'customer'))
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  const toggleActive = async (u: User) => {
    if (!token) return
    try {
      await usersApi.patch(token, u.id, { isActive: u.isActive === false })
      await load()
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Update failed')
    }
  }

  return (
    <>
      <PageHeader title="Users" />
      <div className="admin-content">
        <p className="muted" style={{ marginTop: 0 }}>
          Customer accounts from the app.
        </p>
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
                  <th>Phone</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td>{u.isActive === false ? 'Inactive' : 'Active'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleActive(u)}
                      >
                        {u.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr>
                    <td colSpan={5} className="empty">
                      No customers
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
