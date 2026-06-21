import axios from 'axios'
import type { ApiResponse } from '../types/api'

const BROWSER_CACHE_PREFIX = 'smartcampus_browser_cache:'
const BROWSER_CACHE_TTL_MS = 90_000

export const http = axios.create({
  baseURL: '',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartcampus_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? '请求失败'
    return Promise.reject(new Error(message))
  },
)

export async function getData<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const cacheKey = browserCacheKey(url, params)
  const cached = readBrowserCache<T>(cacheKey)
  if (cached !== null) {
    if (import.meta.env.DEV) {
      console.info('[SmartCampus cache] browser hit:', url, params ?? {})
    }
    return cached
  }
  const { data } = await http.get<ApiResponse<T>>(url, { params })
  if (data.code !== 0) throw new Error(data.message)
  writeBrowserCache(cacheKey, data.data)
  return data.data
}

export async function postData<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await http.post<ApiResponse<T>>(url, body)
  if (data.code !== 0) throw new Error(data.message)
  clearBrowserCache()
  return data.data
}

export async function putData<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await http.put<ApiResponse<T>>(url, body)
  if (data.code !== 0) throw new Error(data.message)
  clearBrowserCache()
  return data.data
}

export async function deleteData<T>(url: string): Promise<T> {
  const { data } = await http.delete<ApiResponse<T>>(url)
  if (data.code !== 0) throw new Error(data.message)
  clearBrowserCache()
  return data.data
}

export async function postFormData<T>(url: string, body: FormData): Promise<T> {
  const { data } = await http.post<ApiResponse<T>>(url, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  if (data.code !== 0) throw new Error(data.message)
  clearBrowserCache()
  return data.data
}

export type DownloadProgressHandler = (progress: number) => void

export async function downloadBlob(url: string, onProgress?: DownloadProgressHandler): Promise<Blob> {
  const { data } = await http.get<Blob>(url, {
    responseType: 'blob',
    onDownloadProgress: (event) => {
      if (event.total && event.total > 0) {
        onProgress?.((event.loaded / event.total) * 100)
      }
    },
  })
  return data
}

export function clearBrowserCache() {
  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index)
    if (key?.startsWith(BROWSER_CACHE_PREFIX)) {
      sessionStorage.removeItem(key)
    }
  }
}

function browserCacheKey(url: string, params?: Record<string, unknown>) {
  const userId = browserCacheUserId()
  const normalizedParams = Object.entries(params ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&')
  return `${BROWSER_CACHE_PREFIX}${userId}:${url}?${normalizedParams}`
}

function browserCacheUserId() {
  const userRaw = localStorage.getItem('smartcampus_user')
  if (!userRaw) return 'anonymous'
  try {
    return String((JSON.parse(userRaw) as { id?: number }).id ?? 'anonymous')
  } catch {
    return 'anonymous'
  }
}

function readBrowserCache<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try {
    const entry = JSON.parse(raw) as { expiresAt: number; value: T }
    if (entry.expiresAt <= Date.now()) {
      sessionStorage.removeItem(key)
      return null
    }
    return entry.value
  } catch {
    sessionStorage.removeItem(key)
    return null
  }
}

function writeBrowserCache<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ expiresAt: Date.now() + BROWSER_CACHE_TTL_MS, value }))
  } catch {
    clearBrowserCache()
  }
}
