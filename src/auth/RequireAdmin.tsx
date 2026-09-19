import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAdmin() {
  const { ready, token, user } = useAuth()
  if (!ready) {
    return (
      <div className="login-wrap">
        <p className="muted">Loading…</p>
      </div>
    )
  }
  if (!token || user?.role !== 'admin') {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
