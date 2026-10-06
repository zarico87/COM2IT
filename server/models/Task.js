import mongoose from 'mongoose'

// los cuadrantes que usa el frontend
const QUADRANTS = ['urgente', 'importante', 'delegar', 'rehacer']

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      default: '',
      maxlength: 200,
    },
    quadrant: {
      type: String,
      enum: QUADRANTS,
      default: 'urgente',
    },
    dueDate: {
      type: String,   // guardo como string "YYYY-MM-DD" igual que el frontend
      default: null,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // referencia al usuario dueño de la tarea
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

// para que devuelva id en lugar de solo _id al convertir a JSON
taskSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    return ret
  },
})

const Task = mongoose.model('Task', taskSchema)
export default Task
