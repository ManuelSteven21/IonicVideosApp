import axios from 'axios'

// Configuración base de la API
const baseURL = process.env.VITE_API_URL 
  ? `${process.env.VITE_API_URL}/api` 
  : 'http://localhost:8000/api'

const api = axios.create({
  baseURL: process.env.VITE_API_URL 
    ? `${process.env.VITE_API_URL}/api` 
    : 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// Interceptor de solicitud
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // No forzar Content-Type para FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  error => Promise.reject(error)
)


// Interceptor de respuesta
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)


export default api