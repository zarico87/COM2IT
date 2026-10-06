import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { FiShield, FiLogOut, FiUsers, FiCheckSquare, FiMail, FiLock, FiHome, FiSearch, FiRefreshCw } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthActions } from '../hooks/useAuthActions.js'
import useFetch from '../hooks/useFetch.js'
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
  // para volver a la pagina principal
  const irAlInicio = useNavigate()

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

        {/* boton para volver a la sesion normal */}
        <button
          type="button"
          className={f.submit}
          style={{ background: 'transparent', border: '2px solid var(--border)', color: 'var(--muted)', boxShadow: 'none', marginTop: '-0.25rem' }}
          onClick={() => irAlInicio('/')}
        >
          <FiHome /> Ir a mi sesión
        </button>
      </form>
    </div>
  )
}

/* ── Panel de Admin ───────────────────────────────────────────────────────────── */
function AdminPanel() {
  const { user } = useAuth()
  const { handleLogout } = useAuthActions()
  const irAlInicio = useNavigate()

  // useState para manejar el buscador de usuarios y filtro de rol
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('todos')

  // custom hook useFetch para cargar usuarios y tareas del sistema
  const { data, loading, error, refetch } = useFetch(async () => {
    const [u, t] = await Promise.all([authApi.listUsers(), tasksApi.listAll()])
    return { users: u || [], tasks: t || [] }
  })

  // useEffect para notificar si hubo algun error al cargar los datos
  useEffect(() => {
    if (error) {
      toast.error('No se pudieron cargar los datos de administración')
    }
  }, [error])

  // obtenemos los arreglos de usuarios y tareas
  const users = data?.users || []
  const tasks = data?.tasks || []

  // metodos funcionales: filter para la busqueda y el filtro de rol
  const filteredUsers = users.filter((u) => {
    const nombreCompleto = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
    const email = (u.email || '').toLowerCase()
    const username = (u.username || '').toLowerCase()
    const busqueda = searchTerm.toLowerCase().trim()

    const coincideTexto = !busqueda || nombreCompleto.includes(busqueda) || email.includes(busqueda) || username.includes(busqueda)
    const coincideRol = selectedRole === 'todos' || u.role === selectedRole

    return coincideTexto && coincideRol
  })

  // metodos funcionales: filter para contar completadas
  const completedCount = tasks.filter((t) => t.completed).length

  // opciones de filtro por rol usando map
  const roleOptions = [
    { key: 'todos', label: 'Todos' },
    { key: 'usuario', label: 'Usuarios' },
    { key: 'admin', label: 'Admins' },
  ]

  return (
    <div className={s.page}>
      <div className={s.panel}>
        {/* Header */}
        <header className={s.head}>
          <div>
            <h1 className={s.panelTitle}><FiShield /> CPanel</h1>
            <p className={s.sub}>Sesión: <strong>{user.email}</strong></p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className={s.refreshBtn} onClick={refetch} title="Recargar datos">
              <FiRefreshCw /> Recargar
            </button>
            <button className={s.goHome} onClick={() => irAlInicio('/')}>
              <FiHome /> Mi sesión
            </button>
            <button className={s.out} onClick={handleLogout}>
              <FiLogOut /> Salir
            </button>
          </div>
        </header>

        {/* Stats con map */}
        <div className={s.stats}>
          <div className={`${s.stat} ${s.statBlue}`}>
            <FiUsers className={s.statIcon} />
            <div>
              <span className={s.statNum}>{users.length}</span>
              <span className={s.statLabel}>Usuarios registrados</span>
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

        {/* Toolbar con buscador y filtros */}
        <div className={s.toolbar}>
          <div className={s.searchWrap}>
            <FiSearch className={s.searchIcon} />
            <input
              type="text"
              className={s.searchInput}
              placeholder="Buscar por nombre, email o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={s.filterGroup}>
            {roleOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`${s.filterBtn} ${selectedRole === opt.key ? s.activeFilter : ''}`}
                onClick={() => setSelectedRole(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <p className={s.loading}>Cargando datos con useFetch...</p>
        ) : filteredUsers.length === 0 ? (
          <div className={s.emptyState}>
            <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
          </div>
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
                {filteredUsers.map((u) => {
                  // usamos filter para calcular tareas del usuario
                  const userId = u.id || u._id
                  const userTasks = tasks.filter((t) => {
                    const taskOwner = t.ownerId?._id || t.ownerId || t.ownerId?.id
                    return taskOwner === userId
                  })
                  const done = userTasks.filter((t) => t.completed).length

                  return (
                    <tr key={userId}>
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

