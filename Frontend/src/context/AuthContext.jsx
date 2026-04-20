import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { bankingApi } from '../api/bankingApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isSystemUser, setIsSystemUser] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await bankingApi.me()
      setUser(data.user)
      return data.user
    } catch {
      setUser(null)
      setIsSystemUser(false)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const detectSystemUser = useCallback(async () => {
    try {
      await bankingApi.deposit({})
      setIsSystemUser(true)
      return true
    } catch (error) {
      const message = String(error?.message || '').toLowerCase()
      const isSystem = !message.includes('forbidden') && !message.includes('system user only')
      setIsSystemUser(isSystem)
      return isSystem
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      const current = await fetchCurrentUser()
      if (mounted && current) {
        await detectSystemUser()
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [detectSystemUser, fetchCurrentUser])

  const login = useCallback(async (credentials) => {
    const data = await bankingApi.login(credentials)
    return data
  }, [])

  const verifyLoginOtp = useCallback(async (payload) => {
    const data = await bankingApi.loginVerifyOtp(payload)
    const me = await fetchCurrentUser()
    if (me) {
      await detectSystemUser()
    }
    return data
  }, [detectSystemUser, fetchCurrentUser])

  const register = useCallback(async (payload) => {
    const data = await bankingApi.register(payload)
    return data
  }, [])

  const verifyRegisterOtp = useCallback(async (payload) => {
    const data = await bankingApi.registerVerifyOtp(payload)
    const me = await fetchCurrentUser()
    if (me) {
      await detectSystemUser()
    }
    return data
  }, [detectSystemUser, fetchCurrentUser])

  const logout = useCallback(async () => {
    await bankingApi.logout()
    setUser(null)
    setIsSystemUser(false)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isSystemUser,
      login,
      verifyLoginOtp,
      register,
      verifyRegisterOtp,
      logout,
      refreshUser: fetchCurrentUser,
    }),
    [fetchCurrentUser, isSystemUser, loading, login, logout, register, user, verifyLoginOtp, verifyRegisterOtp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
