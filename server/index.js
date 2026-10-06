// punto de entrada del servidor
// arranca express y conecta a mongo
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.routes.js'
import taskRoutes from './routes/task.routes.js'
import adminRoutes from './routes/admin.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// middlewares basicos
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

// rutas
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)
app.use('/admin', adminRoutes)

// ruta de prueba para saber si el server anda
app.get('/', (req, res) => {
  res.json({ mensaje: 'API com2it funcionando ok' })
})

// conexion a MongoDB (comentada temporalmente)
// connectDB().then(() => {
//   app.listen(PORT, () => console.log(`servidor corriendo en puerto ${PORT}`))
// }).catch(err => {
//   console.error('no se pudo conectar a MongoDB:', err.message)
//   process.exit(1)
// })

// arrancamos el servidor directamente en modo local / sin base de datos
app.listen(PORT, () => {
  console.log(`servidor corriendo en puerto ${PORT} (MongoDB desactivado / modo local)`)
})
