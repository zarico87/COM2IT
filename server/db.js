// conexion a MongoDB con mongoose
// NOTA: Conexión desactivada por el momento . Dejada como comentario para reactivar cuando sea necesario.
// import mongoose from 'mongoose'

export const connectDB = async () => {
  /*
  const uri = process.env.MONGO_URI

  // si no hay URI en el .env aviso
  if (!uri) {
    throw new Error('falta MONGO_URI en el archivo .env del servidor')
  }

  try {
    await mongoose.connect(uri)
    console.log('conectado a MongoDB')
  } catch (err) {
    console.error('error al conectar con MongoDB:', err.message)
    throw err
  }
  */
  console.log('ℹ️ Conexión con MongoDB desactivada (modo local)')
}
