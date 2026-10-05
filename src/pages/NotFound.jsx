import { Link } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'
import s from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={s.wrap}>
      <h1 className={s.code}>404</h1>
      <p className={s.text}>Esta página no existe o fue movida.</p>
      <Link to="/" className={s.btn}><FiHome /> Volver al inicio</Link>
    </div>
  )
}
