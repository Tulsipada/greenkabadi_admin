const API_URL = (
  import.meta.env.VITE_API_URL || 'https://greenkabadi.demo.dhinova.com'
).replace(/\/$/, '')

export type ApiError = { status: number; message: string }

async function parseError(res: Response): Promise<ApiError> {
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

export { API_URL }
