import { apiFetch } from './apiClient'

export interface Cliente {
  id: string
  nombre: string
  fechaNacimiento: string
  edad: number
  genero: 'M' | 'F'
  altura: number
  telefono: string | null
  email: string | null
  fechaIngreso: string
  activo: boolean
}

export interface ClienteListado {
  id: string
  nombre: string
  telefono: string | null
  email: string | null
  activo: boolean
}

export interface ResultadoPaginado<T> {
  items: T[]
  pagina: number
  tamanoPagina: number
  total: number
}

export interface DatosCliente {
  nombre: string
  fechaNacimiento: string
  genero: string
  altura: number | null
  telefono: string
  email: string
}

export interface FiltrosCliente {
  nombre: string
  id: string
  pagina: number
}

const aCuerpo = (d: DatosCliente) => ({
  ...d,
  telefono: d.telefono.trim() === '' ? null : d.telefono.trim(),
  email: d.email.trim() === '' ? null : d.email.trim(),
})

export function listarClientes(filtros: FiltrosCliente) {
  const params = new URLSearchParams({ pagina: String(filtros.pagina) })
  if (filtros.nombre.trim()) params.set('nombre', filtros.nombre.trim())
  if (filtros.id.trim()) params.set('id', filtros.id.trim())
  return apiFetch<ResultadoPaginado<ClienteListado>>(`/api/clientes?${params}`)
}

export const obtenerCliente = (id: string) => apiFetch<Cliente>(`/api/clientes/${encodeURIComponent(id)}`)

export const crearCliente = (id: string, datos: DatosCliente) =>
  apiFetch<Cliente>('/api/clientes', { method: 'POST', body: JSON.stringify({ id: id.trim(), ...aCuerpo(datos) }) })

export const editarCliente = (id: string, datos: DatosCliente) =>
  apiFetch<Cliente>(`/api/clientes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(aCuerpo(datos)) })
