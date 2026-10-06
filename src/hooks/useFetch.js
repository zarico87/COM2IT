// hook personalizado para hacer peticiones http (useFetch)
// utiliza useState y useEffect para manejar los estados de carga, data y error
import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch(fetchFnOrUrl, dependencies = []) {
  // estados que usa el hook
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // guardamos la funcion en un ref para que no cambie la identidad
  // en cada render (evita un loop de fetchs)
  const fnRef = useRef(fetchFnOrUrl)
  fnRef.current = fetchFnOrUrl

  // funcion que dispara la peticion
  const ejecutarFetch = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let respuesta
      // si pasamos una funcion (como authApi.listUsers o tasksApi.listAll) la llamamos
      if (typeof fnRef.current === 'function') {
        respuesta = await fnRef.current()
      } else if (typeof fnRef.current === 'string') {
        // si viene un string hacemos fetch directo
        const res = await fetch(fnRef.current)
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`)
        }
        respuesta = await res.json()
      }
      setData(respuesta)
    } catch (err) {
      console.error('error en useFetch:', err)
      setError(err.message || 'Error al obtener los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  // useEffect para ejecutar la peticion al cargar o si cambian dependencias
  useEffect(() => {
    ejecutarFetch()
  }, [ejecutarFetch, ...dependencies])

  // retorno los estados y la funcion refetch para poder recargar cuando queramos
  return { data, loading, error, refetch: ejecutarFetch }
}

export default useFetch
