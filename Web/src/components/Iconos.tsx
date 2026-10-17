import type { ReactNode } from 'react'

interface IconoProps {
  className?: string
}

/** Icono decorativo: el significado lo da el texto o el aria-label del control que lo contiene. */
function Icono({ className, children }: IconoProps & { children: ReactNode }) {
  return (
    <svg
      className={`nt-icono${className ? ` ${className}` : ''}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const IconoUsuarios = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icono>
)

export const IconoAjustes = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="8" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </Icono>
)

export const IconoMenu = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icono>
)

export const IconoMas = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
)

export const IconoFlechaIzquierda = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Icono>
)

export const IconoLupa = (p: IconoProps) => (
  <Icono {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Icono>
)

export const IconoPapelera = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icono>
)

export const IconoEditar = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icono>
)

export const IconoActividad = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Icono>
)

export const IconoHistorial = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </Icono>
)

export const IconoBandeja = (p: IconoProps) => (
  <Icono {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Icono>
)
