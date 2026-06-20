import { type ReactNode, useMemo, useState } from 'react'
import type { User } from '../types/api'
import { AuthContext, type AuthContextValue } from './auth-context'
import { clearSessionTabs } from '../lib/sessionTabs'

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
      clearSessionTabs()
      setToken(null)
      setUser(null)
    },
  }), [token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
