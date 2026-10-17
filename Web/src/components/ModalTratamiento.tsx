import { useRef, useState } from 'react'
import { filaCompleta, type FilaTratamiento } from '../utils/medicionFormulario'
import { IconoMas, IconoPapelera } from './Iconos'
import ModalBase from './ModalBase'
import ModalConfirmacion from './ModalConfirmacion'

const MENSAJE_INCOMPLETO = 'Hay tratamientos sin asignar. Debe asegurarse de que todo esté completo.'

interface ModalTratamientoProps {
  filas: FilaTratamiento[]
  onCambiarFilas: (filas: FilaTratamiento[]) => void
  onCerrar: () => void
}

export default function ModalTratamiento({ filas, onCambiarFilas, onCerrar }: ModalTratamientoProps) {
  const [error, setError] = useState<string | null>(null)
  const [revisando, setRevisando] = useState(false)
  const [claveAEliminar, setClaveAEliminar] = useState<number | null>(null)
  const claveAEnfocar = useRef<number | null>(null)
  const botonNuevoRef = useRef<HTMLButtonElement>(null)

  // Cerrar (botón o Escape) pasa siempre por esta validación.
  const intentarCerrar = () => {
    if (!filas.every(filaCompleta)) {
      setError(MENSAJE_INCOMPLETO)
      setRevisando(true)
      return
    }
    onCerrar()
  }

  const cambiarFila = (clave: number, campo: 'producto' | 'dosis', valor: string) => {
    setError(null)
    onCambiarFilas(filas.map((f) => (f.clave === clave ? { ...f, [campo]: valor } : f)))
  }

  const agregarFila = () => {
    const clave = filas.reduce((max, f) => Math.max(max, f.clave), 0) + 1
    claveAEnfocar.current = clave
    onCambiarFilas([...filas, { clave, producto: '', dosis: '' }])
  }

  const eliminarConfirmado = () => {
    onCambiarFilas(filas.filter((f) => f.clave !== claveAEliminar))
    setClaveAEliminar(null)
    setError(null)
    requestAnimationFrame(() => botonNuevoRef.current?.focus())
  }

  return (
    <>
      <ModalBase
        titulo="Tratamiento"
        grande
        onSolicitarCierre={intentarCerrar}
        pie={
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={intentarCerrar}>Cerrar</button>
            <button ref={botonNuevoRef} type="button" className="btn btn-primary" onClick={agregarFila}>
              <IconoMas />Nuevo Producto
            </button>
          </>
        }
      >
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Dosis</th>
                <th scope="col" className="nt-col-accion"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, i) => {
                const incompleto = revisando && !filaCompleta(fila)
                return (
                  <tr key={fila.clave}>
                    <td>
                      <input
                        ref={(el) => {
                          if (el && claveAEnfocar.current === fila.clave) {
                            claveAEnfocar.current = null
                            el.focus()
                          }
                        }}
                        className={`form-control${incompleto && !fila.producto.trim() ? ' is-invalid' : ''}`}
                        aria-label={`Producto, fila ${i + 1}`}
                        aria-required
                        aria-invalid={incompleto && !fila.producto.trim()}
                        maxLength={50}
                        value={fila.producto}
                        onChange={(e) => cambiarFila(fila.clave, 'producto', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className={`form-control${incompleto && !fila.dosis.trim() ? ' is-invalid' : ''}`}
                        aria-label={`Dosis, fila ${i + 1}`}
                        aria-required
                        aria-invalid={incompleto && !fila.dosis.trim()}
                        maxLength={150}
                        value={fila.dosis}
                        onChange={(e) => cambiarFila(fila.clave, 'dosis', e.target.value)}
                      />
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        aria-label={`Eliminar tratamiento, fila ${i + 1}`}
                        title="Eliminar tratamiento"
                        onClick={() => setClaveAEliminar(fila.clave)}
                      >
                        <IconoPapelera />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filas.length === 0 && (
                <tr><td colSpan={3} className="text-center text-muted">Sin productos. Use "Nuevo Producto" para agregar uno.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ModalBase>

      {claveAEliminar !== null && (
        <ModalConfirmacion
          superior
          titulo="Eliminar tratamiento"
          mensaje="¿Está seguro de eliminar éste tratamiento?"
          etiquetaAfirmativa="Sí"
          etiquetaNegativa="No"
          enfoqueInicial="negativa"
          onAfirmativa={eliminarConfirmado}
          onNegativa={() => setClaveAEliminar(null)}
        />
      )}
    </>
  )
}
