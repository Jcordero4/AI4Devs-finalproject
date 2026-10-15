## Why

La nutricionista necesita registrar mediciones de composición corporal de un cliente en cualquier momento para dar seguimiento a su progreso físico entre consultas. Hoy solo existe la gestión de clientes (`gestion-cliente`); sin mediciones no hay histórico que alimente el seguimiento (US-009) ni los informes (US-010).

Origen: `docs/US-008-Medicion-Composicion-Corporal.md` (y `docs/API-Controllers.md`, sección `MedicionController`).

## What Changes

- Nuevo flujo "Nueva Medición" accesible desde el listado de clientes mediante un botón "Nueva Medición" (requiere cliente seleccionado).
- Pantalla de Nueva Medición con tres secciones: Datos Generales del cliente (solo lectura), captura de la medición con tabla de histórico (más reciente primero, 10 visibles con scroll y encabezado fijo) y Acciones (Volver, Guardar, Tratamiento, Plan de Nutrición).
- Registro de medición (Peso, % Grasa, Masa Muscular, % Agua, Grasa Visceral, IMC) con FechaMedicion = fecha actual, no editable. PK compuesta (Id de cliente, FechaMedicion).
- Tratamiento: múltiples filas (Producto, Dosis) por medición, con `Secuencia` autoincremental por medición, editadas en un modal con alta, eliminación con confirmación y validación al cerrar.
- Plan Nutricional de la medición: 7 porciones (Lácteos, Frutas, Vegetales, Harinas, Proteínas, Grasas, Agua), relación 1:1 con la medición. No es el plan versionado de Epic 4.
- Guardado conjunto y atómico de los tres bloques (medición + tratamientos + plan); si falta algo en cualquiera, no se guarda nada. Re-guardar en la misma sesión actualiza el mismo registro (bandera "ya guardado").
- Confirmación al salir con cambios sin guardar ("Guardar" / "Omitir").
- API: `GET/POST /api/clientes/{clienteId}/mediciones`, `GET/PUT /api/clientes/{clienteId}/mediciones/{fecha}`. Tratamiento y plan sin endpoints propios.
- Nuevas tablas y migración EF Core: Medicion, Tratamiento, PlanNutricional.

## Capabilities

### New Capabilities
- `medicion-composicion-corporal`: registro de mediciones de composición corporal con sus tratamientos y plan nutricional, histórico del cliente, validaciones, guardado conjunto y confirmación al salir.

### Modified Capabilities
- `gestion-cliente`: el listado de clientes agrega el botón "Nueva Medición", que navega a la pantalla de Nueva Medición del cliente seleccionado.

## Impact

- **Domain**: entidades `Medicion`, `Tratamiento`, `PlanNutricional`.
- **Application**: DTOs, validadores FluentValidation, `ServicioMedicion`, interfaz de repositorio.
- **Infrastructure**: configuración EF Core, repositorio, nueva migración (MySQL).
- **API**: `MedicionController` bajo `/api/clientes/{clienteId}/mediciones`.
- **Web**: pantalla `NuevaMedicion` con modales de Tratamiento y Plan de Nutrición, servicio `medicionService.ts`, ruta nueva y botón en `ListadoClientes`; sigue `docs/estandarUI-UX.md`.
- **Tests**: unitarios de validación y servicio, integración de los endpoints.
- Sin cambios de dependencias ni autenticación (fuera del MVP).

## Fuera de alcance

- Edición o eliminación de mediciones históricas ya cerradas (fuera de la sesión de captura actual).
- Eliminación de registros de medición.
- Gráficos, filtros por rango de fechas del histórico y progreso (US-009), e informe PDF (US-010).
- Plan nutricional versionado (`PlanController`, Epic 4).
- Autenticación y roles.
