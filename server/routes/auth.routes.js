import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import authMiddleware from '../middleware/auth.middleware.js'

const router = express.Router()

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, role } = req.body

    // verifico si ya existe el email o username
    const yaExiste = await User.findOne({ $or: [{ email }, { username }] })
    if (yaExiste) {
      return res.status(400).json({ message: 'El usuario o el email ya están registrados' })
    }

    // hasheo la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10)

    const nuevoUsuario = await User.create({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: role || 'usuario',
    })

    // no devuelvo la contraseña
    const { password: _, ...usuarioSeguro } = nuevoUsuario.toObject()
    res.status(201).json(usuarioSeguro)

  } catch (err) {
    console.error('error en register:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body

    // busco por email o username
    const usuario = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    })

    if (!usuario) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
    }

    const passwordOk = await bcrypt.compare(password, usuario.password)
    if (!passwordOk) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })
    }

    // genero el token con el id y el rol
    const token = jwt.sign(
      { id: usuario._id, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...usuarioSeguro } = usuario.toObject()
    res.json({ token, user: usuarioSeguro })

  } catch (err) {
    console.error('error en login:', err.message)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

// GET /admin/users - solo admins
router.get('/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    const usuarios = await User.find().select('-password')
    res.json(usuarios)
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' })
  }
})

export default router
