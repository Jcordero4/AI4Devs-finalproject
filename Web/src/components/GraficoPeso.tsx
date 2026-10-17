import { useState } from 'react'
import {
  calcularGeometria,
  formatearFecha,
  formatearNumero,
  type DimensionGrafico,
  type PuntoPeso,
} from '../utils/historialProgreso'

interface GraficoPesoProps {
  /** Mediciones en cualquier orden; el gráfico las ordena cronológicamente. */
  datos: readonly PuntoPeso[]
}

const ANCHO = 560
const ALTO = 320
const DIMENSION: DimensionGrafico = {
  ancho: ANCHO,
  alto: ALTO,
  margen: { arriba: 20, derecha: 36, abajo: 44, izquierda: 56 },
}
const ALTO_TOOLTIP = 26

/** Gráfico de línea del peso (SVG propio, sin librerías). Colores y tipografía vienen de clases `.nt-grafico*` (tokens `--nt-*`). */
export default function GraficoPeso({ datos }: GraficoPesoProps) {
  const [activo, setActivo] = useState<number | null>(null)

  if (datos.length === 0) {
    return (
      <div className="nt-grafico nt-grafico--vacio">
        <p className="mb-0">Sin datos para mostrar.</p>
      </div>
    )
  }

  const { area, nodos, marcasX, marcasY } = calcularGeometria(datos, DIMENSION)
  const pesos = nodos.map((n) => n.peso)
  const minimo = Math.min(...pesos)
  const maximo = Math.max(...pesos)
  const rangoPeso =
    minimo === maximo ? `${formatearNumero(minimo)} kg` : `de ${formatearNumero(minimo)} kg a ${formatearNumero(maximo)} kg`
  const etiqueta = `Gráfico de evolución del peso: ${nodos.length} ${nodos.length === 1 ? 'medición' : 'mediciones'}, ${rangoPeso}, entre el ${formatearFecha(nodos[0].fecha)} y el ${formatearFecha(nodos[nodos.length - 1].fecha)}.`

  const nodoActivo = activo !== null ? nodos[activo] : undefined
  const textoTooltip = nodoActivo ? `${formatearFecha(nodoActivo.fecha)}: ${formatearNumero(nodoActivo.peso)} kg` : ''
  const anchoTooltip = textoTooltip.length * 7 + 16
  const xTooltip = nodoActivo ? Math.min(Math.max(nodoActivo.x - anchoTooltip / 2, 2), ANCHO - anchoTooltip - 2) : 0
  const yTooltip = nodoActivo ? (nodoActivo.y - ALTO_TOOLTIP - 12 < 2 ? nodoActivo.y + 12 : nodoActivo.y - ALTO_TOOLTIP - 12) : 0

  return (
    <div className="nt-grafico">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={etiqueta} className="nt-grafico__svg">
        {marcasY.map((m) => (
          <g key={`y-${m.valor}`}>
            <line className="nt-grafico__rejilla" x1={area.x} x2={area.x + area.ancho} y1={m.y} y2={m.y} />
            <text className="nt-grafico__etiqueta" x={area.x - 8} y={m.y} textAnchor="end" dominantBaseline="middle">
              {formatearNumero(m.valor)}
            </text>
          </g>
        ))}
        <line className="nt-grafico__eje" x1={area.x} x2={area.x + area.ancho} y1={area.y + area.alto} y2={area.y + area.alto} />
        {marcasX.map((m) => (
          <text key={`x-${m.fecha}`} className="nt-grafico__etiqueta" x={m.x} y={area.y + area.alto + 20} textAnchor="middle">
            {formatearFecha(m.fecha)}
          </text>
        ))}
        <text className="nt-grafico__etiqueta" x={area.x} y={12} textAnchor="start">
          Peso (kg)
        </text>
        {nodos.length > 1 && (
          <polyline className="nt-grafico__linea" points={nodos.map((n) => `${n.x},${n.y}`).join(' ')} />
        )}
        {nodos.map((n, i) => (
          <circle
            key={`${n.fecha}-${i}`}
            className="nt-grafico__nodo"
            cx={n.x}
            cy={n.y}
            r={5}
            tabIndex={0}
            onMouseEnter={() => setActivo(i)}
            onMouseLeave={() => setActivo(null)}
            onFocus={() => setActivo(i)}
            onBlur={() => setActivo(null)}
          >
            <title>{`${formatearFecha(n.fecha)}: ${formatearNumero(n.peso)} kg`}</title>
          </circle>
        ))}
        {nodoActivo && (
          <g className="nt-grafico__tooltip" pointerEvents="none">
            <rect x={xTooltip} y={yTooltip} width={anchoTooltip} height={ALTO_TOOLTIP} rx={6} />
            <text x={xTooltip + anchoTooltip / 2} y={yTooltip + ALTO_TOOLTIP / 2} textAnchor="middle" dominantBaseline="middle">
              {textoTooltip}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
