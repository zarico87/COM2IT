// Hook personalizado para manejar el estado y lógica de formularios genéricos
// Incluye estado local con useState, validación y limpieza
import { useState, useCallback } from 'react'

export function useForm(initialValues, validate) {
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpiar error del campo que se está editando
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }, [])

  const handleSubmit = useCallback(
    async (onSubmit) => async (e) => {
      e.preventDefault()
      if (validate) {
        const errs = validate(form)
        setErrors(errs)
        if (Object.keys(errs).length) return
      }
      setSubmitting(true)
      try {
        await onSubmit(form)
      } finally {
        setSubmitting(false)
      }
    },
    [form, validate]
  )

  const reset = useCallback(() => {
    setForm(initialValues)
    setErrors({})
  }, [initialValues])

  return { form, errors, submitting, handleChange, handleSubmit, reset, setForm }
}
