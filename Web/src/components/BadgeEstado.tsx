type Tono = 'ambar' | 'azul' | 'naranja' | 'verde' | 'gris' | 'rojo'

/** Mapa único estado -> tono (docs/estandarUI-UX.md §3.2). */
const TONO_POR_ESTADO: Record<string, Tono> = {
  Pendiente: 'ambar',
  Programado: 'azul',
  Enviado: 'azul',
  'En proceso': 'naranja',
  Negociación: 'naranja',
  Completado: 'verde',
  Aceptado: 'verde',
  Activo: 'verde',
  Borrador: 'gris',
  Inactivo: 'gris',
  Cancelado: 'rojo',
  Rechazado: 'rojo',
  Vencido: 'rojo',
}

interface BadgeEstadoProps {
  estado: string
}

export default function BadgeEstado({ estado }: BadgeEstadoProps) {
  const tono = TONO_POR_ESTADO[estado] ?? 'gris'
  return <span className={`nt-badge nt-badge--${tono}`}>{estado}</span>
}
