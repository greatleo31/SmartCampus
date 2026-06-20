import { createContext } from 'react'
import type { User } from '../types/api'

export type AuthContextValue = {
  token: string | null
  user: User | null
  setSession: (token: string, user: User) => void
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
