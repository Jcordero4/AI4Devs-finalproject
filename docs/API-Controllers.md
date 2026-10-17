# NutriTrack — Controllers de la API

> Fuentes: `docs/PRD.md`, `docs/US-004-CRUD-Cliente.md`, `docs/US-008-Medicion-Composicion-Corporal.md` y `docs/US-009-Historial-Progreso-Graficos.md`. Nombres de controllers, rutas y parámetros en español, siguiendo la convención de nombres del proyecto (ver memoria `nombres-en-espanol`). Las rutas de **Cliente** (US-004) y **Medición** (US-008/US-009) tienen detalle real tomado de esos documentos; las de **Autenticación**, **Usuario**, **Plan** y **Panel** están inferidas de los criterios de aceptación del PRD, ya que no cuentan con un US detallado en `docs/`.
>
> Nota de archivo: el nombre solicitado tenía una errata ("API-Controlles"); se creó como `API-Controllers.md`.

## Nota
> El proyecto del API cuenta con el swagger instalado para facilitar la visualizacion de los endpoints y como estos funcionan, permitiendo la ejecución de cada endpoint desde el swagger.
> Modo de acceso: ejecuta el proyecto de API y en el url escribe: https://localhost:7054/swagger/index.html

## Alcance MVP

Según `README.md` §2.2–§2.3:

| Controller | ¿Dentro del MVP? | Motivo |
|---|:---:|---|
| AutenticacionController | **No** | §2.3 excluye explícitamente autenticación JWT y autorización por roles del MVP. |
| UsuarioController | **No** | Depende de Autenticación/roles (Epic 1), excluido por el mismo motivo. |
| ClienteController | Sí | §2.2 — "Gestión de clientes: operaciones CRUD completas". |
| MedicionController | Sí | §2.2 — "Seguimiento de la composición corporal". |
| PlanController | Sí | §2.2 — "Creación, asignación e historial del plan nutricional". |
| PanelController | Sí (implícito) | No aparece en la lista de exclusiones de §2.3; el PRD lo incluye en el Epic 5 y como entregable del Sprint 4. |

## Convenciones de respuesta

- **Éxito:** `Content-Type: application/json`. El DTO se serializa directamente como cuerpo (sin envoltorio tipo `{ "data": ... }`), con propiedades en `camelCase`. Las fechas (`DateOnly`) se serializan como `"yyyy-MM-dd"`.
- **Error:** `Content-Type: application/problem+json` (ProblemDetails, RFC 7807), generado por `ManejoErroresMiddleware`.

| Status | Causa | JSON |
|---|---|---|
| 400 | Falla de validación (FluentValidation) | `{ "status": 400, "title": "Datos inválidos.", "errors": { "Telefono": ["El teléfono solo admite dígitos y un '+' inicial (7 a 15 caracteres)."] } }` |
| 404 | Recurso no encontrado (`NoEncontradoException`) | `{ "status": 404, "title": "Cliente no encontrado." }` |
| 409 | Conflicto (`ConflictoException`) | `{ "status": 409, "title": "Ya existe una medición para esa fecha." }` |
| 500 | Error no controlado | `{ "status": 500, "title": "Error interno." }` |

> Los textos de `title` y de `errors` son ilustrativos; los reales provienen del mensaje de la excepción y de los validadores en `Application/Validators`.

## AutenticacionController — `/api/autenticacion`

*Fuera de alcance del MVP.* Basado en PRD Epic 1 (US-001, US-002). Status y JSON de respuesta: pendientes de definir (no implementado).

| Método | Ruta | Descripción | US |
|---|---|---|---|
| POST | `/api/autenticacion/iniciar-sesion` | Inicia sesión con correo y contraseña; emite cookie JWT `HttpOnly`. | US-001 |
| POST | `/api/autenticacion/cerrar-sesion` | Cierra la sesión actual e invalida la cookie. | Inferido (US-001) |
| POST | `/api/autenticacion/olvide-password` | Envía un enlace de restablecimiento al correo registrado. | US-002 |
| POST | `/api/autenticacion/restablecer-password` | Aplica una nueva contraseña usando el token del enlace. | US-002 |

## UsuarioController — `/api/usuarios`

*Fuera de alcance del MVP.* Basado en PRD Epic 1 (US-003) — gestión de cuentas de nutricionistas por el administrador. Status y JSON de respuesta: pendientes de definir (no implementado).

| Método | Ruta | Descripción | US |
|---|---|---|---|
| GET | `/api/usuarios` | Lista las cuentas con nombre, correo, rol y estado. | US-003 |
| POST | `/api/usuarios` | Crea una cuenta de nutricionista (nombre, correo, rol). | US-003 |
| PUT | `/api/usuarios/{id}` | Edita los datos de una cuenta existente. | Inferido (US-003) |
| PATCH | `/api/usuarios/{id}/desactivar` | Desactiva la cuenta sin eliminar sus datos asociados. | US-003 |

## ClienteController — `/api/clientes`

Basado principalmente en `docs/US-004-CRUD-Cliente.md`; el listado/filtros/perfil se complementan con PRD Epic 2 (US-005, US-006, US-007, US-015) y Epic 3 (US-010), no detallados en `docs/`.

| Método | Ruta | Descripción | US | Status | Respuesta |
|---|---|---|---|---|---|
| GET | `/api/clientes` | Lista paginada (25 por página), con búsqueda por Nombre/Id y filtros avanzados (rango de edad, género, objetivo del plan, rango de última visita) por query string. | US-004 (listado), US-005, US-015 | 200 | JSON `ResultadoPaginadoDto<ClienteListadoDto>` |
| GET | `/api/clientes/{id}` | Perfil completo del cliente: datos personales, última medición destacada, historial y plan activo. | US-007 | 200 / 404 | JSON `ClienteDto` |
| POST | `/api/clientes` | Registra un nuevo cliente. Valida unicidad de `Id` (documento) y formato de `Email`. | US-004 | 201 (+ `Location`) / 400 | JSON `ClienteDto` |
| PUT | `/api/clientes/{id}` | Edita los datos del cliente (todos los campos excepto `Id`, `Edad` y `Activo`). | US-004, US-006 | 200 / 400 / 404 | JSON `ClienteDto` |
| GET | `/api/clientes/{id}/informes/pdf` | Genera y descarga el informe de progreso del cliente en PDF. | Inferido (US-010) | — | No implementado |

**Ejemplo `GET /api/clientes`** (200, `ResultadoPaginadoDto<ClienteListadoDto>`):

```json
{
  "items": [
    { "id": "123", "nombre": "Ana Pérez", "telefono": "+50688887777", "email": "ana@mail.com", "activo": true },
    { "id": "124", "nombre": "Luis Mora", "telefono": null, "email": null, "activo": true }
  ],
  "pagina": 1,
  "tamanoPagina": 20,
  "total": 2
}
```

> `telefono` es opcional (`null` si no se registró). Si se envía, debe ser solo dígitos con un `+` inicial opcional, de 7 a 15 caracteres en total (`^\+?\d{7,15}$`); si no, la API responde 400 con el error en `errors.Telefono`. Un valor vacío o con solo espacios se guarda como `null`.

**Ejemplo `ClienteDto`** (200 / 201):

```json
{
  "id": "123",
  "nombre": "Ana Pérez",
  "fechaNacimiento": "1990-05-01",
  "edad": 36,
  "genero": "F",
  "altura": 165,
  "telefono": "+50688887777",
  "email": "ana@mail.com",
  "fechaIngreso": "2026-10-01",
  "activo": true
}
```

> **Pendiente sin endpoint definido:** activar/desactivar un cliente (campo `Activo` de US-004) no tiene un flujo de UI ni de API descrito en la documentación — US-004 lo marca explícitamente como fuera de su alcance.

## MedicionController — `/api/clientes/{clienteId}/mediciones`

Basado en `docs/US-008-Medicion-Composicion-Corporal.md` y `docs/US-009-Historial-Progreso-Graficos.md`.

| Método | Ruta | Descripción | US | Status | Respuesta |
|---|---|---|---|---|---|
| GET | `/api/clientes/{clienteId}/mediciones` | Histórico de mediciones del cliente, ordenado de más reciente a más antigua. Admite los parámetros opcionales `desde` y `hasta` (query string, `yyyy-MM-dd`, ambos inclusivos y combinables o por separado) para el filtro de rango de fechas. | US-008 (tabla histórico), US-009 | 200 / 400 (rango invertido o fecha inválida) / 404 | JSON arreglo de `MedicionResumenDto` |
| GET | `/api/clientes/{clienteId}/mediciones/{fecha}` | Detalle de una medición puntual, incluyendo sus tratamientos y su plan nutricional. `fecha` en formato `yyyy-MM-dd`. | US-008 | 200 / 404 | JSON `MedicionDto` |
| POST | `/api/clientes/{clienteId}/mediciones` | Crea una medición nueva (Fecha = hoy) junto con sus tratamientos y su plan nutricional, en un único guardado. | US-008 | 201 (+ `Location` al GET por fecha) / 400 / 404 / 409 | JSON `MedicionDto` |
| PUT | `/api/clientes/{clienteId}/mediciones/{fecha}` | Actualiza la medición del día completa (medición + tratamientos + plan nutricional) mientras la bandera de "ya guardado" siga activa en la misma sesión. | US-008 | 200 / 400 / 404 / 409 | JSON `MedicionDto` |

> **Filtro por rango (US-009):** `desde` y `hasta` son opcionales; sin ellos devuelve todo el histórico. Si `desde` es posterior a `hasta` responde 400 (`application/problem+json` con `errors.desde`: "La fecha inicial no puede ser posterior a la fecha final."); una fecha con formato inválido también responde 400, y un cliente inexistente responde 404 (se valida antes que el rango). Un rango sin mediciones responde 200 con `[]`.

**Ejemplo `GET .../mediciones`** (200, `MedicionResumenDto[]`; arreglo en la raíz, sin envoltorio):

```json
[
  {
    "fechaMedicion": "2026-10-12",
    "peso": 72.5,
    "grasa": 22.1,
    "masaMuscular": 31.4,
    "agua": 55.0,
    "grasaVisceral": 6.0,
    "imc": 24.3
  }
]
```

**Ejemplo `MedicionDto`** (200 / 201):

```json
{
  "clienteId": "123",
  "fechaMedicion": "2026-10-12",
  "peso": 72.5,
  "grasa": 22.1,
  "masaMuscular": 31.4,
  "agua": 55.0,
  "grasaVisceral": 6.0,
  "imc": 24.3,
  "tratamientos": [
    { "secuencia": 1, "producto": "Omega 3", "dosis": "1 cápsula/día" }
  ],
  "plan": {
    "lacteo": 2, "fruta": 3, "vegetales": 4, "harinas": 3,
    "proteina": 5, "grasa": 2, "agua": 8
  }
}
```

**Body de POST / PUT** (`GuardarMedicionDto`; entrada, sin fecha: la define el servidor):

```json
{
  "peso": 72.5, "grasa": 22.1, "masaMuscular": 31.4,
  "agua": 55.0, "grasaVisceral": 6.0, "imc": 24.3,
  "tratamientos": [ { "producto": "Omega 3", "dosis": "1 cápsula/día" } ],
  "plan": { "lacteo": 2, "fruta": 3, "vegetales": 4, "harinas": 3, "proteina": 5, "grasa": 2, "agua": 8 }
}
```

> **Nota:** Tratamiento y Plan Nutricional no tienen endpoints propios. US-008 especifica que ambos se validan y se persisten junto con la medición en el mismo botón "Guardar"; no existe una acción de guardado independiente para ellos en la UI.
>
> **Nota de nombres:** `Plan Nutricional` aquí es el bloque de 7 porciones (Lácteos, Frutas, Vegetales, Harinas, Proteínas, Grasas, Agua) ligado 1:1 a una medición (US-008). Es un concepto distinto del "plan nutricional" versionado de `PlanController` (Epic 4).

## PlanController — `/api/clientes/{clienteId}/planes`

*Dentro del alcance MVP.* Inferido de PRD Epic 4 (US-011, US-012, US-013) — no hay un US detallado en `docs/` para este módulo. Status y JSON de respuesta: pendientes de definir (no implementado).

| Método | Ruta | Descripción | US |
|---|---|---|---|
| GET | `/api/clientes/{clienteId}/planes` | Historial de planes del cliente (activo y archivados), en orden cronológico inverso. | US-013 |
| GET | `/api/clientes/{clienteId}/planes/activo` | Plan nutricional activo del cliente. | US-007, US-011 |
| GET | `/api/clientes/{clienteId}/planes/{planId}` | Detalle de una versión específica del plan. | US-012, US-013 |
| POST | `/api/clientes/{clienteId}/planes` | Crea y asigna un nuevo plan como activo; archiva automáticamente el plan activo anterior. | US-011 |
| PUT | `/api/clientes/{clienteId}/planes/{planId}` | Edita el plan activo: crea una nueva versión y archiva la anterior. | US-012 |

## PanelController — `/api/panel`

*Dentro del alcance MVP.* Inferido de PRD Epic 5 (US-014) — no hay un US detallado en `docs/` para este módulo. Status y JSON de respuesta: pendientes de definir (no implementado).

| Método | Ruta | Descripción | US |
|---|---|---|---|
| GET | `/api/panel/resumen` | Tarjetas KPI: clientes totales, consultas de la semana, clientes sin mediciones en 30 días, clientes nuevos del mes. | US-014 |
| GET | `/api/panel/clientes-recientes` | Los 5 clientes registrados más recientemente. | US-014 |
