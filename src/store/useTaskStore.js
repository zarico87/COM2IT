// Store global de tareas con Zustand + persistencia en localStorage
import { create } from 'zustand'
import { tasksApi } from '../services/api.js'
import { toast } from 'react-toastify'

const LS_KEY = 'com2it_tasks_store'

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,

  // Cargar tareas del usuario desde API o localStorage
  fetchTasks: async (ownerId) => {
    if (!ownerId) { set({ tasks: [] }); return }
    set({ loading: true })
    try {
      const tasks = await tasksApi.list(ownerId)
      set({ tasks, loading: false })
    } catch {
      toast.error('No se pudieron cargar las tareas')
      set({ loading: false })
    }
  },

  // Agregar tarea
  addTask: async (data, ownerId) => {
    try {
      const task = await tasksApi.create(data, ownerId)
      set((s) => ({ tasks: [...s.tasks, task] }))
      toast.success('Tarea creada 🎉')
    } catch (err) {
      toast.error(err.message)
    }
  },

  // Mover tarea entre cuadrantes (drag & drop)
  moveTask: async (id, quadrant) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task || task.quadrant === quadrant) return
    // Actualización optimista
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, quadrant } : t)) }))
    try {
      await tasksApi.update(id, { quadrant })
      toast.info(`Movida a "${quadrant}"`)
    } catch (err) {
      // Revertir si falla
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, quadrant: task.quadrant } : t)) }))
      toast.error(err.message)
    }
  },

  // Marcar tarea como completada/incompleta
  toggleComplete: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return
    const newCompleted = !task.completed
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)) }))
    try {
      await tasksApi.update(id, { completed: newCompleted })
      toast.success(newCompleted ? '✅ Tarea completada' : 'Tarea reabierta')
    } catch (err) {
      // Revertir
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: task.completed } : t)) }))
      toast.error(err.message)
    }
  },

  // Eliminar tarea
  deleteTask: async (id) => {
    const prev = get().tasks
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    try {
      await tasksApi.remove(id)
      toast.success('Tarea eliminada')
    } catch (err) {
      set({ tasks: prev })
      toast.error(err.message)
    }
  },

  // Limpiar store al hacer logout
  clearTasks: () => set({ tasks: [] }),
}))

export default useTaskStore
