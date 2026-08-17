import axios from 'axios'

// Base URL is read from the environment so this project can point at the
// real Node.js/Express backend without any code changes. See .env.example.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the JWT (once real auth is wired up) to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rbac_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Centralize response/error handling, including 401 -> logout redirect.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('rbac_token')
      localStorage.removeItem('rbac_user')
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Toggle this to false once the real backend endpoints below are live.
export const USE_MOCKS = false
