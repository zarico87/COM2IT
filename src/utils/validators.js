const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{1,8}$/

export const validateTask = ({ title, description }) => {
  const e = {}
  if (!title.trim()) e.title = 'Escribí un título'
  else if (title.trim().length < 3) e.title = 'Mínimo 3 caracteres'
  else if (title.length > 60) e.title = 'Máximo 60 caracteres'
  if (description.length > 200) e.description = 'Máximo 200 caracteres'
  return e
}
export const validateLogin = ({ identifier, password }) => {
  const e = {}
  if (!identifier.trim()) e.identifier = 'Ingresá tu usuario o email'
  if (!password) e.password = 'Ingresá tu contraseña'
  return e
}
export const validateRegister = ({ firstName, lastName, email, username, password, role }) => {
  const e = {}
  if (firstName.trim().length < 2) e.firstName = 'Ingresá tu nombre'
  if (lastName.trim().length < 2) e.lastName = 'Ingresá tu apellido'
  if (!EMAIL.test(email)) e.email = 'Email inválido'
  if (!USERNAME.test(username)) e.username = 'Máx. 8 caracteres, con una mayúscula y un carácter especial'
  if (password.length < 6) e.password = 'Mínimo 6 caracteres'
  if (!['usuario', 'admin'].includes(role)) e.role = 'Elegí un rol'
  return e
}
export const validateAdminLogin = ({ email, password }) => {
  const e = {}
  if (!EMAIL.test(email)) e.email = 'Ingresá un email válido'
  if (!password) e.password = 'Ingresá tu contraseña'
  return e
}
