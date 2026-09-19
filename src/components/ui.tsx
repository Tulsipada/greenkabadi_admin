import type { OrderStatus } from '../types'

export function StatusChip({ status }: { status: OrderStatus | string }) {
  const cls = `chip chip-${status}`
  const label =
    status === 'enroute'
      ? 'En route'
      : status.charAt(0).toUpperCase() + status.slice(1)
  return <span className={cls}>{label}</span>
}

export function formatAddress(o: {
  addressLine1?: string
  addressArea?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
}) {
  return [o.addressLine1, o.addressArea, o.addressCity, o.addressState, o.addressZip]
    .filter(Boolean)
    .join(', ')
}

export function formatDate(iso?: string) {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}
