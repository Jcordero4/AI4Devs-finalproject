import { apiFetch } from './apiClient'

export interface MedicionResumen {
  fechaMedicion: string
  peso: number
  grasa: number
  masaMuscular: number
  agua: number
  grasaVisceral: number
  imc: number
}

export interface TratamientoMedicion {
  secuencia: number
  producto: string
  dosis: string
}

export interface PlanNutricion {
  lacteo: number
  fruta: number
  vegetales: number
  harinas: number
  proteina: number
  grasa: number
  agua: number
}

export interface Medicion extends MedicionResumen {
  clienteId: string
  tratamientos: TratamientoMedicion[]
  plan: PlanNutricion
}

export interface TratamientoEntrada {
  producto: string
  dosis: string
}

export interface DatosMedicion {
  peso: number
  grasa: number
  masaMuscular: number
  agua: number
  grasaVisceral: number
  imc: number
  tratamientos: TratamientoEntrada[]
  plan: PlanNutricion
}

const rutaMediciones = (clienteId: string) => `/api/clientes/${encodeURIComponent(clienteId)}/mediciones`

/** Histórico del cliente (de la más reciente a la más antigua); `desde`/`hasta` ('yyyy-MM-dd', inclusivos) son opcionales. */
export function listarMediciones(clienteId: string, desde?: string, hasta?: string) {
  const params = new URLSearchParams()
  if (desde) params.set('desde', desde)
  if (hasta) params.set('hasta', hasta)
  const consulta = params.toString()
  return apiFetch<MedicionResumen[]>(`${rutaMediciones(clienteId)}${consulta ? `?${consulta}` : ''}`)
}

export const obtenerMedicion = (clienteId: string, fecha: string) =>
  apiFetch<Medicion>(`${rutaMediciones(clienteId)}/${encodeURIComponent(fecha)}`)

export const crearMedicion = (clienteId: string, datos: DatosMedicion) =>
  apiFetch<Medicion>(rutaMediciones(clienteId), { method: 'POST', body: JSON.stringify(datos) })

export const actualizarMedicion = (clienteId: string, fecha: string, datos: DatosMedicion) =>
  apiFetch<Medicion>(`${rutaMediciones(clienteId)}/${encodeURIComponent(fecha)}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  })
