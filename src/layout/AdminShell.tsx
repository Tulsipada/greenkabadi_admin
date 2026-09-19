import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { notifApi, ordersApi } from '../api/adminApi'
import { useAuth } from '../auth/AuthContext'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/inbox', label: 'Inbox', badge: 'inbox' as const },
  { to: '/jobs', label: 'Jobs' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/users', label: 'Users' },
  { to: '/staff', label: 'Staffs' },
  { to: '/categories', label: 'Categories' },
  { to: '/contacts', label: 'Contact' },
  { to: '/notifications', label: 'Notifications', badge: 'notif' as const },
  { to: '/settings', label: 'Settings' },
]

export function AdminShell() {
  const { token, logout, user } = useAuth()
  const navigate = useNavigate()
  const [inboxCount, setInboxCount] = useState(0)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    if (!token) return
    let cancelled = false
    ;(async () => {
      try {
        const [waiting, notifs] = await Promise.all([
          ordersApi.list(token, 'waiting'),
          notifApi.list(token),
        ])
        if (cancelled) return
        setInboxCount(waiting.length)
        setNotifCount(notifs.filter((n) => !n.read).length)
      } catch {
        /* ignore badge errors */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="admin-stage">
      <aside className="admin-sidebar">
        <div className="brand">
          <img src="/logo-mark.png" alt="" />
          <strong>
            <span className="g">Green</span>
            <span className="ka">क</span>
            <span className="b">Badi</span>
          </strong>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <span>{item.label}</span>
              {item.badge === 'inbox' && inboxCount > 0 && (
                <span className="admin-nav-badge">{inboxCount}</span>
              )}
              {item.badge === 'notif' && notifCount > 0 && (
                <span className="admin-nav-badge">{notifCount}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="muted" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, padding: '8px 12px' }}>
          {user?.name || user?.email}
        </div>
        <button type="button" className="logout" onClick={onLogout}>
          Log out
        </button>
      </aside>
      <div className="admin-main">
        <Outlet context={{ setInboxCount, setNotifCount }} />
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  actions,
}: {
  title: string
  actions?: React.ReactNode
}) {
  return (
    <header className="admin-topbar">
      <h1>{title}</h1>
      {actions}
    </header>
  )
}
