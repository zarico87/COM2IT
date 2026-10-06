// rutas de administracion para el panel CPanel
import express from 'express'
import User from '../models/User.js'
import Task from '../models/Task.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = express.Router()

// todas las rutas de admin requieren que este autenticado
router.use(authMiddleware)

// middleware para verificar rol admin
const soloAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso solo para administradores' })
  }
  next()
}

// GET /admin/users - trae todos los usuarios sin la contraseña
router.get('/users', soloAdmin, async (req, res) => {
  try {
    const usuarios = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(usuarios)
  } catch (err) {
    console.error('error al listar usuarios:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// GET /admin/tasks - trae todas las tareas del sistema
router.get('/tasks', soloAdmin, async (req, res) => {
  try {
    const tareas = await Task.find().populate('ownerId', 'firstName lastName email username').sort({ createdAt: -1 })
    res.json(tareas)
  } catch (err) {
    console.error('error al listar todas las tareas:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

export default router
