import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/goalStoreApi'
import { getErrorMessage } from '../utils/http'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('goalstore_user') || 'null')
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('goalstore_auth_token')))

  useEffect(() => {
    const token = localStorage.getItem('goalstore_auth_token')
    if (!token) {
      setLoading(false)
      return
    }

    authApi.me()
      .then((data) => {
        setUser(data)
        localStorage.setItem('goalstore_user', JSON.stringify(data))
      })
      .catch(() => {
        localStorage.removeItem('goalstore_auth_token')
        localStorage.removeItem('goalstore_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password })
      localStorage.setItem('goalstore_auth_token', response.token)
      localStorage.setItem('goalstore_user', JSON.stringify(response.user))
      setUser(response.user)
      return { ok: true, user: response.user }
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, 'Đăng nhập không thành công.') }
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Local logout should still work if the server is unavailable.
    }
    localStorage.removeItem('goalstore_auth_token')
    localStorage.removeItem('goalstore_user')
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isEditor: user?.role === 'EDITOR',
    isUser: user?.role === 'USER',
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
