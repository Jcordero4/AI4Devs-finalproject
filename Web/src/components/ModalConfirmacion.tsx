import { useId } from 'react'
import ModalBase from './ModalBase'

interface ModalConfirmacionProps {
  titulo: string
  mensaje: string
  etiquetaAfirmativa: string
  etiquetaNegativa: string
  onAfirmativa: () => void
  onNegativa: () => void
  /** Se invoca con Escape; por defecto equivale al botón negativo. */
  onCancelar?: () => void
  enfoqueInicial?: 'afirmativa' | 'negativa'
  ocupado?: boolean
  superior?: boolean
}

/** Confirmación de dos opciones con textos propios (Sí/No, Guardar/Omitir). */
export default function ModalConfirmacion({
  titulo,
  mensaje,
  etiquetaAfirmativa,
  etiquetaNegativa,
  onAfirmativa,
  onNegativa,
  onCancelar,
  enfoqueInicial = 'afirmativa',
  ocupado = false,
  superior = false,
}: ModalConfirmacionProps) {
  const idMensaje = useId()
  return (
    <ModalBase
      titulo={titulo}
      rol="alertdialog"
      describedBy={idMensaje}
      superior={superior}
      onSolicitarCierre={() => {
        if (!ocupado) (onCancelar ?? onNegativa)()
      }}
      pie={
        <>
          <button
            type="button"
            className="btn btn-success"
            onClick={onAfirmativa}
            disabled={ocupado}
            data-autofocus={enfoqueInicial === 'afirmativa' ? '' : undefined}
          >
            {ocupado && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            {etiquetaAfirmativa}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onNegativa}
            disabled={ocupado}
            data-autofocus={enfoqueInicial === 'negativa' ? '' : undefined}
          >
            {etiquetaNegativa}
          </button>
        </>
      }
    >
      <p id={idMensaje} className="mb-0">{mensaje}</p>
    </ModalBase>
  )
}
