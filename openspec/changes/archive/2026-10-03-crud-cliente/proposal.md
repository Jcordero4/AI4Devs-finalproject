## Why

La nutricionista necesita un perfil de cliente completo y consultable desde la primera visita. Hoy el repo solo tiene el esqueleto N-tier vacío (sin entidades, controllers ni pantallas); Cliente es la entidad base de la que dependen Medición, Plan y Panel, por lo que debe existir primero (US-004, que absorbe US-005/006/007).

## What Changes

- Entidad `Cliente` en Domain con las reglas de negocio: `Id` (cédula/pasaporte) único e inmutable, `Edad` derivada de `FechaNacimiento`, `FechaIngreso` y `Activo` asignados por el sistema al crear.
- Persistencia EF Core (Pomelo MySQL) con índice sobre `Nombre`, repositorio y migración inicial.
- Casos de uso en Application: crear, editar, obtener por Id y listar (paginado de 25, orden por Nombre, filtros por Nombre e Id), con validación FluentValidation (obligatorios, `Email` con formato, `Altura` > 0, `Genero` M/F).
- Endpoints en `ClienteController` (`/api/clientes`): `GET` listado, `GET {id}`, `POST`, `PUT {id}`. Sin `DELETE` (solo desactivar, fuera de alcance).
- Frontend React + TypeScript: pantalla de Listado (filtros, tabla con selección única por fila, paginado, Nuevo/Editar), pantalla de Nuevo y de Edición (Card, Edad autocalculada, confirmación al salir con cambios, mensajes de éxito/error).
- Pruebas unitarias (validadores, cálculo de edad) e integración (endpoints).

## Capabilities

### New Capabilities
- `gestion-cliente`: alta, edición, consulta y listado con filtros/paginado de clientes (API y pantallas Listado/Nuevo/Edición), incluyendo reglas de Id único/inmutable, Edad autocalculada, FechaIngreso y Activo automáticos.

### Modified Capabilities
<!-- Ninguna: openspec/specs/ está vacío. -->

## Impact

- Código: `Domain/Entities`, `Application/{DTOs,Interfaces,Services,Validators}`, `Infrastructure/{Persistence,Repositories,Migrations}`, `API/Controllers/ClienteController.cs`, `Web/src/{components,hooks,services}`, `Test/`.
- Dependencias nuevas: FluentValidation (ya previsto en README), librería de rutas en Web (react-router) si no existe.
- Base de datos: nueva tabla `Clientes` (migración inicial).
- Sin autenticación (fuera del MVP). Contrato de rutas según `docs/API-Controllers.md`.
- Discrepancias del US a resolver en design: columna "Teléfono" del listado sin campo en el modelo; datepicker "jQuery" vs stack React.
