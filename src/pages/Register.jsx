import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiUserPlus, FiUser, FiMail, FiLock, FiTag } from 'react-icons/fi'
import { useAuthActions } from '../hooks/useAuthActions.js'
import { validateRegister } from '../utils/validators.js'
import f from '../components/Form.module.css'
import s from './Auth.module.css'
import TubesBackground from '../components/TubesBackground.jsx'

const INITIAL = {
  firstName: '', lastName: '', email: '', username: '', password: '', role: 'usuario',
}

const FIELDS = [
  { name: 'firstName', label: 'Nombre',     type: 'text',     ac: 'given-name',   icon: <FiUser />,  ph: 'Juan' },
  { name: 'lastName',  label: 'Apellido',   type: 'text',     ac: 'family-name',  icon: <FiUser />,  ph: 'Pérez' },
  { name: 'email',     label: 'Email',      type: 'email',    ac: 'email',        icon: <FiMail />,  ph: 'juan@email.com' },
  { name: 'username',  label: 'Usuario (máx. 8, 1 mayúscula y 1 especial)', type: 'text', ac: 'username', icon: <FiTag />, ph: 'JuaN#1' },
  { name: 'password',  label: 'Contraseña', type: 'password', ac: 'new-password', icon: <FiLock />,  ph: '••••••' },
]

export default function Register() {
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const { handleRegister } = useAuthActions()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateRegister(form)
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await handleRegister(form)
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
        <h1 className={f.title}>🚀 Crear cuenta</h1>

        {FIELDS.map(({ name, label, type, ac, icon, ph }) => (
          <label key={name} className={f.field}>
            <span className={f.label}>{icon} {label}</span>
            <input
              name={name}
              type={type}
              autoComplete={ac}
              maxLength={name === 'username' ? 8 : undefined}
              value={form[name]}
              onChange={handleChange}
              placeholder={ph}
            />
            {errors[name] && <span className={f.error}>{errors[name]}</span>}
          </label>
        ))}

        <label className={f.field}>
          <span className={f.label}>🎭 Rol</span>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="usuario">Usuario</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <span className={f.error}>{errors.role}</span>}
        </label>

        <button type="submit" className={f.submit} disabled={submitting}>
          <FiUserPlus /> {submitting ? 'Registrando...' : 'Registrarme'}
        </button>

        <p className={f.hint}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className={f.link}>Iniciá sesión</Link>
        </p>
      </form>
    </div>
  )
}
