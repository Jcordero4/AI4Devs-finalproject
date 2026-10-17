import { useEffect, useState } from 'react'
import { ApiError } from '../services/apiClient'
import { obtenerCliente, type Cliente } from '../services/clienteService'

interface Datos {
  clienteId: string
  cliente: Cliente | null
  error: string | null
}

/** Carga un cliente por Id. "cargando" se deriva de que aún no hay datos para el Id actual (sin setState síncrono en el efecto). */
export function useCliente(clienteId: string) {
  const [datos, setDatos] = useState<Datos | null>(null)

  useEffect(() => {
    let cancelado = false
    obtenerCliente(clienteId)
      .then((cliente) => {
        if (!cancelado) setDatos({ clienteId, cliente, error: null })
      })
      .catch((e: unknown) => {
        if (cancelado) return
        const error =
          e instanceof ApiError && e.status === 404 ? 'El cliente no existe.' : 'No se pudo cargar la información del cliente.'
        setDatos({ clienteId, cliente: null, error })
      })
    return () => {
      cancelado = true
    }
  }, [clienteId])

  const vigente = datos !== null && datos.clienteId === clienteId
  return {
    cargando: !vigente,
    cliente: vigente ? datos.cliente : null,
    error: vigente ? datos.error : null,
  }
}
