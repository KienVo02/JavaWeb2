import axios from 'axios'

export const API_ROOT = 'http://localhost:8080'
export const FALLBACK_IMAGE = '/placeholder-kit.svg'

const axiosClient = axios.create({
  baseURL: `${API_ROOT}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('goalstore_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function imageUrl(path) {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path

  const normalized = path.startsWith('/') ? path : `/${path}`
  const encoded = normalized
    .split('/')
    .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
    .join('/')

  return `${API_ROOT}${encoded}`
}

export default axiosClient
