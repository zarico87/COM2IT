// middleware para verificar el JWT en rutas protegidas
import jwt from 'jsonwebtoken'

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  // si no viene el header, corto aca
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no enviado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded   // guardo el payload para usarlo en las rutas
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

export default authMiddleware
