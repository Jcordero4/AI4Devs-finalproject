import type { MedicionResumen } from '../services/medicionService'
import {
  calcularGeometria,
  formatearFecha,
  formatearNumero,
  type DimensionGrafico,
} from './historialProgreso'

export interface DatosPdfHistorial {
  clienteId: string
  nombreCliente: string
  /** Fecha del informe 'yyyy-MM-dd'. */
  fechaInforme: string
  /** Rango consultado 'yyyy-MM-dd'. */
  desde: string
  hasta: string
  /** Mediciones tal como se muestran en la tabla (de la más reciente a la más antigua). */
  mediciones: readonly MedicionResumen[]
}

// Colores de la marca (docs/estandarUI-UX.md §3.1). jsPDF no entiende variables CSS: se repiten como RGB.
type RGB = [number, number, number]
const TINTA: RGB = [24, 59, 58] // --nt-ink #183B3A
const VERDE: RGB = [22, 117, 70] // --nt-primary #167546
const VERDE_SUAVE: RGB = [244, 248, 245] // --nt-bg #F4F8F5
const TEXTO_SUAVE: RGB = [86, 107, 100]
const CUADRICULA: RGB = [213, 221, 216]

const MARGEN_PAGINA = 14
const ANCHO_PAGINA = 210
const ALTO_GRAFICO = 72

/** Nombre de archivo seguro: historial-{clienteId}-{yyyy-MM-dd}.pdf */
export function nombreArchivoHistorial(clienteId: string, fechaInforme: string): string {
  return `historial-${clienteId.replace(/[^A-Za-z0-9_-]/g, '_')}-${fechaInforme}.pdf`
}

/**
 * Genera y descarga el PDF del historial: encabezado, gráfico de peso (dibujado en vector con las mismas escalas
 * que el SVG de pantalla) y tabla con salto de página. jsPDF y jspdf-autotable se cargan al invocar la función.
 */
export async function generarPdfHistorial(datos: DatosPdfHistorial): Promise<void> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const anchoUtil = ANCHO_PAGINA - MARGEN_PAGINA * 2

  // Encabezado
  doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...TINTA)
  doc.text('Historial de progreso', MARGEN_PAGINA, 20)
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...TEXTO_SUAVE)
  doc.text('NutriTrack - Nutrition Software', MARGEN_PAGINA, 25.5)

  doc.setFontSize(11).setTextColor(...TINTA)
  doc.setFont('helvetica', 'bold').text('Cliente:', MARGEN_PAGINA, 35)
  doc.setFont('helvetica', 'normal').text(datos.nombreCliente, MARGEN_PAGINA + 20, 35)
  doc.setFont('helvetica', 'bold').text('Fecha del informe:', MARGEN_PAGINA, 41)
  doc.setFont('helvetica', 'normal').text(formatearFecha(datos.fechaInforme), MARGEN_PAGINA + 38, 41)
  doc.setFont('helvetica', 'bold').text('Rango consultado:', MARGEN_PAGINA, 47)
  doc
    .setFont('helvetica', 'normal')
    .text(`${formatearFecha(datos.desde)} al ${formatearFecha(datos.hasta)}`, MARGEN_PAGINA + 38, 47)

  // Gráfico de peso
  const inicioGrafico = 55
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...TINTA)
  doc.text('Peso (kg)', MARGEN_PAGINA, inicioGrafico)
  dibujarGrafico(doc, datos.mediciones, MARGEN_PAGINA, inicioGrafico + 3, anchoUtil, ALTO_GRAFICO)

  // Tabla
  autoTable(doc, {
    startY: inicioGrafico + 3 + ALTO_GRAFICO + 8,
    margin: { left: MARGEN_PAGINA, right: MARGEN_PAGINA, bottom: 16 },
    head: [['Fecha', 'Peso', 'M. Muscular', '% Grasa', '% Agua', 'IMC']],
    body: datos.mediciones.map((m) => [
      formatearFecha(m.fechaMedicion),
      formatearNumero(m.peso, 2),
      formatearNumero(m.masaMuscular, 2),
      formatearNumero(m.grasa, 2),
      formatearNumero(m.agua, 2),
      formatearNumero(m.imc, 2),
    ]),
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, textColor: TINTA, lineColor: CUADRICULA, lineWidth: 0.2 },
    headStyles: { fillColor: VERDE, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: VERDE_SUAVE },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    showHead: 'everyPage',
  })

  // Numeración de páginas
  const total = doc.getNumberOfPages()
  for (let pagina = 1; pagina <= total; pagina++) {
    doc.setPage(pagina)
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...TEXTO_SUAVE)
    doc.text(`Página ${pagina} de ${total}`, ANCHO_PAGINA - MARGEN_PAGINA, 290, { align: 'right' })
  }

  doc.save(nombreArchivoHistorial(datos.clienteId, datos.fechaInforme))
}

function dibujarGrafico(
  doc: InstanceType<Awaited<typeof import('jspdf')>['jsPDF']>,
  mediciones: readonly MedicionResumen[],
  x0: number,
  y0: number,
  ancho: number,
  alto: number,
) {
  const dimension: DimensionGrafico = { ancho, alto, margen: { arriba: 4, derecha: 6, abajo: 9, izquierda: 14 } }
  const geo = calcularGeometria(
    mediciones.map((m) => ({ fecha: m.fechaMedicion, peso: m.peso })),
    dimension,
  )
  const { area } = geo

  doc.setDrawColor(...CUADRICULA).setLineWidth(0.2)
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...TEXTO_SUAVE)

  for (const marca of geo.marcasY) {
    doc.line(x0 + area.x, y0 + marca.y, x0 + area.x + area.ancho, y0 + marca.y)
    doc.text(formatearNumero(marca.valor, 1), x0 + area.x - 2, y0 + marca.y + 1, { align: 'right' })
  }
  doc.setDrawColor(...TEXTO_SUAVE)
  doc.line(x0 + area.x, y0 + area.y + area.alto, x0 + area.x + area.ancho, y0 + area.y + area.alto)
  for (const marca of geo.marcasX) {
    doc.text(formatearFecha(marca.fecha), x0 + marca.x, y0 + area.y + area.alto + 5, { align: 'center' })
  }

  if (geo.nodos.length > 1) {
    doc.setDrawColor(...VERDE).setLineWidth(0.6)
    for (let i = 1; i < geo.nodos.length; i++) {
      const a = geo.nodos[i - 1]
      const b = geo.nodos[i]
      doc.line(x0 + a.x, y0 + a.y, x0 + b.x, y0 + b.y)
    }
  }
  doc.setFillColor(...VERDE).setDrawColor(255, 255, 255).setLineWidth(0.3)
  for (const nodo of geo.nodos) doc.circle(x0 + nodo.x, y0 + nodo.y, 1.2, 'FD')
}
