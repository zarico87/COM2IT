import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { FiShield, FiLogOut, FiUsers, FiCheckSquare, FiMail, FiLock } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthActions } from '../hooks/useAuthActions.js'
import { authApi, tasksApi } from '../services/api.js'
import { validateAdminLogin } from '../utils/validators.js'
import TubesBackground from '../components/TubesBackground.jsx'
import f from '../components/Form.module.css'
import s from './CPanel.module.css'

/* ── Login de Admin ───────────────────────────────────────────────────────────── */
function AdminLogin() {
  const { handleAdminLogin } = useAuthActions()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateAdminLogin(form)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await handleAdminLogin(form)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={s.wrap}>
      <TubesBackground />
      <form onSubmit={handleSubmit} noValidate className={`${f.form} ${f.card} ${s.loginCard}`}>
        <div className={s.shieldWrap}>
          <FiShield className={s.shield} />
        </div>
        <h1 className={f.title}>CPanel · Acceso admin</h1>

        <label className={f.field}>
          <span className={f.label}><FiMail /> Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="admin@gmail.com"
          />
          {errors.email && <span className={f.error}>{errors.email}</span>}
        </label>

        <label className={f.field}>
          <span className={f.label}><FiLock /> Contraseña</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="••••••"
          />
          {errors.password && <span className={f.error}>{errors.password}</span>}
        </label>

        <button type="submit" className={f.submit} disabled={submitting}>
          <FiShield /> {submitting ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

/* ── Panel de Admin ───────────────────────────────────────────────────────────── */
function AdminPanel() {
  const { user } = useAuth()
  const { handleLogout } = useAuthActions()
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([authApi.listUsers(), tasksApi.listAll()])
      .then(([u, t]) => { setUsers(u); setTasks(t) })
      .catch(() => toast.error('No se pudieron cargar los datos'))
      .finally(() => setLoading(false))
  }, [])

  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div className={s.page}>
      <div className={s.panel}>
        {/* Header */}
        <header className={s.head}>
          <div>
            <h1 className={s.panelTitle}><FiShield /> CPanel</h1>
            <p className={s.sub}>Sesión: <strong>{user.email}</strong></p>
          </div>
          <button className={s.out} onClick={handleLogout}>
            <FiLogOut /> Salir
          </button>
        </header>

        {/* Stats */}
        <div className={s.stats}>
          <div className={`${s.stat} ${s.statBlue}`}>
            <FiUsers className={s.statIcon} />
            <div>
              <span className={s.statNum}>{users.length}</span>
              <span className={s.statLabel}>Usuarios</span>
            </div>
          </div>
          <div className={`${s.stat} ${s.statOrange}`}>
            <FiCheckSquare className={s.statIcon} />
            <div>
              <span className={s.statNum}>{tasks.length}</span>
              <span className={s.statLabel}>Tareas totales</span>
            </div>
          </div>
          <div className={`${s.stat} ${s.statGreen}`}>
            <FiCheckSquare className={s.statIcon} />
            <div>
              <span className={s.statNum}>{completedCount}</span>
              <span className={s.statLabel}>Completadas</span>
            </div>
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <p className={s.loading}>Cargando datos...</p>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Tareas</th>
                  <th>Completadas</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const userTasks = tasks.filter((t) => t.ownerId === (u.id || u._id))
                  const done = userTasks.filter((t) => t.completed).length
                  return (
                    <tr key={u.id || u._id}>
                      <td>{u.firstName} {u.lastName}</td>
                      <td className={s.emailCell}>{u.email}</td>
                      <td><code>{u.username}</code></td>
                      <td>
                        <span className={u.role === 'admin' ? s.badgeAdmin : s.badgeUser}>
                          {u.role}
                        </span>
                      </td>
                      <td className={s.center}>{userTasks.length}</td>
                      <td className={s.center}>{done}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Export ───────────────────────────────────────────────────────────────────── */
export default function CPanel() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <AdminPanel /> : <AdminLogin />
}
