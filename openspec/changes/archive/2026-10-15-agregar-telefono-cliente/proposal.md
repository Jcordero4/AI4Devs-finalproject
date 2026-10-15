## Why

El listado de clientes de US-004 pide una columna "Teléfono" (`docs/US-004-CRUD-Cliente.md`, Pantalla de Listado), y el PRD (`docs/PRD.md`, formulario y lista de clientes) y el backlog (`docs/backlog-NutriTrack.md`) lo incluyen como dato de contacto. Sin embargo el modelo de datos del US no lo definía y el change archivado `2026-10-03-crud-cliente` lo omitió dejando la pregunta abierta. Se confirma que el teléfono es un dato importante para el nutricionista, por lo que se agrega ahora para cerrar la discrepancia entre documentación y código.

## What Changes

- Se agrega el campo opcional `Telefono` a `Cliente`: `Varchar(15)`, nullable.
- Formato de entrada abierto pero acotado, sin librería externa: solo dígitos con un `+` inicial opcional (`^\+?\d{7,15}$`, largo total ≤ 15). No se aceptan letras, guiones, espacios ni paréntesis.
- Alta y edición aceptan `Telefono`; se aplica `trim` y un valor vacío se guarda como `null`.
- El listado de clientes agrega la columna "Teléfono" (Id, Nombre, Teléfono, Email, Activo).
- La API incluye `telefono` en las respuestas de cliente (detalle y listado) y en los cuerpos de alta/edición.
- Nueva migración EF Core `AgregarTelefonoCliente` (solo agrega la columna).
- Se actualiza la documentación para eliminar la discrepancia: `readme.md` (§4.8), `docs/US-004-CRUD-Cliente.md`, `docs/UserStories/US-004 - Registrar un nuevo cliente.md` y `docs/API-Controllers.md`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `gestion-cliente`: alta y edición aceptan `Telefono` opcional con validación de formato; el listado muestra la columna Teléfono.

## Impact

- **Domain**: `Domain/Entities/Cliente.cs`.
- **Application**: `ClienteDtos.cs`, `ClienteValidators.cs`, `ServicioCliente.cs`.
- **Infrastructure**: `NutriTrackDbContext.cs`, nueva migración y `NutriTrackDbContextModelSnapshot.cs`. Cambio aditivo (columna nullable), sin pérdida de datos.
- **API**: cambia el contrato JSON de Cliente (campo nuevo `telefono`); no es breaking porque es opcional y aditivo.
- **Web**: `clienteService.ts`, `FormularioCliente.tsx`, `ListadoClientes.tsx`; se actualiza `docs/estandarUI-UX.md` si el estándar cambia.
- **Tests**: `Test/Unit/ClienteUnitTests.cs`, `Test/Integration/ClienteApiTests.cs`.
- **Docs**: ver arriba.
- Sin dependencias nuevas.

## Fuera de alcance

- Normalización a E.164, selector de país o región por defecto, y uso de librerías de teléfonos (libphonenumber).
- Extensiones telefónicas y múltiples teléfonos por cliente.
- Filtro o búsqueda por teléfono en el listado.
- Obligatoriedad del campo.
- Autenticación/roles (fuera del MVP, README §2.3).
