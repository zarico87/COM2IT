import { useEffect, useRef } from 'react'
import { neonColors } from '../utils/neon.js'
import s from './TubesBackground.module.css'

// Licence CC BY-NC-SA 4.0 — efecto TubesCursor (threejs-components). Uso no comercial, con atribución.
const CDN = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'

export default function TubesBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    let app, cancelled = false
    const recolor = () => { app?.tubes.setColors(neonColors(3)); app?.tubes.setLightsColors(neonColors(4)) }

    import(/* @vite-ignore */ CDN)
      .then(({ default: TubesCursor }) => {
        if (cancelled) return
        app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ['#ff00ff', '#39ff14', '#00f0ff'],
            lights: { intensity: 200, colors: ['#39ff14', '#ff6ec7', '#00f0ff', '#fff01f'] },
          },
        })
        document.body.addEventListener('click', recolor)
      })
      .catch(() => console.warn('No se pudo cargar el efecto TubesCursor'))

    return () => { cancelled = true; app?.dispose?.(); document.body.removeEventListener('click', recolor) }
  }, [])

  return <canvas ref={canvasRef} className={s.canvas} />
}
