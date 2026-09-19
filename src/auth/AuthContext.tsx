import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../api/adminApi'
import type { User } from '../types'

const TOKEN_KEY = 'gk_admin_token'
const USER_KEY = 'gk_admin_user'

type AuthValue = {
  ready: boolean
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const t = localStorage.getItem(TOKEN_KEY)
        const raw = localStorage.getItem(USER_KEY)
        if (t) {
          setToken(t)
          if (raw) {
            try {
              setUser(JSON.parse(raw) as User)
            } catch {
              /* ignore */
            }
          }
          try {
            const me = await authApi.me(t)
            if (me.role !== 'admin') {
              localStorage.removeItem(TOKEN_KEY)
              localStorage.removeItem(USER_KEY)
              setToken(null)
              setUser(null)
            } else {
              setUser(me)
              localStorage.setItem(USER_KEY, JSON.stringify(me))
            }
          } catch {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            setToken(null)
            setUser(null)
          }
        }
      } finally {
        setReady(true)
      }
    })()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    if (res.user.role !== 'admin') {
      throw { status: 403, message: 'Admin account required' }
    }
    localStorage.setItem(TOKEN_KEY, res.token)
    localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ ready, token, user, login, logout }),
    [ready, token, user, login, logout],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth outside provider')
  return v
}
