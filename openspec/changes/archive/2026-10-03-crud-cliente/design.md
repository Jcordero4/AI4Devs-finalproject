## Context

Repo tiene solo el esqueleto N-tier vacío (`Domain`, `Application`, `Infrastructure`, `API`, `Web`, `Test`); `NutriTrackDbContext` no tiene `DbSet`s. Stack fijo (README §1.4, §4): .NET `net10.0`, EF Core 8 + Pomelo MySQL 8.x, FluentValidation, React 19 + TypeScript + Vite, Bootstrap 5. Sin autenticación (fuera del MVP). Identificadores y docs en español. Contrato de rutas en `docs/API-Controllers.md` (`/api/clientes`).

Fuente de requisitos: `docs/US-004-CRUD-Cliente.md`.

## Goals / Non-Goals

**Goals:**
- Endpoints `GET /api/clientes`, `GET /api/clientes/{id}`, `POST`, `PUT {id}`.
- Reglas de dominio de Cliente centralizadas (Edad, Id inmutable, defaults de FechaIngreso/Activo).
- Pantallas Listado / Nuevo / Edición según el US.

**Non-Goals:**
- Eliminar, activar/desactivar clientes.
- Filtros avanzados (edad, género, objetivo, última visita), perfil completo con mediciones/plan (US-005/007/015 más allá de lo que cubre US-004).
- Autenticación/roles.

## Decisions

1. **Edad calculada, no persistida.** `Edad` se deriva de `FechaNacimiento` en la entidad (propiedad calculada con `DateOnly` y fecha actual) y se expone en el DTO; no hay columna. *Alternativa:* columna persistida → se desactualiza con el tiempo y viola "nunca capturada manualmente". Se valida `FechaNacimiento` no futura para que Edad nunca sea negativa.
2. **Id como `string` PK (varchar 15), inmutable.** El `PUT` toma el Id de la ruta; el DTO de edición no lo incluye. El repositorio no actualiza `Id`. Duplicado en `POST` → `409 Conflict` con mensaje "Id ya registrado" (chequeo previo + captura de violación de PK por carrera).
3. **DTOs separados:** `CrearClienteDto`, `EditarClienteDto` (sin Id/Edad/Activo), `ClienteDto` (respuesta con Edad), `ClienteListadoDto` (Id, Nombre, Email, Activo), `ResultadoPaginadoDto<T>`. Validadores FluentValidation por DTO de entrada: obligatorios, `Nombre` ≤ 50, `Id` ≤ 15, `Genero` ∈ {M,F}, `Altura` > 0, `Email` opcional con formato y ≤ 320.
4. **Listado:** query string `nombre`, `id`, `pagina` (default 1), `tamanoPagina` fijo 25 (default del sistema, no configurable por cliente). Orden `Nombre` asc. Filtros por coincidencia parcial (`Contains`, parametrizado por EF; sin SQL crudo). Índice en `Nombre` (EF `HasIndex`).
5. **Capas:** `IRepositorioCliente` en Application, implementación en Infrastructure; `ServicioCliente` en Application orquesta validación/reglas; controller delgado. Registro en `AddApplication` / `AddInfrastructure`. Errores de validación → `400` con `ValidationProblemDetails`; manejo uniforme en `API/Middleware`.
6. **FechaIngreso/Activo** los asigna `ServicioCliente` al crear (`DateOnly.FromDateTime(DateTime.Today)`, `true`); no existen en DTOs de entrada.
7. **Frontend:** `react-router` para rutas `/clientes`, `/clientes/nuevo`, `/clientes/:id/editar`; `services/clienteService.ts` sobre `apiClient.ts`; componentes `ListadoClientes`, `FormularioCliente` (compartido Nuevo/Edición, Id deshabilitado en edición), hook `useClientes`. Selección de fila única con estado local, clic en cualquier parte de la fila. Confirmación al "Volver" comparando valores actuales vs iniciales (en Nuevo: vs vacío). Mensaje de éxito pasado vía estado de navegación. Los datos ingresados se conservan al fallar validación (no se resetea el formulario).
8. **Datepicker:** US pide "datepicker de jQuery", pero el stack es React sin jQuery. Se usa `<input type="date">` nativo (con `max` = hoy) y se calcula Edad en cliente al cambiar la fecha. *Alternativa:* añadir jQuery UI → dependencia pesada e incompatible con el modelo de React. Desviación a confirmar.
9. **Columna "Teléfono":** el listado del US la pide pero el modelo de datos no tiene `Telefono`. Se **omite** (no se inventa campo); ver Open Questions.

## Risks / Trade-offs

- [Edad calculada con zona horaria del servidor distinta a la del usuario] → usar fecha del servidor de forma consistente; aceptable para MVP.
- [Condición de carrera en Id duplicado] → además del chequeo previo, capturar la excepción de PK duplicada y mapear a 409.
- [Cliente con Id largo/caracteres raros en la ruta] → validar longitud y escapar con `encodeURIComponent` en el front.
- [Pomelo 8.x con `net10.0`] → versiones fijadas a propósito; verificar que la migración inicial se genere y aplique.
- [Colisión de collation en búsqueda por Nombre] → usar collation `utf8mb4_0900_ai_ci` por defecto de MySQL 8 (insensible a mayúsculas/acentos).

## Migration Plan

1. Generar migración inicial `CrearTablaClientes` en `Infrastructure/Migrations`.
2. Aplicar con `dotnet ef database update` en entorno de desarrollo (credenciales en `appsettings.Development.json`).
3. Rollback: revertir la migración (`dotnet ef database update 0`); sin datos previos que preservar.

## Open Questions

- ¿Se agrega campo `Telefono` (opcional) al modelo para satisfacer la columna del listado, o se retira la columna del US?
- ¿Aceptan `<input type="date">` en lugar del datepicker jQuery?
- ¿Búsqueda por Id: coincidencia parcial o exacta? (se asume parcial, igual que Nombre).
