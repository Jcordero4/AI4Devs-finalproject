import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiFetch } from './apiClient'

const respuesta = (status: number, cuerpo?: unknown) =>
  new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status })

describe('apiFetch', () => {
  const fetchMock = vi.fn()

  beforeEach(() => vi.stubGlobal('fetch', fetchMock))
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('envía credentials include y devuelve JSON', async () => {
    fetchMock.mockResolvedValue(respuesta(200, { id: 1 }))
    await expect(apiFetch<{ id: number }>('/clientes')).resolves.toEqual({ id: 1 })
    const init = fetchMock.mock.calls[0][1] as RequestInit
    expect(init.credentials).toBe('include')
  })

  it('204 devuelve undefined', async () => {
    fetchMock.mockResolvedValue(respuesta(204))
    await expect(apiFetch('/clientes/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('error con ProblemDetails -> ApiError con errores aplanados', async () => {
    fetchMock.mockResolvedValue(respuesta(400, { title: 'Validación', errors: { Nombre: ['Requerido'], Peso: ['Mayor a 0'] } }))
    const error = (await apiFetch('/clientes').catch((e: unknown) => e)) as ApiError
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(400)
    expect(error.message).toBe('Validación')
    expect(error.errores).toEqual(['Requerido', 'Mayor a 0'])
  })

  it('error sin JSON -> mensaje HTTP status', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }))
    const error = (await apiFetch('/clientes').catch((e: unknown) => e)) as ApiError
    expect(error.status).toBe(500)
    expect(error.message).toBe('HTTP 500')
  })
})
