## 1. Dominio

- [x] 1.1 Crear entidad `Cliente` en `Domain/Entities` (Id, Nombre, FechaNacimiento, Genero, Altura, Email, FechaIngreso, Activo) con `Edad` calculada
- [x] 1.2 Crear enum/constantes de `Genero` (M/F) en `Domain/Enums`

## 2. Application

- [x] 2.1 Crear DTOs: `CrearClienteDto`, `EditarClienteDto`, `ClienteDto`, `ClienteListadoDto`, `ResultadoPaginadoDto<T>`
- [x] 2.2 Definir `IRepositorioCliente` (existe, obtener, listar paginado con filtros, agregar, actualizar)
- [x] 2.3 Crear validadores FluentValidation para `CrearClienteDto` y `EditarClienteDto` (obligatorios, longitudes, Genero M/F, Altura > 0, Email, FechaNacimiento no futura)
- [x] 2.4 Implementar `ServicioCliente` (crear con FechaIngreso/Activo automáticos y control de Id duplicado, editar sin tocar Id, obtener, listar) con excepciones de dominio para 404/409
- [x] 2.5 Registrar servicios y validadores en `AddApplication`

## 3. Infrastructure

- [x] 3.1 Agregar `DbSet<Cliente>` y configuración EF (PK Id varchar(15), longitudes, Genero char(1), índice en Nombre) en `NutriTrackDbContext`
- [x] 3.2 Implementar `RepositorioCliente` con consultas parametrizadas, orden por Nombre y paginado
- [x] 3.3 Registrar repositorio en `AddInfrastructure`
- [x] 3.4 Generar migración inicial `CrearTablaClientes` y aplicarla en desarrollo (aplicada manualmente por el usuario)

## 4. API

- [x] 4.1 Crear `ClienteController` (`GET /api/clientes`, `GET {id}`, `POST`, `PUT {id}`; sin DELETE)
- [x] 4.2 Agregar middleware de manejo de errores (validación → 400, duplicado → 409, no encontrado → 404)

## 5. Frontend

- [x] 5.1 Agregar `react-router-dom` y definir rutas `/clientes`, `/clientes/nuevo`, `/clientes/:id/editar`
- [x] 5.2 Crear tipos TS y `services/clienteService.ts` sobre `apiClient.ts`
- [x] 5.3 Implementar pantalla de Listado: filtros Nombre/Id, botón Filtrar, tabla con selección única por fila, paginado de 25, botones Nuevo/Editar y mensaje "Debe seleccionar el cliente a editar."
- [x] 5.4 Implementar `FormularioCliente` compartido (Card, Edad autocalculada de solo lectura, Género desplegable en blanco, Activo marcado/no editable, Id deshabilitado en edición)
- [x] 5.5 Implementar pantallas Nuevo y Edición: validación de obligatorios, mensajes de error (Id duplicado, Email inválido), conservación de datos, mensaje "Cliente guardado con éxito"
- [x] 5.6 Implementar confirmación al "Volver" cuando hay cambios vs. estado inicial

## 6. Pruebas

- [x] 6.1 Pruebas unitarias: cálculo de Edad, validadores y `ServicioCliente`
- [x] 6.2 Pruebas de integración de endpoints (alta, duplicado 409, Email inválido 400, edición, 404, listado ordenado/paginado/filtrado)
- [x] 6.3 Ejecutar `dotnet test NutriTrack.slnx`, `npm run lint` y `npm run build`

## 7. Documentación

- [x] 7.1 Actualizar `README.md` si cambia stack/estructura (react-router, migraciones)
