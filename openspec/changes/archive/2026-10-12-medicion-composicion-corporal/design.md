## Context

`gestion-cliente` ya existe (entidad `Cliente`, `ServicioCliente`, `RepositorioCliente`, `ClienteController`, migración `CrearTablaClientes`, pantallas `ListadoClientes` y `FormularioCliente`). US-008 agrega mediciones de composición corporal con tratamiento y plan de nutrición, guardados en conjunto. Origen: `docs/US-008-Medicion-Composicion-Corporal.md`, `docs/API-Controllers.md` (`MedicionController`). Arquitectura N-tier: `API → Application → Domain`, `Infrastructure → Application`, Domain sin EF Core.

## Goals / Non-Goals

**Goals:**
- Crear y actualizar (misma sesión) la medición del día con sus tratamientos y plan, de forma atómica.
- Exponer histórico (más reciente primero) y detalle por fecha.
- Pantalla Nueva Medición con modales de Tratamiento y Plan, validación por bloque y confirmación al salir.

**Non-Goals:**
- Edición/eliminación de mediciones históricas, filtros por rango, gráficos (US-009), PDF (US-010), plan versionado (Epic 4), autenticación.

## Decisions

**Modelo de datos**
- `Medicion`: PK compuesta (`ClienteId` varchar(15), `FechaMedicion` date). Decimales `Decimal(10,2)`: Peso, Grasa, MasaMuscular, Agua, GrasaVisceral, IMC. FK a `Clientes`.
- `Tratamiento`: PK compuesta (`ClienteId`, `FechaMedicion`, `Secuencia`); Producto varchar(50), Dosis varchar(150). FK a `Medicion` con cascade delete (necesario para reemplazar filas al actualizar).
- `PlanNutricional`: PK/FK (`ClienteId`, `FechaMedicion`), relación 1:1; enteros Lacteo, Fruta, Vegetales, Harinas, Proteina, Grasa, Agua con default 0. La columna `Fecha` del catálogo equivale a `FechaMedicion`; no se duplica como columna separada (se deriva de la PK) para evitar inconsistencia. El nombre `PlanNutricional` evita choque con el `Plan` versionado de Epic 4.
- Alternativa descartada: Id sustituto autonumérico en `Medicion`. La PK compuesta del catálogo es explícita en la US y garantiza una medición por cliente por día.

**Fecha y unicidad**: `FechaMedicion` la fija el servidor (`DateOnly.FromDateTime(DateTime.Today)`), nunca la entrada. POST con medición ya existente ese día → 409. PUT solo se acepta si `fecha` es la de hoy; otras fechas se rechazan (históricas no editables, fuera de alcance). Se acepta el límite de que la "sesión" se aproxima por "mismo día": la bandera "ya guardado" vive en el cliente web y decide POST vs PUT.

**Guardado atómico**: un solo `SaveChanges` sobre el agregado (`Medicion` con `Tratamientos` y `PlanNutricional`), que EF Core ejecuta en una transacción. PUT reemplaza el conjunto de tratamientos (elimina y re-inserta con Secuencia 1..N) y actualiza plan y medición dentro del mismo `SaveChanges`.

**Capas**
- Domain: `Medicion`, `Tratamiento`, `PlanNutricional` (clases POCO, sin EF).
- Application: `IRepositorioMedicion`, `ServicioMedicion`, DTOs (`CrearMedicionDto`/`ActualizarMedicionDto`, `MedicionDto`, `MedicionResumenDto`, `TratamientoDto`, `PlanNutricionalDto`), validadores FluentValidation (valores > 0; Producto ≤ 50 y Dosis ≤ 150 no vacíos; porciones enteras ≥ 0; plan obligatorio), excepciones existentes de `Excepciones.cs` para 404/409/400.
- Infrastructure: configuración en `NutriTrackDbContext`, `RepositorioMedicion`, nueva migración `CrearTablasMedicion`.
- API: `MedicionController` en `/api/clientes/{clienteId}/mediciones`: `GET` (histórico), `GET {fecha}`, `POST`, `PUT {fecha}`. Sin DELETE. Mismo manejo de errores del middleware existente.

**Frontend**
- Ruta `/clientes/:id/mediciones/nueva`, componente `NuevaMedicion.tsx` (dentro de `LayoutApp`), servicio `medicionService.ts` vía `apiClient`.
- Modales de Tratamiento y Plan como componentes controlados por estado React (sin JS de Bootstrap), con foco gestionado y `role="dialog"`/`aria-modal`. La confirmación "Guardar / Omitir" al salir y "¿Está seguro de eliminar…?" "Sí / No" también son modales propios (no `window.confirm`), por requerir botones distintos a Aceptar/Cancelar.
- Estado de la pantalla: valores de captura, filas de tratamiento, plan, bandera `yaGuardado`, y `haCambiado` (comparación con estado inicial/último guardado) para la confirmación al salir.
- Histórico: tabla en contenedor con `max-height` de ~10 filas, `overflow-y: auto` y `thead` con `position: sticky`.
- Botón "Nueva Medición" en `ListadoClientes` junto a Nuevo/Editar, mismo patrón de selección y mensaje de error.
- UI según `docs/estandarUI-UX.md` (tokens `--nt-*`, tarjetas, badges, accesibilidad).

**Validación en dos niveles**: cliente web (mensajes por bloque incompleto) y FluentValidation en API (fuente de verdad). IMC se captura manualmente (la US lo define como campo editable obligatorio), no se calcula.

## Risks / Trade-offs

- [Sesión aproximada por "mismo día"] → PUT solo para hoy y bandera en cliente; si el usuario recarga la pantalla tras guardar, el POST devolverá 409. Mitigación: la pantalla puede detectar la medición de hoy al cargar el histórico y precargarla en modo actualización (a confirmar, ver preguntas abiertas).
- [Reemplazo de tratamientos en PUT] → Secuencias se reasignan; aceptable porque no hay referencias externas a `Secuencia`.
- [Decimales con MySQL/Pomelo] → fijar `HasPrecision(10, 2)` explícito para evitar truncados.
- [Migración nueva] → depende de `CrearTablaClientes`; revertible con `dotnet ef migrations remove` / `database update <anterior>`.

## Migration Plan

1. Agregar migración `CrearTablasMedicion` y aplicarla (`dotnet ef database update`).
2. Rollback: `dotnet ef database update CrearTablaClientes` y retirar la migración.

## Open Questions

- Si el usuario regresa a la pantalla el mismo día tras haber salido, ¿debe precargarse la medición de hoy para actualizarla o bloquearse? La US dice que fuera de la sesión no es editable; este diseño asume bloqueo (409 al crear de nuevo).
- Mensaje exacto cuando se presiona "Nueva Medición" sin cliente seleccionado: no está en la US; se propuso "Debe seleccionar el cliente al que desea registrar la medición.".
- Rangos máximos razonables (p. ej. % Grasa ≤ 100) no están definidos en la US; solo se exige valor positivo.
