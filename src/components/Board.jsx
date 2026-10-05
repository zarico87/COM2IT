import { useState } from 'react'
import { FiTrash2, FiCheckCircle, FiCircle, FiCheck } from 'react-icons/fi'
import useTaskStore from '../store/useTaskStore.js'
import s from './Board.module.css'

export const QUADRANTS = [
  { key: 'urgente',    label: '🔴 Urgente',    color: '#ef4444', text: '#fff',    desc: 'Hacé ahora' },
  { key: 'importante', label: '🟡 Importante',  color: '#facc15', text: '#0f172a', desc: 'Planificá' },
  { key: 'delegar',    label: '🟢 Delegar',     color: '#22c55e', text: '#0f172a', desc: 'Delegá' },
  { key: 'rehacer',    label: '🟠 Archivar',     color: '#f97316', text: '#0f172a', desc: 'Eliminá / rehacé' },
]

function TaskCard({ task, onDelete, onToggle }) {
  return (
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
        {task.description && <p>{task.description}</p>}
      </div>

      <button
        className={s.deleteBtn}
        onClick={() => onDelete(task.id)}
        aria-label={`Eliminar ${task.title}`}
        title="Eliminar tarea"
      >
        <FiTrash2 />
      </button>
    </article>
  )
}

export default function Board({ tasks, onMove, onDelete, onToggle }) {
  const [over, setOver] = useState(null)

  const handleDrop = (e, key) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) onMove(id, key)
    setOver(null)
  }

  const activeTasks    = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  return (
    <div className={s.wrapper}>
      {/* ── Grilla de cuadrantes  ──────────────────────── */}
      <div className={s.board}>
        {QUADRANTS.map((q) => {
          const items = activeTasks.filter((t) => t.quadrant === q.key)
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
                {items.length === 0 && (
                  <p className={s.empty}>Arrastrá una tarea acá</p>
                )}
                {items.map((t) => (
                  <TaskCard key={t.id} task={t} onDelete={onDelete} onToggle={onToggle} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* ── Cuadrante de tareas completadas ────────────────── */}
      {completedTasks.length > 0 && (
        <section className={s.completedSection}>
          <header className={s.completedHead}>
            <FiCheck className={s.completedIcon} />
            <h3>Tareas completadas</h3>
            <span className={s.completedBadge}>{completedTasks.length}</span>
          </header>
          <div className={s.completedList}>
            {completedTasks.map((t) => (
              <TaskCard key={t.id} task={t} onDelete={onDelete} onToggle={onToggle} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
