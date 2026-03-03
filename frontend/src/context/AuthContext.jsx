import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import api from '../api/axios'
import { tokenStorage } from '../utils/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStorage.getUser())
  const [loading, setLoading] = useState(true)

  // On mount, verify token is still valid
  useEffect(() => {
    const token = tokenStorage.getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me')
      .then((res) => {
        const userData = res.data?.user || res.data
        setUser(userData)
        tokenStorage.setUser(userData)
      })
      .catch(() => {
        tokenStorage.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, token, user: userData } = res.data
    const jwt = access_token || token
    tokenStorage.setToken(jwt)
    tokenStorage.setUser(userData)
    setUser(userData)
    return userData
  }, [])

  const loginWithGoogle = useCallback(() => {
    const base = import.meta.env.VITE_API_URL || '/api'
    window.location.href = `${base}/auth/google`
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    const { access_token, token, user: userData } = res.data
    const jwt = access_token || token
    tokenStorage.setToken(jwt)
    tokenStorage.setUser(userData)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore errors on logout
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates }
      tokenStorage.setUser(next)
      return next
    })
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
