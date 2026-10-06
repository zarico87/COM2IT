import { useState, useEffect } from 'react'
import { FiTrash2, FiCheckCircle, FiCircle, FiCheck, FiEdit2, FiX, FiSave, FiCalendar, FiSearch } from 'react-icons/fi'
import s from './Board.module.css'

export const QUADRANTS = [
  { key: 'urgente',    label: '🔴 Urgente',    color: '#ef4444', text: '#fff',    desc: 'Hacé ahora' },
  { key: 'importante', label: '🟡 Importante',  color: '#facc15', text: '#0f172a', desc: 'Planificá' },
  { key: 'delegar',    label: '🟢 Delegar',     color: '#22c55e', text: '#0f172a', desc: 'Delegá' },
  { key: 'rehacer',    label: '🟠 Archivar',    color: '#f97316', text: '#0f172a', desc: 'Eliminá / rehacé' },
]

/* ── Modal de edición ──────────────────────────────────────────────────────── */
function EditModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description || '',
    quadrant:    task.quadrant,
    dueDate:     task.dueDate || '',
  })
  const [errors, setErrors] = useState({})

  // listener con useEffect para cerrar el modal al presionar Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleSave = () => {
    const errs = {}

    // valido el titulo
    if (!form.title.trim()) {
      errs.title = 'Escribí un título'
    } else if (form.title.trim().length < 3) {
      errs.title = 'Mínimo 3 caracteres'
    } else if (form.title.length > 60) {
      errs.title = 'Máximo 60 caracteres'
    }

    form.description.length > 200 && (errs.description = 'Máximo 200 caracteres')

    setErrors(errs)
    if (Object.keys(errs).length) return

    onSave(task.id, {
      title:       form.title.trim(),
      description: form.description.trim(),
      quadrant:    form.quadrant,
      dueDate:     form.dueDate || null,
    })
    onClose()
  }

  return (
    <div className={s.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <header className={s.modalHead}>
          <h3>✏️ Editar tarea</h3>
          <button className={s.modalClose} onClick={onClose} aria-label="Cerrar">
            <FiX />
          </button>
        </header>

        <div className={s.modalBody}>
          {/* Titulo */}
          <label className={s.modalField}>
            <span className={s.modalLabel}>Título</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={60}
              autoFocus
            />
            {errors.title && <span className={s.modalError}>{errors.title}</span>}
            <span className={s.modalCounter}>{form.title.length}/60</span>
          </label>

          {/* Descripcion */}
          <label className={s.modalField}>
            <span className={s.modalLabel}>Descripción</span>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              maxLength={200}
              placeholder="Opcional · Máx. 200 caracteres"
            />
            {errors.description && <span className={s.modalError}>{errors.description}</span>}
          </label>

          {/* Cuadrante */}
          <label className={s.modalField}>
            <span className={s.modalLabel}>📌 Cuadrante</span>
            <select name="quadrant" value={form.quadrant} onChange={handleChange}>
              {QUADRANTS.map(q => (
                <option key={q.key} value={q.key}>{q.label}</option>
              ))}
            </select>
          </label>

          {/* Fecha */}
          <label className={s.modalField}>
            <span className={s.modalLabel}><FiCalendar /> Fecha límite</span>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </label>
        </div>

        <footer className={s.modalFooter}>
          <button className={s.modalCancel} onClick={onClose}>Cancelar</button>
          <button className={s.modalSave} onClick={handleSave}>
            <FiSave /> Guardar
          </button>
        </footer>
      </div>
    </div>
  )
}

/* ── Tarjeta ───────────────────────────────────────────────────────────────── */
function TaskCard({ task, onDelete, onToggle, onEdit }) {
  const [showEdit, setShowEdit] = useState(false)

  // convierte "2025-10-05" a "05/10/2025"
  const formatDate = (d) => {
    if (!d) return null
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  return (
    <>
      <article
        className={`${s.card} ${task.completed ? s.cardDone : ''}`}
        draggable={!task.completed}
        onDragStart={(e) => !task.completed && e.dataTransfer.setData('text/plain', task.id)}
      >
        <button
          className={s.checkBtn}
          onClick={() => onToggle(task.id)}
          aria-label={task.completed ? 'Reabrir tarea' : 'Completar tarea'}
          title={task.completed ? 'Reabrir' : 'Marcar como hecha'}
        >
          {task.completed ? <FiCheckCircle className={s.iconDone} /> : <FiCircle />}
        </button>

        <div className={s.cardBody}>
          <h4 className={task.completed ? s.titleDone : ''}>{task.title}</h4>
          {/* solo muestra la descripcion si tiene algo */}
          {task.description && <p>{task.description}</p>}
          {task.dueDate && (
            <span className={s.dueBadge}>
              <FiCalendar /> {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <button
          className={s.editBtn}
          onClick={() => setShowEdit(true)}
          aria-label={`Editar ${task.title}`}
          title="Editar tarea"
        >
          <FiEdit2 />
        </button>

        <button
          className={s.deleteBtn}
          onClick={() => onDelete(task.id)}
          aria-label={`Eliminar ${task.title}`}
          title="Eliminar tarea"
        >
          <FiTrash2 />
        </button>
      </article>

      {showEdit && (
        <EditModal
          task={task}
          onClose={() => setShowEdit(false)}
          onSave={onEdit}
        />
      )}
    </>
  )
}

/* ── Board ─────────────────────────────────────────────────────────────────── */
export default function Board({ tasks, onMove, onDelete, onToggle, onEdit }) {
  // useState para el drag & drop, la barra de búsqueda y el filtro de cuadrante
  const [over, setOver] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCuadrante, setFiltroCuadrante] = useState('todos')

  const handleDrop = (e, key) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    id && onMove(id, key)   // cortocircuito: solo llama si hay id
    setOver(null)
  }

  // metodos funcionales de array: filter para buscar por texto y cuadrante
  const tareasFiltradas = tasks.filter((t) => {
    const query = busqueda.toLowerCase().trim()
    const coincideTitulo = t.title.toLowerCase().includes(query)
    const coincideDesc = t.description ? t.description.toLowerCase().includes(query) : false
    const coincideTexto = !query || coincideTitulo || coincideDesc
    const coincideCuadrante = filtroCuadrante === 'todos' || t.quadrant === filtroCuadrante
    return coincideTexto && coincideCuadrante
  })

  // separo las activas de las completadas con filter
  const activeTasks    = tareasFiltradas.filter(t => !t.completed)
  const completedTasks = tareasFiltradas.filter(t => t.completed)

  // lista de filtros usando map
  const opcionesFiltro = [
    { key: 'todos', label: 'Todas' },
    ...QUADRANTS.map(q => ({ key: q.key, label: q.label })),
  ]

  return (
    <div className={s.wrapper}>
      {/* barra responsive con buscador y chips de filtro */}
      <div className={s.toolbar}>
        <div className={s.searchBox}>
          <FiSearch className={s.searchIcon} />
          <input
            type="text"
            className={s.searchInput}
            placeholder="Buscar tarea por título o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className={s.chips}>
          {opcionesFiltro.map(opt => (
            <button
              key={opt.key}
              type="button"
              className={`${s.chip} ${filtroCuadrante === opt.key ? s.chipActive : ''}`}
              onClick={() => setFiltroCuadrante(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* grilla responsive de los 4 cuadrantes */}
      <div className={s.board}>
        {QUADRANTS.map(q => {
          // filtramos las tareas correspondientes a este cuadrante
          const items = activeTasks.filter(t => t.quadrant === q.key)
          return (
            <section
              key={q.key}
              className={`${s.quadrant} ${over === q.key ? s.over : ''}`}
              style={{ '--qc': q.color }}
              onDragOver={(e) => { e.preventDefault(); setOver(q.key) }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => handleDrop(e, q.key)}
            >
              <header className={s.qHead} style={{ background: q.color, color: q.text }}>
                <div>
                  <h3>{q.label}</h3>
                  <small className={s.desc}>{q.desc}</small>
                </div>
                <span className={s.badge}>{items.length}</span>
              </header>

              <div className={s.list}>
                {/* si no hay tareas muestro el placeholder */}
                {items.length === 0
                  ? <p className={s.empty}>Arrastrá una tarea acá</p>
                  : items.map(t => (
                      <TaskCard key={t.id} task={t} onDelete={onDelete} onToggle={onToggle} onEdit={onEdit} />
                    ))
                }
              </div>
            </section>
          )
        })}
      </div>

      {/* seccion de tareas completadas, solo aparece si hay alguna */}
      {completedTasks.length > 0 && (
        <section className={s.completedSection}>
          <header className={s.completedHead}>
            <FiCheck className={s.completedIcon} />
            <h3>Tareas completadas</h3>
            <span className={s.completedBadge}>{completedTasks.length}</span>
          </header>
          <div className={s.completedList}>
            {completedTasks.map(t => (
              <TaskCard key={t.id} task={t} onDelete={onDelete} onToggle={onToggle} onEdit={onEdit} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

