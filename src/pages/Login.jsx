import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiLogIn, FiUser, FiLock } from 'react-icons/fi'
import { useAuthActions } from '../hooks/useAuthActions.js'
import { validateLogin } from '../utils/validators.js'
import f from '../components/Form.module.css'
import s from './Auth.module.css'
import TubesBackground from '../components/TubesBackground.jsx'

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { handleLogin } = useAuthActions()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateLogin(form)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await handleLogin(form)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={s.wrap}>
      <TubesBackground />
      <form onSubmit={handleSubmit} noValidate className={`${f.form} ${f.card} ${s.card}`}>
        <h1 className={f.title}>🔐 Iniciar sesión</h1>

        <label className={f.field}>
          <span className={f.label}><FiUser /> Usuario o email</span>
          <input
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            autoComplete="username"
            placeholder="tu@email.com"
          />
          {errors.identifier && <span className={f.error}>{errors.identifier}</span>}
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
          <FiLogIn /> {submitting ? 'Entrando...' : 'Entrar'}
        </button>

        <p className={f.hint}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className={f.link}>Registrate</Link>
        </p>
      </form>
    </div>
  )
}
