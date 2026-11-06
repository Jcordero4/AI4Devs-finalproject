import { expect, test, type Page } from '@playwright/test'

interface ClienteSim {
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

/** API en memoria: intercepta /api/clientes para que el E2E no dependa del backend. */
async function simularApiClientes(page: Page, clientes: ClienteSim[] = []) {
  await page.route('**/api/clientes**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const partes = url.pathname.split('/').filter(Boolean) // ['api','clientes',id?]
    const cors = {
      'access-control-allow-origin': request.headers()['origin'] ?? '*',
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    }
    const json = (status: number, cuerpo: unknown) =>
      route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(cuerpo) })

    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors })

    if (partes.length === 2 && request.method() === 'GET') {
      const nombre = url.searchParams.get('nombre')?.toLowerCase()
      const filtrados = clientes.filter((c) => !nombre || c.nombre.toLowerCase().includes(nombre))
      return json(200, { items: filtrados, pagina: 1, tamanoPagina: 10, total: filtrados.length })
    }
    if (partes.length === 2 && request.method() === 'POST') {
      const datos = request.postDataJSON() as ClienteSim
      if (clientes.some((c) => c.id === datos.id)) return json(409, { title: 'Conflicto' })
      const nuevo = { ...datos, edad: 30, fechaIngreso: '2026-11-05', activo: true }
      clientes.push(nuevo)
      return json(201, nuevo)
    }
    if (partes.length === 3 && request.method() === 'GET') {
      const cliente = clientes.find((c) => c.id === decodeURIComponent(partes[2]))
      return cliente ? json(200, cliente) : json(404, { title: 'No encontrado' })
    }
    if (partes.length === 3 && request.method() === 'PUT') {
      const indice = clientes.findIndex((c) => c.id === decodeURIComponent(partes[2]))
      if (indice < 0) return json(404, { title: 'No encontrado' })
      clientes[indice] = { ...clientes[indice], ...(request.postDataJSON() as object) }
      return json(200, clientes[indice])
    }
    return route.fallback()
  })
}

const clienteBase = (id: string, nombre: string): ClienteSim => ({
  id,
  nombre,
  fechaNacimiento: '1990-05-20',
  edad: 36,
  genero: 'F',
  altura: 165,
  telefono: '+50688887777',
  email: `${id}@correo.com`,
  fechaIngreso: '2026-01-10',
  activo: true,
})

test.describe('Listado de clientes', () => {
  test('redirige a /clientes y muestra estado vacío', async ({ page }) => {
    await simularApiClientes(page)
    await page.goto('/')
    await expect(page).toHaveURL(/\/clientes$/)
    await expect(page.getByRole('heading', { name: 'Listado de clientes' })).toBeVisible()
    await expect(page.getByText('Aún no hay clientes registrados.')).toBeVisible()
  })

  test('filtra por nombre', async ({ page }) => {
    await simularApiClientes(page, [clienteBase('C1', 'Ana Pérez'), clienteBase('C2', 'Luis Mora')])
    await page.goto('/clientes')
    await expect(page.getByText('Ana Pérez')).toBeVisible()
    await expect(page.getByText('Luis Mora')).toBeVisible()

    await page.getByLabel('Nombre', { exact: true }).fill('ana')
    await page.getByRole('button', { name: 'Filtrar' }).click()
    await expect(page.getByText('Ana Pérez')).toBeVisible()
    await expect(page.getByText('Luis Mora')).toHaveCount(0)
  })

  test('Editar sin selección muestra aviso', async ({ page }) => {
    await simularApiClientes(page, [clienteBase('C1', 'Ana Pérez')])
    await page.goto('/clientes')
    await page.getByRole('button', { name: 'Editar' }).click()
    await expect(page.getByRole('alert')).toContainText('Debe seleccionar el cliente a editar.')
  })
})

test.describe('CRUD de cliente', () => {
  test('crea un cliente y aparece en el listado', async ({ page }) => {
    await simularApiClientes(page)
    await page.goto('/clientes')
    await page.getByRole('button', { name: 'Nuevo' }).click()
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible()

    await page.getByLabel('Id', { exact: false }).first().fill('C100')
    await page.getByLabel('Nombre').fill('María Solano')
    await page.getByLabel('Fecha de Nacimiento').fill('1992-03-15')
    await page.getByLabel('Género').selectOption('F')
    await page.getByLabel('Altura (cm)').fill('168')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page).toHaveURL(/\/clientes$/)
    await expect(page.getByRole('alert')).toContainText('Cliente guardado con éxito')
    await expect(page.getByText('María Solano')).toBeVisible()
  })

  test('valida campos obligatorios', async ({ page }) => {
    await simularApiClientes(page)
    await page.goto('/clientes/nuevo')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByRole('alert')).toContainText('Faltan datos obligatorios')
  })

  test('Id duplicado muestra error 409', async ({ page }) => {
    await simularApiClientes(page, [clienteBase('C1', 'Ana Pérez')])
    await page.goto('/clientes/nuevo')
    await page.getByLabel('Id', { exact: false }).first().fill('C1')
    await page.getByLabel('Nombre').fill('Otra Persona')
    await page.getByLabel('Fecha de Nacimiento').fill('1990-01-01')
    await page.getByLabel('Género').selectOption('M')
    await page.getByLabel('Altura (cm)').fill('170')
    await page.getByRole('button', { name: 'Guardar' }).click()
    await expect(page.getByRole('alert')).toContainText('El Id ya está registrado.')
  })

  test('edita un cliente seleccionado', async ({ page }) => {
    await simularApiClientes(page, [clienteBase('C1', 'Ana Pérez')])
    await page.goto('/clientes')
    await page.getByRole('radio', { name: 'Seleccionar Ana Pérez' }).check()
    await page.getByRole('button', { name: 'Editar' }).click()
    await expect(page.getByRole('heading', { name: 'Editar cliente' })).toBeVisible()

    await page.getByLabel('Nombre').fill('Ana Pérez Mora')
    await page.getByRole('button', { name: 'Guardar' }).click()

    await expect(page).toHaveURL(/\/clientes$/)
    await expect(page.getByText('Ana Pérez Mora')).toBeVisible()
  })
})
