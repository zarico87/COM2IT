import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSun, FiMoon, FiLogIn, FiLogOut, FiUserPlus, FiSettings, FiMenu, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import useTaskStore from '../store/useTaskStore.js'
import s from './Navbar.module.css'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const clearTasks = useTaskStore((state) => state.clearTasks)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    const css = getComputedStyle(document.body)
    const { isConfirmed } = await Swal.fire({
      title: '¿Cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: css.getPropertyValue('--surface'),
      color: css.getPropertyValue('--text'),
      confirmButtonColor: '#ef4444',
    })
    if (isConfirmed) {
      clearTasks()
      logout()
      toast.info('Sesión cerrada 👋')
      navigate('/')
      setMenuOpen(false)
    }
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={s.header}>
      <nav className={s.nav}>
        {/* Logo */}
        <Link to="/" className={s.logo} onClick={closeMenu}>
          <img src="/img/logo.png" alt="com2it logo" className={s.logoImg} />
        </Link>

        {/* Desktop buttons */}
        <div className={s.actions}>
          <Link to="/cpanel" className={`${s.btn} ${s.btnOutline}`}>
            <FiSettings /> CPanel
          </Link>

          <button className={`${s.btn} ${s.btnOutline}`} onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>

          {user ? (
            <>
              <span className={s.hello}>Hola, <strong>{user.firstName}</strong> 👋</span>
              <button className={`${s.btn} ${s.btnDanger}`} onClick={handleLogout}>
                <FiLogOut /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${s.btn} ${s.btnOutline}`}>
                <FiLogIn /> Iniciar sesión
              </Link>
              <Link to="/register" className={`${s.btn} ${s.btnPrimary}`}>
                <FiUserPlus /> Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Hamburger - mobile */}
        <button
          className={s.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menú"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className={s.drawer}>
          <Link to="/cpanel" className={`${s.btn} ${s.btnOutline} ${s.fullWidth}`} onClick={closeMenu}>
            <FiSettings /> CPanel
          </Link>
          <button className={`${s.btn} ${s.btnOutline} ${s.fullWidth}`} onClick={() => { toggleTheme(); closeMenu() }}>
            {theme === 'light' ? <FiMoon /> : <FiSun />} Cambiar tema
          </button>
          {user ? (
            <>
              <span className={s.hello}>Hola, <strong>{user.firstName}</strong> 👋</span>
              <button className={`${s.btn} ${s.btnDanger} ${s.fullWidth}`} onClick={handleLogout}>
                <FiLogOut /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`${s.btn} ${s.btnOutline} ${s.fullWidth}`} onClick={closeMenu}>
                <FiLogIn /> Iniciar sesión
              </Link>
              <Link to="/register" className={`${s.btn} ${s.btnPrimary} ${s.fullWidth}`} onClick={closeMenu}>
                <FiUserPlus /> Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
