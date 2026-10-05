import { createContext, useContext, useState } from 'react'
import { authApi } from '../services/api.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('com2it_session') || 'null'))
  const save = (u) => { setUser(u); u ? localStorage.setItem('com2it_session', JSON.stringify(u)) : localStorage.removeItem('com2it_session') }

  const login = async (creds) => save(await authApi.login(creds))
  const register = async (data) => save(await authApi.register(data))
  // Solo admins. Con backend real, esta validación de rol DEBE hacerse también en el servidor.
  const adminLogin = async ({ email, password }) => {
    const u = await authApi.login({ identifier: email, password })
    if (u.role !== 'admin') throw new Error('Acceso solo para administradores')
    save(u)
  }
  const logout = () => save(null)

  return <AuthContext.Provider value={{ user, login, register, adminLogin, logout }}>{children}</AuthContext.Provider>
}
