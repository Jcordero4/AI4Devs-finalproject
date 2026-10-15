import type { DatosMedicion, PlanNutricion } from '../services/medicionService'

export const CAMPOS_MEDICION = [
  { campo: 'peso', etiqueta: 'Peso' },
  { campo: 'grasa', etiqueta: '% Grasa' },
  { campo: 'masaMuscular', etiqueta: 'M. Muscular' },
  { campo: 'agua', etiqueta: '% Agua' },
  { campo: 'grasaVisceral', etiqueta: 'G. Visceral' },
  { campo: 'imc', etiqueta: 'IMC' },
] as const

export type CampoMedicion = (typeof CAMPOS_MEDICION)[number]['campo']
export type ValoresMedicion = Record<CampoMedicion, string>

export interface FilaTratamiento {
  clave: number
  producto: string
  dosis: string
}

export type CategoriaPlan = keyof PlanNutricion
export type ValoresPlan = Record<CategoriaPlan, string>

export const CATEGORIAS_PLAN: ReadonlyArray<{ categoria: CategoriaPlan; etiqueta: string }> = [
  { categoria: 'lacteo', etiqueta: 'Lácteos' },
  { categoria: 'fruta', etiqueta: 'Frutas' },
  { categoria: 'vegetales', etiqueta: 'Vegetales' },
  { categoria: 'harinas', etiqueta: 'Harinas' },
  { categoria: 'proteina', etiqueta: 'Proteínas' },
  { categoria: 'grasa', etiqueta: 'Grasas' },
  { categoria: 'agua', etiqueta: 'Agua' },
]

export const MEDICION_VACIA: ValoresMedicion = {
  peso: '',
  grasa: '',
  masaMuscular: '',
  agua: '',
  grasaVisceral: '',
  imc: '',
}

export const PLAN_VACIO: ValoresPlan = {
  lacteo: '0',
  fruta: '0',
  vegetales: '0',
  harinas: '0',
  proteina: '0',
  grasa: '0',
  agua: '0',
}

export const TRATAMIENTO_INICIAL: FilaTratamiento[] = [{ clave: 1, producto: '', dosis: '' }]

export const esPositivo = (valor: string) => valor.trim() !== '' && Number.isFinite(Number(valor)) && Number(valor) > 0
export const esEnteroNoNegativo = (valor: string) => /^\d+$/.test(valor.trim())
export const filaCompleta = (fila: FilaTratamiento) => fila.producto.trim() !== '' && fila.dosis.trim() !== ''

/** Huella del estado de captura para detectar cambios sin guardar. */
export const instantanea = (valores: ValoresMedicion, filas: FilaTratamiento[], plan: ValoresPlan) =>
  JSON.stringify({ valores, filas: filas.map((f) => [f.producto, f.dosis]), plan })

/** Devuelve un mensaje por cada bloque incompleto (medición, tratamiento, plan). */
export function validarBloques(valores: ValoresMedicion, filas: FilaTratamiento[], plan: ValoresPlan): string[] {
  const mensajes: string[] = []
  const faltantes = CAMPOS_MEDICION.filter(({ campo }) => !esPositivo(valores[campo])).map(({ etiqueta }) => etiqueta)
  if (faltantes.length > 0) {
    mensajes.push(`Medición incompleta: complete con valores mayores a 0 (${faltantes.join(', ')}).`)
  }
  if (!filas.every(filaCompleta)) {
    mensajes.push('Tratamiento incompleto: hay productos sin Producto o Dosis. Abra "Tratamiento" y complete o elimine las filas vacías.')
  }
  if (!CATEGORIAS_PLAN.every(({ categoria }) => esEnteroNoNegativo(plan[categoria]))) {
    mensajes.push('Plan de Nutrición inválido: cada categoría debe ser un número entero mayor o igual a 0.')
  }
  return mensajes
}

export function aDatosMedicion(valores: ValoresMedicion, filas: FilaTratamiento[], plan: ValoresPlan): DatosMedicion {
  const porcion = (categoria: CategoriaPlan) => Number(plan[categoria])
  return {
    peso: Number(valores.peso),
    grasa: Number(valores.grasa),
    masaMuscular: Number(valores.masaMuscular),
    agua: Number(valores.agua),
    grasaVisceral: Number(valores.grasaVisceral),
    imc: Number(valores.imc),
    tratamientos: filas.map((f) => ({ producto: f.producto.trim(), dosis: f.dosis.trim() })),
    plan: {
      lacteo: porcion('lacteo'),
      fruta: porcion('fruta'),
      vegetales: porcion('vegetales'),
      harinas: porcion('harinas'),
      proteina: porcion('proteina'),
      grasa: porcion('grasa'),
      agua: porcion('agua'),
    },
  }
}

/** `yyyy-MM-dd` (o con hora) a `dd/MM/yyyy`. */
export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

export function fechaHoy(): string {
  const ahora = new Date()
  const dos = (n: number) => String(n).padStart(2, '0')
  return `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`
}
