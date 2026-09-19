import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { staffApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../layout/AdminShell'
import type { User } from '../types'

export function StaffPage() {
  const { token } = useAuth()
  const [staff, setStaff] = useState<User[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!token) return
    setLoading(true)
    try {
      setStaff(await staffApi.list(token))
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  const toggle = async (u: User) => {
    if (!token) return
    try {
      await staffApi.patch(token, u.id, { isActive: u.isActive === false })
      await load()
    } catch (e: unknown) {
      setError((e as { message?: string })?.message || 'Update failed')
    }
  }

  return (
    <>
      <PageHeader
        title="Staffs"
        actions={
          <Link className="btn btn-primary btn-sm" to="/staff/new">
            Add staff
          </Link>
        }
      />
      <div className="admin-content">
        <p className="muted" style={{ marginTop: 0 }}>
          Collectors. Deactivate to hide from Assign.
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
                {staff.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '-'}</td>
                    <td>{u.isActive === false ? 'Inactive' : 'Active'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggle(u)}
                      >
                        {u.isActive === false ? 'Activate' : 'Deactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!staff.length && (
                  <tr>
                    <td colSpan={5} className="empty">
                      No staff yet
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

export function StaffAddPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setError('')
    try {
      await staffApi.create(token, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      })
      navigate('/staff')
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Add staff"
        actions={
          <Link className="btn btn-ghost btn-sm" to="/staff">
            Back
          </Link>
        }
      />
      <div className="admin-content">
        <form className="card" style={{ maxWidth: 480 }} onSubmit={onSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Create collector'}
          </button>
        </form>
      </div>
    </>
  )
}
