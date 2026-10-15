## 1. Domain y Application

- [x] 1.1 Agregar `public string? Telefono { get; set; }` a `Domain/Entities/Cliente.cs`
- [x] 1.2 Agregar `string? Telefono` a `CrearClienteDto`, `EditarClienteDto`, `ClienteDto` y `ClienteListadoDto` en `Application/DTOs/ClienteDtos.cs`, junto a Email
- [x] 1.3 Agregar `ReglasCliente.PatronTelefono = @"^\+?\d{7,15}$"` y la regla `Telefono` (`MaximumLength(15)`, `Matches`, mensaje en español, `.When` no vacío) en `CrearClienteDtoValidator` y `EditarClienteDtoValidator`
- [x] 1.4 En `ServicioCliente`: generalizar `LimpiarEmail` a `LimpiarTexto`, asignar `Telefono` en alta y edición, y actualizar `Mapear` y el mapeo del listado

## 2. Infrastructure

- [x] 2.1 Configurar `e.Property(c => c.Telefono).HasMaxLength(15)` en `NutriTrackDbContext`
- [x] 2.2 Generar la migración `AgregarTelefonoCliente` (`dotnet ef migrations add AgregarTelefonoCliente -p Infrastructure -s API`) y verificar que solo agrega la columna `varchar(15)` nullable y actualiza el snapshot
- [x] 2.3 Reposicionar la columna `Telefono` después de `Altura` con `migrationBuilder.Sql` (`ALTER TABLE … MODIFY COLUMN … AFTER`) y reaplicar la migración

## 3. Tests (xUnit)

- [x] 3.1 Unit (`Test/Unit/ClienteUnitTests.cs`): validador rechaza teléfono con letras, guiones, espacios, `+` fuera de posición inicial, menos de 7 dígitos y más de 15 caracteres; acepta `88887777`, `+50688887777`, null y vacío
- [x] 3.2 Unit: el servicio guarda `Telefono` con trim y convierte vacío o solo espacios a `null` en alta y edición; ajustar helpers (`Valido()`, `EditarClienteDto`) al nuevo parámetro
- [x] 3.3 Integración (`Test/Integration/ClienteApiTests.cs`): alta con teléfono válido devuelve 201 con `telefono`; teléfono inválido devuelve 400 con error en `Telefono`; edición actualiza y permite quitar el teléfono; el listado devuelve `telefono`
- [x] 3.4 Actualizar las construcciones existentes de DTOs en los tests (incluidos los de Medicion si usan Cliente) y ejecutar `dotnet test NutriTrack.slnx`

## 4. Frontend (delegar a `frontend-designer`; leer y luego actualizar `docs/estandarUI-UX.md`)

- [x] 4.1 `Web/src/services/clienteService.ts`: agregar `telefono` a `Cliente`, `ClienteListado` y `DatosCliente`; `aCuerpo` envía `null` si está vacío (trim)
- [x] 4.2 `Web/src/components/FormularioCliente.tsx`: input `Teléfono` junto a Email (`type="tel"`, `inputMode="tel"`, `maxLength=15`), tecleo restringido a dígitos y `+` solo en la primera posición, validación con el mismo patrón, estado inicial y carga en edición
- [x] 4.3 `Web/src/components/ListadoClientes.tsx`: columna Teléfono entre Nombre y Email y `colSpan` 5→6 en el estado vacío
- [x] 4.4 Ejecutar `npm run lint` y `npm run build` en `Web/`

## 5. Documentación

- [x] 5.1 `readme.md` §4.8: agregar `varchar15 Telefono "nullable"` al ER, fila `Telefono` en la tabla Cliente (renumerar) y eliminar/reescribir la nota de discrepancia y el bullet de "Notas del modelo"
- [x] 5.2 `docs/US-004-CRUD-Cliente.md` y `docs/UserStories/US-004 - Registrar un nuevo cliente.md`: agregar `Telefono` Varchar(15) no obligatorio con su regla de formato al modelo de datos y a las pantallas de Nuevo y Edición
- [x] 5.3 `docs/API-Controllers.md`: agregar `telefono` a los JSON de ejemplo de Cliente (listado y `ClienteDto`) y mencionarlo en POST/PUT
- [x] 5.4 Revisar que no queden menciones de la discrepancia de `Telefono` en la documentación

## 6. Verificación

- [x] 6.1 `dotnet build NutriTrack.slnx` y `dotnet test NutriTrack.slnx` sin fallos
- [x] 6.2 Aplicar la migración (`dotnet ef database update`) y confirmar `Clientes.Telefono` como `varchar(15) NULL`
- [x] 6.3 Prueba manual vía Swagger: POST con `+50688887777` devuelve 201; `88-87` y `abc` devuelven 400 con `errors.Telefono`; PUT y GET reflejan el teléfono
- [x] 6.4 Prueba manual en la UI: el formulario no admite letras ni guiones y el listado muestra la columna Teléfono
