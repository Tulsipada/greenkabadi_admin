import { type FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { authApi, settingsApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../layout/AdminShell'
import type { OrgSettings } from '../types'

function SettingsHome() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="admin-content">
        <div className="stack" style={{ maxWidth: 480 }}>
          <Link className="card" to="/settings/organisation">
            Organisation
          </Link>
          <Link className="card" to="/settings/support">
            Support contact
          </Link>
          <Link className="card" to="/settings/password">
            Change password
          </Link>
        </div>
      </div>
    </>
  )
}

function OrgSettingsPage() {
  const { token } = useAuth()
  const [form, setForm] = useState<OrgSettings>({})
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        setForm(await settingsApi.get(token))
      } catch (e: unknown) {
        setError((e as { message?: string })?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaved(false)
    try {
      setForm(await settingsApi.patch(token, form))
      setSaved(true)
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Save failed')
    }
  }

  return (
    <>
      <PageHeader
        title="Organisation"
        actions={
          <Link className="btn btn-ghost btn-sm" to="/settings">
            Back
          </Link>
        }
      />
      <div className="admin-content">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <form className="card" style={{ maxWidth: 480 }} onSubmit={onSubmit}>
            <div className="field">
              <label>Organisation name</label>
              <input
                value={form.orgName || ''}
                onChange={(e) => setForm({ ...form, orgName: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Address</label>
              <textarea
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            {error && <p className="error">{error}</p>}
            {saved && <p style={{ color: 'var(--gk-green-700)' }}>Saved</p>}
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </form>
        )}
      </div>
    </>
  )
}

function SupportSettingsPage() {
  const { token } = useAuth()
  const [form, setForm] = useState<OrgSettings>({})
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!token) return
    settingsApi.get(token).then(setForm).catch((e) => setError(e.message))
  }, [token])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    try {
      setForm(await settingsApi.patch(token, form))
      setSaved(true)
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Save failed')
    }
  }

  return (
    <>
      <PageHeader
        title="Support contact"
        actions={
          <Link className="btn btn-ghost btn-sm" to="/settings">
            Back
          </Link>
        }
      />
      <div className="admin-content">
        <form className="card" style={{ maxWidth: 480 }} onSubmit={onSubmit}>
          <div className="field">
            <label>Support phone</label>
            <input
              value={form.supportPhone || ''}
              onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Support email</label>
            <input
              type="email"
              value={form.supportEmail || ''}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            />
          </div>
          {error && <p className="error">{error}</p>}
          {saved && <p style={{ color: 'var(--gk-green-700)' }}>Saved</p>}
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </form>
      </div>
    </>
  )
}

function PasswordSettingsPage() {
  const { token } = useAuth()
  const [currentPassword, setCurrent] = useState('')
  const [newPassword, setNew] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError('')
    setDone(false)
    try {
      await authApi.changePassword(token, currentPassword, newPassword)
      setDone(true)
      setCurrent('')
      setNew('')
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Failed')
    }
  }

  return (
    <>
      <PageHeader
        title="Change password"
        actions={
          <Link className="btn btn-ghost btn-sm" to="/settings">
            Back
          </Link>
        }
      />
      <div className="admin-content">
        <form className="card" style={{ maxWidth: 420 }} onSubmit={onSubmit}>
          <div className="field">
            <label>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="error">{error}</p>}
          {done && <p style={{ color: 'var(--gk-green-700)' }}>Password updated</p>}
          <button className="btn btn-primary" type="submit">
            Update
          </button>
        </form>
      </div>
    </>
  )
}

export function SettingsRoutes() {
  return (
    <Routes>
      <Route index element={<SettingsHome />} />
      <Route path="organisation" element={<OrgSettingsPage />} />
      <Route path="support" element={<SupportSettingsPage />} />
      <Route path="password" element={<PasswordSettingsPage />} />
      <Route path="*" element={<Navigate to="/settings" replace />} />
    </Routes>
  )
}
