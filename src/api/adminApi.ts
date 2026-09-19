import { api } from './client'
import type {
  AppNotification,
  Category,
  ContactEnquiry,
  Order,
  OrgSettings,
  Subcategory,
  Transaction,
  User,
} from '../types'

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
    }),
  me: (token: string) => api<User>('/users/me', { token }),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    api<{ message?: string }>('/users/me/change-password', {
      method: 'POST',
      token,
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

export const ordersApi = {
  list: (token: string, status?: string) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : ''
    return api<Order[]>(`/orders${q}`, { token })
  },
  get: (token: string, id: string) => api<Order>(`/orders/${id}`, { token }),
  assign: (token: string, id: string, collectorId: string, note?: string) =>
    api<Order>(`/orders/${id}/assign`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ collectorId, note }),
    }),
  collectors: (token: string) => api<User[]>('/collectors/active', { token }),
}

export const usersApi = {
  list: (token: string, role?: string) => {
    const q = role ? `?role=${encodeURIComponent(role)}` : ''
    return api<User[]>(`/users${q}`, { token })
  },
  patch: (token: string, id: string, body: Partial<User>) =>
    api<User>(`/users/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    }),
}

export const staffApi = {
  list: (token: string) => api<User[]>('/staff', { token }),
  create: (
    token: string,
    body: { name: string; email: string; phone: string; password: string },
  ) =>
    api<User>('/staff', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  patch: (token: string, id: string, body: Partial<User>) =>
    api<User>(`/staff/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    }),
}

export const txnApi = {
  list: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : ''
    return api<Transaction[]>(`/transactions${q}`, { token })
  },
  get: (token: string, id: string) =>
    api<Transaction>(`/transactions/${id}`, { token }),
  patchPaid: (token: string, id: string, amountPaid: number) =>
    api<Transaction>(`/transactions/${id}/amount-paid`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ amountPaid }),
    }),
}

export const catalogApi = {
  list: (token: string, all = true) =>
    api<Category[]>(`/categories${all ? '?all=true' : ''}`, { token }),
  get: (token: string, id: string) =>
    api<Category>(`/categories/${id}`, { token }),
  create: (token: string, body: Partial<Category>) =>
    api<Category>('/categories', {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  patch: (token: string, id: string, body: Partial<Category>) =>
    api<Category>(`/categories/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    }),
  addSub: (token: string, categoryId: string, body: Partial<Subcategory>) =>
    api<Subcategory>(`/categories/${categoryId}/subcategories`, {
      method: 'POST',
      token,
      body: JSON.stringify(body),
    }),
  patchSub: (token: string, id: string, body: Partial<Subcategory>) =>
    api<Subcategory>(`/subcategories/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    }),
}

export const contactApi = {
  list: (token: string) => api<ContactEnquiry[]>('/contact-enquiries', { token }),
  get: (token: string, id: string) =>
    api<ContactEnquiry>(`/contact-enquiries/${id}`, { token }),
  patch: (token: string, id: string, status: string) =>
    api<ContactEnquiry>(`/contact-enquiries/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    }),
}

export const notifApi = {
  list: (token: string) => api<AppNotification[]>('/notifications', { token }),
  read: (token: string, id: string) =>
    api<AppNotification>(`/notifications/${id}/read`, {
      method: 'PATCH',
      token,
    }),
  readAll: (token: string) =>
    api<{ count?: number }>('/notifications/read-all', {
      method: 'POST',
      token,
    }),
}

export const settingsApi = {
  get: (token: string) => api<OrgSettings>('/organisation-settings', { token }),
  patch: (token: string, body: Partial<OrgSettings>) =>
    api<OrgSettings>('/organisation-settings', {
      method: 'PATCH',
      token,
      body: JSON.stringify(body),
    }),
}
