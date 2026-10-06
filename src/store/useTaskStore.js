// store de tareas - usa zustand
// TODO: capaz despues agregar filtros por fecha
import { create } from 'zustand'
import { tasksApi } from '../services/api.js'
import { toast } from 'react-toastify'

// esta key la uso para guardar en localStorage (no la estoy usando todavia pero la dejo)
const LS_KEY = 'com2it_tasks_store'

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,

  // trae las tareas del usuario
  fetchTasks: async (ownerId) => {
    if (!ownerId) {
      set({ tasks: [] })
      return
    }
    set({ loading: true })
    try {
      const tasks = await tasksApi.list(ownerId)
      set({ tasks: tasks, loading: false })
    } catch (error) {
      console.error('error al cargar tareas:', error)
      toast.error('No se pudieron cargar las tareas')
      set({ loading: false })
    }
  },

  // agrega una tarea nueva
  addTask: async (data, ownerId) => {
    try {
      const nuevaTarea = await tasksApi.create(data, ownerId)
      set((estado) => ({ tasks: [...estado.tasks, nuevaTarea] }))
      toast.success('Tarea creada 🎉')
    } catch (err) {
      toast.error(err.message)
    }
  },

  // cuando arrastras la tarea a otro cuadrante
  moveTask: async (id, quadrant) => {
    const tareaActual = get().tasks.find((t) => t.id === id)
    if (!tareaActual) return
    if (tareaActual.quadrant === quadrant) return

    // labels para mostrar en el toast
    const nombresQuadrante = {
      urgente: 'Urgente',
      importante: 'Importante',
      delegar: 'Delegar',
      rehacer: 'Archivar',
    }

    // actualizo en el estado antes de que responda la API
    set((estado) => ({
      tasks: estado.tasks.map((t) => {
        if (t.id === id) return { ...t, quadrant: quadrant }
        return t
      })
    }))

    try {
      await tasksApi.update(id, { quadrant })
      const nombreMostrar = nombresQuadrante[quadrant] || quadrant
      toast.info(`Movida a "${nombreMostrar}" 📌`)
    } catch (err) {
      // si falla revierto el cambio
      console.log('fallo el update, revirtiendo...')
      set((estado) => ({
        tasks: estado.tasks.map((t) => {
          if (t.id === id) return { ...t, quadrant: tareaActual.quadrant }
          return t
        })
      }))
      toast.error(err.message)
    }
  },

  // edita titulo, descripcion, cuadrante o fecha de una tarea
  updateTask: async (id, patch) => {
    const tareasAntes = get().tasks
    // actualizo primero y despues confirmo con la API
    set((estado) => ({
      tasks: estado.tasks.map((t) => {
        if (t.id === id) return { ...t, ...patch }
        return t
      })
    }))
    try {
      await tasksApi.update(id, patch)
      toast.success('Guardado ✏️')
    } catch (err) {
      // si falla vuelvo a las tareas de antes
      set({ tasks: tareasAntes })
      toast.error(err.message)
    }
  },

  // marca como hecha o la reabre
  toggleComplete: async (id) => {
    const tarea = get().tasks.find((t) => t.id === id)
    if (!tarea) return

    const estabaCompletada = tarea.completed
    const nuevoValor = !estabaCompletada

    set((estado) => ({
      tasks: estado.tasks.map((t) => {
        if (t.id === id) return { ...t, completed: nuevoValor }
        return t
      })
    }))

    try {
      await tasksApi.update(id, { completed: nuevoValor })
      if (nuevoValor) {
        toast.success('✅ Tarea completada')
      } else {
        toast.success('Tarea reabierta')
      }
    } catch (err) {
      // revertir
      set((estado) => ({
        tasks: estado.tasks.map((t) => {
          if (t.id === id) return { ...t, completed: estabaCompletada }
          return t
        })
      }))
      toast.error(err.message)
    }
  },

  // borra la tarea
  deleteTask: async (id) => {
    const tareasAntes = get().tasks
    set((estado) => ({ tasks: estado.tasks.filter((t) => t.id !== id) }))
    try {
      await tasksApi.remove(id)
      toast.success('Tarea eliminada')
    } catch (err) {
      set({ tasks: tareasAntes })
      toast.error(err.message)
    }
  },

  // limpia todo cuando el usuario cierra sesion
  clearTasks: () => set({ tasks: [] }),
}))

export default useTaskStore
