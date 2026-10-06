import { useState, useEffect } from 'react'
import { FiPlus, FiAlignLeft, FiTag, FiCalendar } from 'react-icons/fi'
import { QUADRANTS } from './Board.jsx'
import { validateTask } from '../utils/validators.js'
import s from './Form.module.css'

const EMPTY = { title: '', description: '', quadrant: 'urgente', dueDate: '' }

export default function TaskForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  // useEffect para limpiar el error del titulo cuando el usuario escribe al menos 3 letras
  useEffect(() => {
    if (form.title.trim().length >= 3 && errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }))
    }
  }, [form.title, errors.title])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpiar error al editar el campo
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validateTask(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    onCreate({
      ...form,
      title:       form.title.trim(),
      description: form.description.trim(),
      dueDate:     form.dueDate || null,
    })
    setForm(EMPTY)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={s.form}>
      <h2 className={s.title}>✏️ Nueva tarea</h2>

      <label className={s.field}>
        <span className={s.label}><FiTag /> Título</span>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ej: Entregar el TP de React ADAITW"
          maxLength={60}
          autoComplete="off"
        />
        {errors.title && <span className={s.error}>{errors.title}</span>}
        <span className={s.counter}>{form.title.length}/60</span>
      </label>

      <label className={s.field}>
        <span className={s.label}><FiAlignLeft /> Descripción</span>
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          placeholder="Opcional · Máx. 200 caracteres"
          maxLength={200}
        />
        {errors.description && <span className={s.error}>{errors.description}</span>}
      </label>

      <label className={s.field}>
        <span className={s.label}>📌 Cuadrante</span>
        <select name="quadrant" value={form.quadrant} onChange={handleChange}>
          {QUADRANTS.map((q) => (
            <option key={q.key} value={q.key}>{q.label}</option>
          ))}
        </select>
      </label>

      <label className={s.field}>
        <div className={s.dateHeader}>
          <span className={s.label}><FiCalendar /> Fecha límite</span>
          {form.dueDate && (
            <button
              type="button"
              className={s.clearDateBtn}
              onClick={(e) => {
                e.preventDefault()
                setForm((prev) => ({ ...prev, dueDate: '' }))
              }}
              title="Quitar fecha límite"
            >
              ✕ Quitar fecha
            </button>
          )}
        </div>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />
      </label>

      <button type="submit" className={s.submit}>
        <FiPlus /> Agregar tarea
      </button>
    </form>
  )
}
