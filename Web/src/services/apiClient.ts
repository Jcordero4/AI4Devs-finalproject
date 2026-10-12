const API_URL = import.meta.env.VITE_API_URL as string

export class ApiError extends Error {
  status: number
  errores: string[]

  constructor(status: number, mensaje: string, errores: string[] = []) {
    super(mensaje)
    this.status = status
    this.errores = errores
  }
}

async function leerError(response: Response): Promise<ApiError> {
  try {
    const problema = (await response.json()) as { title?: string; errors?: Record<string, string[]> }
    const errores = Object.values(problema.errors ?? {}).flat()
    return new ApiError(response.status, problema.title ?? `HTTP ${response.status}`, errores)
  } catch {
    return new ApiError(response.status, `HTTP ${response.status}`)
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })

  if (!response.ok) {
    throw await leerError(response)
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}
