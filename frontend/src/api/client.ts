import axios from 'axios'
import type { ApiResponse } from '../types/api'

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
  const { data } = await http.get<ApiResponse<T>>(url, { params })
  if (data.code !== 0) throw new Error(data.message)
  return data.data
}

export async function postData<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await http.post<ApiResponse<T>>(url, body)
  if (data.code !== 0) throw new Error(data.message)
  return data.data
}

export async function putData<T>(url: string, body?: unknown): Promise<T> {
  const { data } = await http.put<ApiResponse<T>>(url, body)
  if (data.code !== 0) throw new Error(data.message)
  return data.data
}

export async function deleteData<T>(url: string): Promise<T> {
  const { data } = await http.delete<ApiResponse<T>>(url)
  if (data.code !== 0) throw new Error(data.message)
  return data.data
}
