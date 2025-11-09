import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),

  getters: {
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    canManageCollectionPoints: (state) => ['admin', 'manager'].includes(state.user?.role),
    canManageSubscribers: (state) => ['admin', 'manager'].includes(state.user?.role),
    canManageCollectionEvents: (state) => ['admin', 'manager', 'operator'].includes(state.user?.role),
    canViewReports: (state) => ['admin', 'manager', 'operator', 'viewer'].includes(state.user?.role),
    canViewAuditLogs: (state) => ['admin'].includes(state.user?.role)
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/auth/login', credentials)
        const { token, userId, username } = response.data

        this.token = token
        this.user = { id: userId, username }
        this.isAuthenticated = true

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(this.user))

        return { success: true }
      } catch (error) {
        this.logout()
        return {
          success: false,
          message: error.response?.data?.message || 'Login failed'
        }
      }
    },

    async register(userData) {
      try {
        const response = await axios.post('/auth/register', userData)
        return { success: true, data: response.data }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Registration failed'
        }
      }
    },

    async changePassword(passwordData) {
      try {
        await axios.post('/auth/change-password', passwordData)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Password change failed'
        }
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false

      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    initializeAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    }
  }
})