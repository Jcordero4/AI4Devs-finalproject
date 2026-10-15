## 1. Domain

- [x] 1.1 Crear entidades `Medicion`, `Tratamiento` y `PlanNutricional` en `Domain/Entities` (sin dependencias de EF Core)
- [x] 1.2 Tests xUnit de las reglas de dominio (fecha actual, valores por defecto del plan en 0)

## 2. Application

- [x] 2.1 Crear DTOs (`CrearMedicionDto`, `ActualizarMedicionDto`, `MedicionDto`, `MedicionResumenDto`, `TratamientoDto`, `PlanNutricionalDto`) en `Application/DTOs`
- [x] 2.2 Crear validadores FluentValidation: valores positivos, Producto ≤ 50 y Dosis ≤ 150 obligatorios, porciones enteras ≥ 0, plan obligatorio
- [x] 2.3 Crear `IRepositorioMedicion` en `Application/Interfaces`
- [x] 2.4 Crear `ServicioMedicion`: histórico, detalle por fecha, alta (fecha del servidor, 409 si ya existe la del día, 404 si no existe el cliente), actualización solo de la fecha de hoy
- [x] 2.5 Registrar servicio y validadores en `Application/DependencyInjection.cs`
- [x] 2.6 Tests xUnit de validadores y de `ServicioMedicion` (alta, duplicado 409, cliente inexistente 404, actualización del día, histórica rechazada, bloque incompleto)

## 3. Infrastructure

- [x] 3.1 Configurar `Medicion`, `Tratamiento` y `PlanNutricional` en `NutriTrackDbContext` (PKs compuestas, `HasPrecision(10, 2)`, FK a Clientes, cascade, relación 1:1 del plan)
- [x] 3.2 Implementar `RepositorioMedicion` con guardado atómico del agregado y reemplazo de tratamientos (Secuencia 1..N) en actualización
- [x] 3.3 Generar migración `CrearTablasMedicion` y verificar que el script no usa SQL crudo
- [x] 3.4 Registrar el repositorio en `Infrastructure/DependencyInjection.cs`

## 4. API

- [x] 4.1 Crear `MedicionController` en `/api/clientes/{clienteId}/mediciones`: `GET`, `GET {fecha}`, `POST`, `PUT {fecha}`; sin `DELETE`
- [x] 4.2 Verificar mapeo de errores 400/404/409 con el middleware existente
- [x] 4.3 Tests de integración (`Microsoft.AspNetCore.Mvc.Testing`): alta con tratamientos y plan, histórico ordenado, detalle, 404, 409, 400 por valores no positivos, PUT del día, PUT histórica rechazada, `DELETE` 405/404, atomicidad ante fallo
- [x] 4.4 Actualizar `docs/API-Controllers.md` si cambia algún contrato respecto a lo documentado

## 5. Frontend (delegar a `frontend-designer`; leer `docs/estandarUI-UX.md`)

- [x] 5.1 Crear `Web/src/services/medicionService.ts` con tipos de DTO y llamadas vía `apiClient`
- [x] 5.2 Agregar botón "Nueva Medición" en `ListadoClientes` con mensaje si no hay selección y navegación a `/clientes/:id/mediciones/nueva`
- [x] 5.3 Crear `NuevaMedicion.tsx` con Datos Generales (solo lectura), tabla de captura con Fecha no editable y tabla de histórico (10 visibles, scroll, encabezado fijo)
- [x] 5.4 Crear modal Tratamiento: fila editable por defecto, "Nuevo Producto", eliminar con confirmación Sí/No, "Cerrar" bloqueado con filas incompletas y su mensaje
- [x] 5.5 Crear modal/tabla Plan de Nutrición: 7 filas fijas, valor editable, default 0
- [x] 5.6 Implementar Guardar: validación de los tres bloques con mensaje del bloque incompleto, bandera `yaGuardado` (POST la primera vez, PUT después), guardado conjunto
- [x] 5.7 Implementar Volver con confirmación Guardar/Omitir solo si hay cambios sin guardar
- [x] 5.8 Agregar la ruta en `Web/src/App.tsx`; accesibilidad (`role="dialog"`, foco, `aria-*`) y estados cargando/vacío/error
- [x] 5.9 `npm run lint` y `npm run build` en `Web/` sin errores nuevos
- [x] 5.10 Actualizar `docs/estandarUI-UX.md` con modales y tabla con encabezado fijo

## 6. Cierre

- [x] 6.1 Actualizar `README.md` si cambia estructura (nuevas entidades, endpoints, pantalla)
- [x] 6.2 Ejecutar `dotnet build NutriTrack.slnx` y `dotnet test NutriTrack.slnx`
- [ ] 6.3 Verificación manual en navegador del flujo completo (crear, re-guardar, volver con cambios, histórico con más de 10 registros)
- [ ] 6.4 Archivar el change con `/opsx:archive` para sincronizar las specs
