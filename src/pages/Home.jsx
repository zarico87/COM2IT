import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import TubesBackground from '../components/TubesBackground.jsx'
import TaskForm from '../components/TaskForm.jsx'
import Board from '../components/Board.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useTaskStore from '../store/useTaskStore.js'
import s from './Home.module.css'

export default function Home() {
  const { user } = useAuth()
  const ownerId = user?.id || user?._id

  // Estado global de tareas desde Zustand
  const { tasks, loading, fetchTasks, addTask, moveTask, toggleComplete, deleteTask } = useTaskStore()

  // Cargar tareas cuando cambia el usuario (useEffect + Zustand)
  useEffect(() => {
    fetchTasks(ownerId)
  }, [ownerId, fetchTasks])

  const handleCreate = (data) => addTask(data, ownerId)
  const handleMove   = (id, quadrant) => moveTask(id, quadrant)
  const handleToggle = (id) => toggleComplete(id)

  const handleDelete = async (id) => {
    const task = tasks.find((t) => t.id === id)
    const css = getComputedStyle(document.body)
    const { isConfirmed } = await Swal.fire({
      title: '¿Eliminar tarea?',
      text: `"${task?.title}" será eliminada para siempre.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      background: css.getPropertyValue('--surface'),
      color: css.getPropertyValue('--text'),
    })
    if (isConfirmed) deleteTask(id)
  }

  return (
    <section className={s.hero}>
      <TubesBackground />

      {user ? (
        <div className={s.content}>
          {loading ? (
            <div className={s.loader}>
              <span className={s.spinner} />
              <p>Cargando tus tareas...</p>
            </div>
          ) : (
            <div className={s.layout}>
              <TaskForm onCreate={handleCreate} />
              <Board
                tasks={tasks}
                onMove={handleMove}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={s.gate}>
          <div className={s.gateCard}>
            <img src="/img/logo.png" alt="com2it" className={s.gateLogo} />
            <h1>Organizá tus tareas por prioridad</h1>
            
            <div className={s.actions}>
              <Link to="/login" className={`${s.btn} ${s.btnOutline}`}>Iniciar sesión</Link>
              <Link to="/register" className={`${s.btn} ${s.btnPrimary}`}>Crear cuenta gratis</Link>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
