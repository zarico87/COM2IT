import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import s from './Layout.module.css'

export default function Layout() {
  const { theme } = useTheme()
  return (
    <div className={s.shell}>
      <Navbar />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
      <ToastContainer
        position="bottom-right"
        theme={theme}
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  )
}
