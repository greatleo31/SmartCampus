import { type ReactNode, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { User } from '../types/api'
import { AuthContext, type AuthContextValue } from './auth-context'
import { clearSessionTabs } from '../lib/sessionTabs'
import { clearBrowserCache } from '../api/client'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState(() => localStorage.getItem('smartcampus_token'))
  const [user, setUser] = useState<User | null>(readStoredUser)

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    setSession: (nextToken, nextUser) => {
      queryClient.clear()
      clearBrowserCache()
      localStorage.setItem('smartcampus_token', nextToken)
      localStorage.setItem('smartcampus_user', JSON.stringify(nextUser))
      setToken(nextToken)
      setUser(nextUser)
    },
    clearSession: () => {
      localStorage.removeItem('smartcampus_token')
      localStorage.removeItem('smartcampus_user')
      clearSessionTabs()
      clearBrowserCache()
      queryClient.clear()
      setToken(null)
      setUser(null)
    },
  }), [queryClient, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function readStoredUser() {
  const raw = localStorage.getItem('smartcampus_user')
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    localStorage.removeItem('smartcampus_user')
    return null
  }
}
