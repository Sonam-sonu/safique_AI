import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safique_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle 401 without redirect loop ──────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      // Only redirect to login if we're not already on login/register pages
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('safique_token')
        localStorage.removeItem('safique_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
  bloodGroup?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
  bloodGroup: string
  homeLocation: string
  role: string
  sosCount?: number
  reportsCount?: number
  routesUsed?: number
}

export interface AuthResponse {
  message: string
  token: string
  user: AuthUser
}

export const authApi = {
  register: (data: RegisterPayload) =>
    api.post<AuthResponse>('/users/register', data),

  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/users/login', data),

  getProfile: () =>
    api.get<{ user: AuthUser }>('/users/profile'),

  updateProfile: (data: Partial<RegisterPayload & { homeLocation: string }>) =>
    api.put<{ message: string; user: AuthUser }>('/users/profile', data),
}

// ── Routes ────────────────────────────────────────────────────────────────────

export interface FindRoutePayload {
  startLocation: string
  destination: string
  time: 'day' | 'night'
}

export interface RouteResult {
  routeName: string
  safetyScore: number
  routeType: 'Safe Route' | 'Medium Route' | 'Risky Route'
  travelTime: string
  distance: string
  crowdDensity: string
  lightingCondition: string
  crimeRiskLevel: string
  policeNearby: boolean
  isolated: boolean
  via: string
  tip: string
}

export const routeApi = {
  findSafeRoute: (data: FindRoutePayload) =>
    api.post<{ message: string; routes: RouteResult[] }>('/routes/find-safe-route', data),

  getHistory: () =>
    api.get<{ history: any[] }>('/routes/history'),
}

// ── SOS ───────────────────────────────────────────────────────────────────────

export interface SOSPayload {
  location?: string
  lat?: number
  lng?: number
}

export const sosApi = {
  sendAlert: (data: SOSPayload) =>
    api.post<{ message: string; sosId: string; contactsNotified: number }>('/sos/send', data),

  getHistory: () =>
    api.get<{ history: any[] }>('/sos/history'),
}

// ── Emergency Contacts ────────────────────────────────────────────────────────

export interface ContactPayload {
  contactName: string
  contactPhone: string
  relation: string
}

export const contactsApi = {
  getAll: () =>
    api.get<{ contacts: any[] }>('/contacts'),

  add: (data: ContactPayload) =>
    api.post<{ message: string; contact: any }>('/contacts/add', data),

  update: (id: string, data: Partial<ContactPayload>) =>
    api.put<{ message: string; contact: any }>(`/contacts/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/contacts/${id}`),
}

// ── Reports ───────────────────────────────────────────────────────────────────

export interface ReportPayload {
  location: string
  reportType: string
  description: string
  riskLevel?: string
  severity?: number
  lat?: number
  lng?: number
}

export const reportsApi = {
  add: (data: ReportPayload) =>
    api.post<{ message: string; report: any }>('/reports/add', data),

  getMyReports: () =>
    api.get<{ reports: any[] }>('/reports/my'),

  getAll: () =>
    api.get<{ reports: any[]; total: number }>('/reports/all'),

  resolve: (id: string) =>
    api.put<{ message: string; report: any }>(`/reports/${id}/resolve`),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/reports/${id}`),
}

// ── Alerts ────────────────────────────────────────────────────────────────────

export const alertsApi = {
  getAll: () =>
    api.get<{ alerts: any[] }>('/alerts'),

  getByRoute: (routeId: string) =>
    api.get<{ alerts: any[] }>(`/alerts/route/${routeId}`),
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () =>
    api.get<{ stats: any; weeklyActivity: any; topZones: any[] }>('/admin/stats'),

  getUsers: (page = 1) =>
    api.get<{ users: any[]; total: number }>(`/admin/users?page=${page}`),

  getReports: (params?: { status?: string; riskLevel?: string }) =>
    api.get<{ reports: any[]; total: number }>('/reports/all', { params }),

  resolveReport: (id: string) =>
    api.put<{ message: string }>(`/reports/${id}/resolve`),

  deleteReport: (id: string) =>
    api.delete<{ message: string }>(`/reports/${id}`),

  deactivateUser: (id: string) =>
    api.put<{ message: string }>(`/admin/users/${id}/deactivate`),

  activateUser: (id: string) =>
    api.put<{ message: string }>(`/admin/users/${id}/activate`),
}

export default api
