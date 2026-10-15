import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalBaseProps {
  titulo: string
  /** Se invoca con Escape; el modal nunca se cierra solo, el padre decide (y puede validar). */
  onSolicitarCierre: () => void
  children: ReactNode
  pie?: ReactNode
  rol?: 'dialog' | 'alertdialog'
  /** Modal apilado sobre otro modal. */
  superior?: boolean
  grande?: boolean
  /** Id del elemento que describe el diálogo (alertdialog). */
  describedBy?: string
}

const FOCALIZABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let modalesAbiertos = 0

function bloquearFondo() {
  modalesAbiertos++
  document.getElementById('root')?.setAttribute('inert', '')
  document.body.classList.add('modal-open')
}

function liberarFondo() {
  modalesAbiertos--
  if (modalesAbiertos > 0) return
  document.getElementById('root')?.removeAttribute('inert')
  document.body.classList.remove('modal-open')
}

/** Diálogo modal controlado por estado React: foco inicial, trampa de foco, Escape delegado y restauración de foco. */
export default function ModalBase({
  titulo,
  onSolicitarCierre,
  children,
  pie,
  rol = 'dialog',
  superior = false,
  grande = false,
  describedBy,
}: ModalBaseProps) {
  const idTitulo = useId()
  const dialogoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    bloquearFondo()
    const dialogo = dialogoRef.current
    const inicial =
      dialogo?.querySelector<HTMLElement>('[data-autofocus]') ??
      dialogo?.querySelector('.modal-body')?.querySelector<HTMLElement>(FOCALIZABLES) ??
      dialogo
    inicial?.focus()
    return () => {
      liberarFondo()
      if (previo?.isConnected) previo.focus()
    }
  }, [])

  const alPresionarTecla = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onSolicitarCierre()
      return
    }
    if (e.key !== 'Tab') return
    e.stopPropagation()
    const elementos = Array.from(dialogoRef.current?.querySelectorAll<HTMLElement>(FOCALIZABLES) ?? [])
    if (elementos.length === 0) {
      e.preventDefault()
      return
    }
    const primero = elementos[0]
    const ultimo = elementos[elementos.length - 1]
    if (e.shiftKey && (document.activeElement === primero || document.activeElement === dialogoRef.current)) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault()
      primero.focus()
    }
  }

  return createPortal(
    <>
      <div className={`modal-backdrop show${superior ? ' nt-modal-fondo--superior' : ''}`} />
      <div
        ref={dialogoRef}
        className={`modal d-block${superior ? ' nt-modal--superior' : ''}`}
        role={rol}
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={alPresionarTecla}
      >
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable${grande ? ' modal-lg' : ''}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 id={idTitulo} className="modal-title h5">{titulo}</h2>
            </div>
            <div className="modal-body">{children}</div>
            {pie && <div className="modal-footer">{pie}</div>}
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
