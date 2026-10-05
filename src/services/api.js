// Punto único de acceso a datos.
// Con VITE_API_URL apunta al backend real (Express + MongoDB);
// sin ella funciona en modo local con localStorage.
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

// ── helpers localStorage ──────────────────────────────────────────────────────
const read = (k) => JSON.parse(localStorage.getItem(k) || '[]')
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const strip = ({ password, ...safe }) => safe

// ── instancia axios con token auto-inyectado ──────────────────────────────────
const http = axios.create({ baseURL: API })

http.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('com2it_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || 'Error de servidor'
    return Promise.reject(new Error(msg))
  }
)

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  async register(d) {
    if (API) return http.post('/auth/register', d)
    const users = read('com2it_users')
    if (users.some((u) => u.email === d.email || u.username === d.username))
      throw new Error('El usuario o el email ya están registrados')
    const user = { ...d, id: crypto.randomUUID() }
    write('com2it_users', [...users, user])
    return strip(user)
  },

  async login({ identifier, password }) {
    if (API) return http.post('/auth/login', { identifier, password })
    const u = read('com2it_users').find(
      (x) => (x.email === identifier || x.username === identifier) && x.password === password
    )
    if (!u) throw new Error('Usuario o contraseña incorrectos')
    return strip(u)
  },

  async listUsers() {
    return API ? http.get('/admin/users') : read('com2it_users').map(strip)
  },
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
export const tasksApi = {
  async list(ownerId) {
    return API ? http.get('/tasks') : read('com2it_tasks').filter((t) => t.ownerId === ownerId)
  },

  async listAll() {
    return API ? http.get('/admin/tasks') : read('com2it_tasks')
  },

  async create(t, ownerId) {
    if (API) return http.post('/tasks', t)
    const task = { ...t, ownerId, id: crypto.randomUUID(), createdAt: Date.now(), completed: false }
    write('com2it_tasks', [...read('com2it_tasks'), task])
    return task
  },

  async update(id, patch) {
    if (API) return http.patch(`/tasks/${id}`, patch)
    write('com2it_tasks', read('com2it_tasks').map((t) => (t.id === id ? { ...t, ...patch } : t)))
  },

  async remove(id) {
    if (API) return http.delete(`/tasks/${id}`)
    write('com2it_tasks', read('com2it_tasks').filter((t) => t.id !== id))
  },
}
