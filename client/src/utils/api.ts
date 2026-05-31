import axios from 'axios'
import { message } from 'antd'
import { logError, logDebug, logInfo } from './logger'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Add /api prefix to match backend routes
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log API call
    logDebug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    })

    return config
  },
  (error) => {
    logError('API Request Error', { error: error.message })
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful response
    logInfo(`API Response: ${response.config.url}`, {
      status: response.status,
      method: response.config.method?.toUpperCase(),
    })

    return response
  },
  (error) => {
    // Log error response
    logError('API Response Error', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    })

    if (error.response) {
      switch (error.response.status) {
        case 401:
          message.error('未授权，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          message.error('权限不足')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误，请稍后重试')
          break
        default:
          message.error(error.response.data?.error || '请求失败')
      }
    } else if (error.request) {
      message.error('网络错误，请检查您的连接')
    } else {
      message.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
}

export const userAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: number) => api.get(`/users/${id}`),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  changePassword: (id: number, data: any) =>
    api.post(`/users/${id}/change-password`, data),
}

export const departmentAPI = {
  getDepartments: () => api.get('/departments'),
  getDepartment: (id: number) => api.get(`/departments/${id}`),
  createDepartment: (data: any) => api.post('/departments', data),
  updateDepartment: (id: number, data: any) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id: number) => api.delete(`/departments/${id}`),
}

export const projectAPI = {
  getProjects: (params?: any) => api.get('/projects', { params }),
  getProject: (id: number) => api.get(`/projects/${id}`),
  createProject: (data: any) => api.post('/projects', data),
  updateProject: (id: number, data: any) => api.put(`/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}`),
  addMember: (id: number, data: any) => api.post(`/projects/${id}/members`, data),
  removeMember: (id: number, employeeId: number) =>
    api.delete(`/projects/${id}/members/${employeeId}`),
}

export const financialAPI = {
  getTransactions: (params?: any) => api.get('/financial', { params }),
  getTransaction: (id: number) => api.get(`/financial/${id}`),
  createTransaction: (data: any) => api.post('/financial', data),
  updateTransaction: (id: number, data: any) => api.put(`/financial/${id}`, data),
  deleteTransaction: (id: number) => api.delete(`/financial/${id}`),
  getSummary: (params?: any) => api.get('/financial/summary', { params }),
}

export default api
