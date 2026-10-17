// Lógica pura de la pantalla de Historial (sin React): validación del rango, formato de fechas
// y escalas del gráfico de peso. Las fechas se manejan como cadenas 'yyyy-MM-dd' para evitar
// corrimientos por huso horario. La usan GraficoPeso (SVG) y generarPdfHistorial (jsPDF).

export interface PuntoPeso {
  fecha: string
  peso: number
}

export interface MargenGrafico {
  arriba: number
  derecha: number
  abajo: number
  izquierda: number
}

export interface DimensionGrafico {
  ancho: number
  alto: number
  margen: MargenGrafico
}

export interface NodoGrafico extends PuntoPeso {
  x: number
  y: number
}

export interface MarcaEjeX {
  x: number
  fecha: string
}

export interface MarcaEjeY {
  y: number
  valor: number
}

export interface GeometriaGrafico {
  /** Rectángulo interior de dibujo (dentro de los márgenes). */
  area: { x: number; y: number; ancho: number; alto: number }
  nodos: NodoGrafico[]
  marcasX: MarcaEjeX[]
  marcasY: MarcaEjeY[]
}

export const MENSAJE_FECHAS_FALTANTES = 'Debe ingresar la fecha inicial y la fecha final.'
export const MENSAJE_RANGO_INVALIDO =
  'El rango de fechas es inválido: la fecha inicial no puede ser posterior a la fecha final.'

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** Devuelve el mensaje de error del rango, o null si es válido. Compara cadenas ISO (orden lexicográfico = cronológico). */
export function validarRango(desde: string, hasta: string): string | null {
  if (!FECHA_ISO.test(desde) || !FECHA_ISO.test(hasta)) return MENSAJE_FECHAS_FALTANTES
  return desde > hasta ? MENSAJE_RANGO_INVALIDO : null
}

/** 'yyyy-MM-dd' → 'dd/MM/yyyy'. Si no es una fecha ISO la devuelve igual. */
export function formatearFecha(iso: string): string {
  const m = FECHA_ISO.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}

/** Fecha local actual como 'yyyy-MM-dd'. */
export function fechaHoyIso(hoy: Date = new Date()): string {
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

/** Número con hasta `decimales` decimales y coma decimal (es). */
export function formatearNumero(valor: number, decimales = 1): string {
  return new Intl.NumberFormat('es', { minimumFractionDigits: 0, maximumFractionDigits: decimales }).format(valor)
}

/** Copia ordenada de la fecha más antigua a la más reciente. */
export function ordenarCronologico<T extends { fecha: string }>(datos: readonly T[]): T[] {
  return [...datos].sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0))
}

function diasUtc(iso: string): number {
  const m = FECHA_ISO.exec(iso)
  if (!m) return 0
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86_400_000
}

/** Valores "redondos" para el eje Y: de `min` a `max` en `cantidad` marcas. */
function marcasRedondas(min: number, max: number, cantidad: number): number[] {
  const rango = max - min
  const bruto = rango / Math.max(cantidad - 1, 1)
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const fraccion = bruto / potencia
  const paso = (fraccion <= 1 ? 1 : fraccion <= 2 ? 2 : fraccion <= 5 ? 5 : 10) * potencia
  const inicio = Math.floor(min / paso) * paso
  const fin = Math.ceil(max / paso) * paso
  const valores: number[] = []
  for (let v = inicio; v <= fin + paso / 1000; v += paso) valores.push(Number(v.toFixed(6)))
  return valores
}

/** Índices (siempre incluyen primero y último) de hasta `max` marcas del eje X repartidas de forma uniforme. */
function indicesMarcasX(cantidad: number, max: number): number[] {
  if (cantidad <= max) return Array.from({ length: cantidad }, (_, i) => i)
  const indices = new Set<number>()
  for (let i = 0; i < max; i++) indices.add(Math.round((i * (cantidad - 1)) / (max - 1)))
  return [...indices].sort((a, b) => a - b)
}

/**
 * Calcula la geometría del gráfico de peso: nodos en coordenadas de la dimensión dada (misma unidad para el SVG en px
 * y para jsPDF en mm), marcas de los ejes y el área de dibujo. `datos` puede venir en cualquier orden.
 * - X proporcional al tiempo; si todas las fechas coinciden (o hay un solo punto) el nodo queda centrado.
 * - Y con un margen del 10 % y marcas redondas; si todos los pesos son iguales se abre ±1.
 */
export function calcularGeometria(
  datos: readonly PuntoPeso[],
  { ancho, alto, margen }: DimensionGrafico,
  maxMarcasX = 6,
  marcasYDeseadas = 5,
): GeometriaGrafico {
  const area = {
    x: margen.izquierda,
    y: margen.arriba,
    ancho: Math.max(ancho - margen.izquierda - margen.derecha, 1),
    alto: Math.max(alto - margen.arriba - margen.abajo, 1),
  }
  if (datos.length === 0) return { area, nodos: [], marcasX: [], marcasY: [] }

  const ordenados = ordenarCronologico(datos)
  const pesos = ordenados.map((d) => d.peso)
  let minPeso = Math.min(...pesos)
  let maxPeso = Math.max(...pesos)
  if (minPeso === maxPeso) {
    minPeso -= 1
    maxPeso += 1
  } else {
    const holgura = (maxPeso - minPeso) * 0.1
    minPeso -= holgura
    maxPeso += holgura
  }
  const marcasValores = marcasRedondas(minPeso, maxPeso, marcasYDeseadas)
  const minY = Math.min(minPeso, marcasValores[0])
  const maxY = Math.max(maxPeso, marcasValores[marcasValores.length - 1])

  const primero = diasUtc(ordenados[0].fecha)
  const ultimo = diasUtc(ordenados[ordenados.length - 1].fecha)
  const duracion = ultimo - primero
  const escalaX = (fecha: string) =>
    duracion === 0 ? area.x + area.ancho / 2 : area.x + ((diasUtc(fecha) - primero) / duracion) * area.ancho
  const escalaY = (peso: number) => area.y + area.alto - ((peso - minY) / (maxY - minY)) * area.alto

  const nodos = ordenados.map((d) => ({ ...d, x: escalaX(d.fecha), y: escalaY(d.peso) }))
  const marcasX = indicesMarcasX(nodos.length, maxMarcasX).map((i) => ({ x: nodos[i].x, fecha: nodos[i].fecha }))
  const marcasY = marcasValores.map((valor) => ({ valor, y: escalaY(valor) }))
  return { area, nodos, marcasX, marcasY }
}
