// Punto único de acceso a datos.
// Con VITE_API_URL apunta al backend real (Express + MongoDB);
// sin ella funciona en modo local con localStorage.
// import axios from 'axios'

// const API = import.meta.env.VITE_API_URL

// ── helpers localStorage ──────────────────────────────────────────────────────
const read = (k) => JSON.parse(localStorage.getItem(k) || '[]')
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const strip = ({ password, ...safe }) => safe

// ── instancia axios con token auto-inyectado (desactivada) ─────────────────────
// const http = axios.create({ baseURL: API })
//
// http.interceptors.request.use((cfg) => {
//   const token = localStorage.getItem('com2it_token')
//   if (token && token !== 'undefined' && token !== 'null') {
//     cfg.headers.Authorization = `Bearer ${token}`
//   } else {
//     delete cfg.headers.Authorization
//   }
//   return cfg
// })
//
// http.interceptors.response.use(
//   (res) => res.data,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('com2it_token')
//       localStorage.removeItem('com2it_session')
//     }
//     const msg = err.response?.data?.message || 'Error de servidor'
//     return Promise.reject(new Error(msg))
//   }
// )

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authApi = {
  async register(d) {
    // if (API) {
    //   const res = await http.post('/auth/register', d)
    //   if (res?.token) localStorage.setItem('com2it_token', res.token)
    //   return res?.user ? res.user : res
    // }
    const users = read('com2it_users')
    if (users.some((u) => u.email === d.email || u.username === d.username))
      throw new Error('El usuario o el email ya están registrados')
    const user = { ...d, id: crypto.randomUUID() }
    write('com2it_users', [...users, user])
    // generamos un token local valido para que no haya errores
    const localToken = 'local_' + btoa(encodeURIComponent(JSON.stringify({ id: user.id, role: user.role, t: Date.now() })))
    localStorage.setItem('com2it_token', localToken)
    return strip(user)
  },

  async login({ identifier, password }) {
    // if (API) {
    //   const res = await http.post('/auth/login', { identifier, password })
    //   if (res?.token) localStorage.setItem('com2it_token', res.token)
    //   return res?.user ? res.user : res
    // }
    const u = read('com2it_users').find(
      (x) => (x.email === identifier || x.username === identifier) && x.password === password
    )
    if (!u) throw new Error('Usuario o contraseña incorrectos')
    // generamos token local
    const localToken = 'local_' + btoa(encodeURIComponent(JSON.stringify({ id: u.id, role: u.role, t: Date.now() })))
    localStorage.setItem('com2it_token', localToken)
    return strip(u)
  },

  async listUsers() {
    // return API ? http.get('/admin/users') : read('com2it_users').map(strip)
    return read('com2it_users').map(strip)
  },

  async logout() {
    localStorage.removeItem('com2it_token')
    localStorage.removeItem('com2it_session')
  },
}

// ── TASKS ─────────────────────────────────────────────────────────────────────
const normalizeTask = (t) => (t ? { ...t, id: t.id || t._id } : t)

export const tasksApi = {
  async list(ownerId) {
    // if (API) {
    //   const res = await http.get('/tasks')
    //   return (res || []).map(normalizeTask)
    // }
    return read('com2it_tasks').filter((t) => t.ownerId === ownerId)
  },

  async listAll() {
    // if (API) {
    //   const res = await http.get('/admin/tasks')
    //   return (res || []).map(normalizeTask)
    // }
    return read('com2it_tasks')
  },

  async create(t, ownerId) {
    // if (API) {
    //   const res = await http.post('/tasks', t)
    //   return normalizeTask(res)
    // }
    const task = { ...t, ownerId, id: crypto.randomUUID(), createdAt: Date.now(), completed: false }
    write('com2it_tasks', [...read('com2it_tasks'), task])
    return task
  },

  async update(id, patch) {
    // if (API) return http.patch(`/tasks/${id}`, patch)
    write('com2it_tasks', read('com2it_tasks').map((t) => (t.id === id ? { ...t, ...patch } : t)))
  },

  async remove(id) {
    // if (API) return http.delete(`/tasks/${id}`)
    write('com2it_tasks', read('com2it_tasks').filter((t) => t.id !== id))
  },
}
