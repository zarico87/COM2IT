import express from 'express'
import Task from '../models/Task.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = express.Router()

// todas las rutas de tareas requieren token
router.use(authMiddleware)

// GET /tasks - trae las tareas del usuario logueado
router.get('/', async (req, res) => {
  try {
    const tareas = await Task.find({ ownerId: req.user.id }).sort({ createdAt: -1 })
    res.json(tareas)
  } catch (err) {
    console.error('error al traer tareas:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// POST /tasks - crea una tarea nueva
router.post('/', async (req, res) => {
  try {
    const { title, description, quadrant, dueDate } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'El título es obligatorio' })
    }

    const nuevaTarea = await Task.create({
      title:       title.trim(),
      description: description?.trim() || '',
      quadrant:    quadrant || 'urgente',
      dueDate:     dueDate || null,
      ownerId:     req.user.id,
    })

    res.status(201).json(nuevaTarea)
  } catch (err) {
    console.error('error al crear tarea:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// PATCH /tasks/:id - edita parcialmente una tarea
router.patch('/:id', async (req, res) => {
  try {
    const tarea = await Task.findOne({ _id: req.params.id, ownerId: req.user.id })

    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    // solo actualizo los campos que vienen en el body
    const campos = ['title', 'description', 'quadrant', 'dueDate', 'completed']
    campos.forEach(campo => {
      if (req.body[campo] !== undefined) tarea[campo] = req.body[campo]
    })

    await tarea.save()
    res.json(tarea)
  } catch (err) {
    console.error('error al actualizar tarea:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// DELETE /tasks/:id - borra una tarea
router.delete('/:id', async (req, res) => {
  try {
    const tarea = await Task.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id })

    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    res.json({ message: 'Tarea eliminada' })
  } catch (err) {
    console.error('error al eliminar tarea:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// GET /admin/tasks - todas las tareas (solo admin)
// TODO: agregar paginacion cuando haya muchos usuarios
router.get('/admin/tasks', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    const todasLasTareas = await Task.find().populate('ownerId', 'email username')
    res.json(todasLasTareas)
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

export default router
