import { createContext, type ReactNode, useContext, useMemo, useState } from 'react'
import type { User } from '../types/api'

type AuthContextValue = {
  token: string | null
  user: User | null
  setSession: (token: string, user: User) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('smartcampus_token'))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('smartcampus_user')
    return raw ? (JSON.parse(raw) as User) : null
  })

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    setSession: (nextToken, nextUser) => {
      localStorage.setItem('smartcampus_token', nextToken)
      localStorage.setItem('smartcampus_user', JSON.stringify(nextUser))
      setToken(nextToken)
      setUser(nextUser)
    },
    clearSession: () => {
      localStorage.removeItem('smartcampus_token')
      localStorage.removeItem('smartcampus_user')
      setToken(null)
      setUser(null)
    },
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('AuthContext 未初始化')
  return context
}
