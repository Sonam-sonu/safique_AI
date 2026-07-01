import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from '../services/api'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  bloodGroup: string
  homeLocation: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, login: () => {}, logout: () => {},
  updateProfile: async () => {}, isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('safique_token')
    const savedUser  = localStorage.getItem('safique_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('safique_token')
        localStorage.removeItem('safique_user')
      }
    }
  }, [])

  const login = (token: string, user: User) => {
    setToken(token)
    setUser(user)
    localStorage.setItem('safique_token', token)
    localStorage.setItem('safique_user', JSON.stringify(user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('safique_token')
    localStorage.removeItem('safique_user')
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const { data: res } = await authApi.updateProfile(data)
      const updated = res.user as User
      setUser(updated)
      localStorage.setItem('safique_user', JSON.stringify(updated))
    } catch {
      // Fallback: update locally so UI stays consistent even if offline
      if (!user) return
      const updated = { ...user, ...data }
      setUser(updated)
      localStorage.setItem('safique_user', JSON.stringify(updated))
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateProfile, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
