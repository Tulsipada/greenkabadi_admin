const API_URL = (
  import.meta.env.VITE_API_URL || 'https://api.greenkabadi.in'
).replace(/\/$/, '')

export type ApiError = { status: number; message: string }

async function parseError(res: Response): Promise<ApiError> {
  if (res.status === 413) {
    return { status: 413, message: 'Image is too large. Choose a smaller photo.' }
  }
  try {
    const body = await res.json()
    const message =
      body?.error?.message || body?.message || res.statusText || 'Request failed'
    return { status: res.status, message: String(message) }
  } catch {
    return { status: res.status, message: res.statusText || 'Request failed' }
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        Accept: 'application/json',
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    })
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : 'Network request failed'
    throw { status: 0, message: `Cannot reach API (${API_URL}): ${detail}` } satisfies ApiError
  }
  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function apiUpload<T>(
  path: string,
  token: string,
  file: File,
  field = 'image',
): Promise<T> {
  const body = new FormData()
  body.append(field, file)
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      body,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : 'Network request failed'
    throw { status: 0, message: `Cannot reach API (${API_URL}): ${detail}` } satisfies ApiError
  }
  if (!res.ok) throw await parseError(res)
  return (await res.json()) as T
}

export function mediaUrl(path?: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export { API_URL }
