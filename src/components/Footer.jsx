import s from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={s.footer}>
      <span>© 2026 · com2it · Organizá tu día a día</span>
      <span className={s.credit}>Diseño por <strong>zadikdesign</strong></span>
    </footer>
  )
}
