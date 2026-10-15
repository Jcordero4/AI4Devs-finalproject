import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../services/apiClient'
import { obtenerCliente, type Cliente } from '../services/clienteService'
import { listarMediciones, type MedicionResumen } from '../services/medicionService'

interface Datos {
  clienteId: string
  cliente: Cliente | null
  historial: MedicionResumen[]
  error: string | null
}

/** Carga el cliente y su histórico de mediciones; `recargarHistorial` lo refresca tras guardar. */
export function useDatosMedicion(clienteId: string) {
  const [datos, setDatos] = useState<Datos | null>(null)

  useEffect(() => {
    let cancelado = false
    Promise.all([obtenerCliente(clienteId), listarMediciones(clienteId)])
      .then(([cliente, historial]) => {
        if (!cancelado) setDatos({ clienteId, cliente, historial, error: null })
      })
      .catch((e: unknown) => {
        if (cancelado) return
        const error =
          e instanceof ApiError && e.status === 404 ? 'El cliente no existe.' : 'No se pudo cargar la información del cliente.'
        setDatos({ clienteId, cliente: null, historial: [], error })
      })
    return () => {
      cancelado = true
    }
  }, [clienteId])

  const recargarHistorial = useCallback(async () => {
    const historial = await listarMediciones(clienteId)
    setDatos((previo) => (previo && previo.clienteId === clienteId ? { ...previo, historial } : previo))
  }, [clienteId])

  const vigente = datos !== null && datos.clienteId === clienteId
  return {
    cargando: !vigente,
    cliente: vigente ? datos.cliente : null,
    historial: vigente ? datos.historial : [],
    error: vigente ? datos.error : null,
    recargarHistorial,
  }
}
