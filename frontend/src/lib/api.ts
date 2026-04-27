import axios from 'axios'
import { useAuthStore } from '../store/auth.store'

const providedUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
const api = axios.create({ baseURL: providedUrl.replace('localhost', '127.0.0.1') })

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let queue: Array<(token: string) => void> = []

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      if (isRefreshing) {
        return new Promise(resolve => {
          queue.push(token => { original.headers.Authorization = `Bearer ${token}`; resolve(api(original)) })
        })
      }
      isRefreshing = true
      try {
        const { refreshToken } = useAuthStore.getState()
        if (!refreshToken) throw new Error('No refresh token');
        
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/auth/refresh`, { refreshToken })
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
        queue.forEach(cb => cb(data.accessToken))
        queue = []
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
