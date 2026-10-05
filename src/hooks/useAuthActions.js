// Hook personalizado para la lógica de autenticación (login/register/logout)
// Centraliza el acceso al contexto y agrega efectos secundarios útiles
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext.jsx'
import useTaskStore from '../store/useTaskStore.js'

export function useAuthActions() {
  const { login, register, adminLogin, logout: ctxLogout } = useAuth()
  const clearTasks = useTaskStore((s) => s.clearTasks)
  const navigate = useNavigate()

  const handleLogin = useCallback(
    async (creds) => {
      await login(creds)
      toast.success('¡Bienvenido de nuevo! 👋')
      navigate('/')
    },
    [login, navigate]
  )

  const handleRegister = useCallback(
    async (data) => {
      await register(data)
      toast.success('Cuenta creada con éxito 🎉')
      navigate('/')
    },
    [register, navigate]
  )

  const handleAdminLogin = useCallback(
    async (creds) => {
      await adminLogin(creds)
      toast.success('Bienvenido al CPanel 🛡️')
    },
    [adminLogin]
  )

  const handleLogout = useCallback(async () => {
    clearTasks()
    ctxLogout()
    toast.info('Sesión cerrada 👋')
    navigate('/')
  }, [clearTasks, ctxLogout, navigate])

  return { handleLogin, handleRegister, handleAdminLogin, handleLogout }
}
