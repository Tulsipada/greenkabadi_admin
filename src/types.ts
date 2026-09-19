export type OrderStatus =
  | 'waiting'
  | 'assigned'
  | 'enroute'
  | 'collected'
  | 'completed'
  | 'cancelled'

export type User = {
  id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'collector' | 'customer'
  language?: string
  isActive?: boolean
}

export type Order = {
  id: string
  title: string
  status: OrderStatus
  material?: string
  approxWeight?: number
  instructions?: string
  photoUrls?: string[]
  addressLine1?: string
  addressArea?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
  customerId?: string
  collectorId?: string
  customer?: User
  collector?: User
  category?: { id: string; name: string }
  subcategory?: { id: string; name: string; rate?: number; unit?: string }
  transaction?: Transaction
  createdAt?: string
  updatedAt?: string
}

export type Transaction = {
  id: string
  orderId: string
  weight?: number
  rate?: number
  finalAmount?: number
  amountPaid?: number
  paymentMode?: string
  paidAt?: string
  collectorId?: string
  mismatch?: boolean
}

export type Category = {
  id: string
  name: string
  description?: string
  active?: boolean
  sortOrder?: number
  subcategories?: Subcategory[]
}

export type Subcategory = {
  id: string
  name: string
  rate?: number
  unit?: string
  categoryId?: string
  active?: boolean
  instructions?: string
}

export type ContactEnquiry = {
  id: string
  name: string
  email: string
  phone?: string
  message: string
  source?: string
  status?: 'new' | 'read' | 'closed'
  createdAt?: string
}

export type AppNotification = {
  id: string
  title: string
  body?: string
  read?: boolean
  createdAt?: string
}

export type OrgSettings = {
  id?: string
  orgName?: string
  supportPhone?: string
  supportEmail?: string
  address?: string
}
