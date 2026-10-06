import mongoose from 'mongoose'

// esquema del usuario
// TODO: capaz mas adelante agregar avatar o configuraciones
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['usuario', 'admin'],
      default: 'usuario',
    },
  },
  { timestamps: true }
)

// configuracion para que devuelva id en lugar de _id y no exponga password
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret.password
    return ret
  },
})

const User = mongoose.model('User', userSchema)
export default User
