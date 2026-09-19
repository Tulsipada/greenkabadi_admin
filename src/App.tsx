import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAdmin } from './auth/RequireAdmin'
import { AdminShell } from './layout/AdminShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { InboxPage } from './pages/InboxPage'
import { AssignPage } from './pages/AssignPage'
import { JobsPage } from './pages/JobsPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { TransactionEditPage } from './pages/TransactionEditPage'
import { UsersPage } from './pages/UsersPage'
import { StaffAddPage, StaffPage } from './pages/StaffPage'
import { CategoriesPage, CategoryDetailPage } from './pages/CategoriesPage'
import { ContactDetailPage, ContactsPage } from './pages/ContactsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { SettingsRoutes } from './pages/SettingsPages'
import './styles/tokens.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAdmin />}>
            <Route element={<AdminShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="orders/:id/assign" element={<AssignPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="transactions/:id" element={<TransactionEditPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="staff/new" element={<StaffAddPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/:id" element={<CategoryDetailPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="contacts/:id" element={<ContactDetailPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings/*" element={<SettingsRoutes />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
