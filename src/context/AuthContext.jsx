import { createContext, useContext, useState } from 'react'
import { authApi } from '../services/api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('com2it_session')
      return saved ? JSON.parse(saved) : null
    } catch {
      localStorage.removeItem('com2it_session')
      localStorage.removeItem('com2it_token')
      return null
    }
  })

  const save = (u) => {
    setUser(u)
    if (u) {
      localStorage.setItem('com2it_session', JSON.stringify(u))
    } else {
      localStorage.removeItem('com2it_session')
      localStorage.removeItem('com2it_token')
    }
  }

  const login = async (creds) => {
    const res = await authApi.login(creds)
    const u = res?.user ? res.user : res
    save(u)
    return u
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    const u = res?.user ? res.user : res
    save(u)
    return u
  }

  // Solo admins. Con backend real, esta validación de rol DEBE hacerse también en el servidor.
  const adminLogin = async ({ email, password }) => {
    const res = await authApi.login({ identifier: email, password })
    const u = res?.user ? res.user : res
    if (u?.role !== 'admin') throw new Error('Acceso solo para administradores')
    save(u)
    return u
  }

  const logout = () => {
    save(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
