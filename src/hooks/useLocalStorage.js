// Hook para persistir estado en localStorage usando useState + useEffect
// Uso: const [val, setVal] = useLocalStorage('mi_clave', valorInicial)
import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue))
    } catch {
      // Silent fail en modo privado de localStorage
    }
  }, [key, storedValue])

  const removeValue = () => {
    localStorage.removeItem(key)
    setStoredValue(initialValue)
  }

  return [storedValue, setStoredValue, removeValue]
}
