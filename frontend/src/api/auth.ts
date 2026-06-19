import { getData, postData } from './client'
import type { LoginResult, Menu, User } from '../types/api'

export const authApi = {
  login: (username: string, password: string) => postData<LoginResult>('/api/auth/login', { username, password }),
  me: () => getData<User>('/api/auth/me'),
  menus: () => getData<Menu[]>('/api/auth/menus'),
  logout: () => postData<void>('/api/auth/logout'),
}
