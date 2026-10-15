# US-004 — CRUD de Cliente

## Historia de Usuario
**Como** nutricionista,
**quiero** registrar, consultar y editar los datos personales y de contacto de un cliente,
**para** contar con un perfil de cliente completo y consultable desde la primera visita.

## Nota de Alcance
Este US-004 cubre la implementación completa del CRUD de Cliente e incluye las funcionalidades descritas en US-005, US-006 y US-007 (no se gestionan como historias independientes).

## Modelo de Datos — Cliente

| # | Campo | Tipo | Obligatorio | Reglas |
|---|-------|------|:---:|--------|
| 1 | Id | Varchar(15) | Sí | PK. Representa cédula o pasaporte. Debe ser único (no se permite duplicar). Inmutable después de creado. |
| 2 | Nombre | Varchar(50) | Sí | Se crea índice para agilizar búsquedas. |
| 3 | FechaNacimiento | Fecha | Sí | — |
| 4 | Edad | Entero | Sí | Autocalculada a partir de FechaNacimiento. No editable. Nunca negativa. |
| 5 | Genero | Char('M'\|'F') | Sí | M = Masculino, F = Femenino. Base para cálculo de composición corporal y plan nutricional. |
| 6 | Altura | Entero | Sí | En centímetros. Debe ser mayor a 0. |
| 7 | Telefono | Varchar(15) | No | Si se ingresa, solo dígitos con un `+` inicial opcional (código de país); sin letras, guiones, espacios ni paréntesis. Mínimo 7 dígitos y máximo 15 caracteres en total (`^\+?\d{7,15}$`). Vacío se guarda como nulo. |
| 8 | Email | Varchar(320) | No | Si se ingresa, debe cumplir formato de correo válido (`texto@dominio.tld`). |
| 9 | FechaIngreso | Fecha | Sí | El sistema la asigna automáticamente con la fecha actual al crear el cliente. |
| 10 | Activo | Booleano | Sí | Por defecto `true` al crear. No editable manualmente en este US (activar/desactivar es un flujo aparte). |

## Reglas de Negocio
1. La Edad siempre se deriva de FechaNacimiento; nunca se captura manualmente.
2. El Id no puede repetirse entre clientes ni modificarse una vez creado el registro.
3. Activo se marca en `true` al crear el cliente y no se expone como campo editable en las pantallas de Nuevo.
4. FechaIngreso se asigna automáticamente al momento del alta; no es editable.

## CRUD Soportado
- **Crear**: alta de nuevo cliente.
- **Leer**: listado con filtros y búsqueda.
- **Actualizar**: edición de todos los campos excepto Id y Edad.
- **Eliminar**: no soportado. Solo se permite desactivar clientes (fuera de alcance de este US).

## Interfaz de Usuario

### Pantalla de Listado
1. Título del listado.
2. Dos secciones: Filtros y Listado de clientes.

**Sección de Filtros** (todos los controles en la misma fila)
1. Filtro por Nombre: input de texto libre.
2. Filtro por Id: input de texto libre.
3. Botón "Filtrar" que ejecuta la búsqueda con los valores ingresados.

**Sección de Listado**
1. Tabla con columnas de selección única (radio button) y columnas: Id, Nombre, Teléfono, Email, y checkbox no editable que indica si el cliente está activo.
2. Paginado con tamaño de página de 25 registros (valor por defecto del sistema).
3. Botón "Nuevo".
4. Botón "Editar".
5. El listado se carga ordenado alfabéticamente por Nombre.

### Pantalla de Nuevo
1. Título de la pantalla.
2. Sección tipo Card con: Id, Nombre, Fecha de Nacimiento, Edad (no editable, autocalculada), Género (lista desplegable Masculino/Femenino, en blanco por defecto), Altura, Teléfono (opcional), Email, y checkbox de Activo (marcado por defecto, no editable).
3. Fuera del Card: botones "Volver" y "Guardar", cada uno con ícono.
4. El campo Fecha de Nacimiento usa el selector de fecha nativo del navegador (`<input type="date">`).

### Pantalla de Edición
Mismo layout que la pantalla de Nuevo. Permite editar todos los campos excepto Edad y Id, ver Reglas de Negocio.

## Criterios de Aceptación

### Listado de clientes
- **GIVEN** existen clientes registrados **WHEN** se abre la pantalla de listado **THEN** se muestran ordenados alfabéticamente por Nombre, paginados de 25 en 25.
- **GIVEN** el listado está visible **WHEN** el usuario hace clic en cualquier parte de una fila **THEN** se marca el radio button de esa fila y la fila se resalta con color; solo una fila puede estar seleccionada a la vez.
- **GIVEN** el usuario ingresó un valor en el filtro de Nombre o de Id **WHEN** presiona "Filtrar" **THEN** el listado se actualiza mostrando solo los clientes que coinciden con el criterio.
- **GIVEN** ningún cliente está seleccionado **WHEN** el usuario presiona "Editar" **THEN** se muestra el mensaje "Debe seleccionar el cliente a editar." y no navega.
- **GIVEN** un cliente está seleccionado **WHEN** el usuario presiona "Editar" **THEN** se navega a la pantalla de Edición con los datos del cliente seleccionado cargados.
- **GIVEN** el usuario está en el listado **WHEN** presiona "Nuevo" **THEN** se navega a la pantalla de Nuevo con todos los campos vacíos.

### Alta de cliente (Pantalla de Nuevo)
- **GIVEN** el usuario completó Id, Nombre, Fecha de Nacimiento, Género y Altura **WHEN** presiona "Guardar" **THEN** el cliente se crea con FechaIngreso = fecha actual y Activo = true, se navega al listado, se muestra el mensaje "Cliente guardado con éxito" y el nuevo cliente aparece en el listado.
- **GIVEN** falta algún campo obligatorio (Id, Nombre, Fecha de Nacimiento, Género o Altura) **WHEN** el usuario presiona "Guardar" **THEN** se muestra un mensaje indicando que faltan datos por completar, no se guarda el cliente y se conservan todos los datos ya ingresados en pantalla.
- **GIVEN** el Id ingresado ya existe en otro cliente **WHEN** el usuario presiona "Guardar" **THEN** se muestra un mensaje de error indicando que el Id ya está registrado y no se guarda el cliente.
- **GIVEN** el usuario ingresó un Email con formato inválido **WHEN** presiona "Guardar" **THEN** se muestra un mensaje de error de formato y no se guarda el cliente, pero se mantiene en la pantalla y conserva los datos introducidos.
- **GIVEN** el usuario ingresó un Teléfono con letras, guiones, espacios, un `+` que no está al inicio, menos de 7 dígitos o más de 15 caracteres **WHEN** presiona "Guardar" **THEN** se muestra un mensaje de error de formato y no se guarda el cliente, pero se mantiene en la pantalla y conserva los datos introducidos.
- **GIVEN** el usuario ingresó un Teléfono con solo dígitos, con o sin `+` inicial (por ejemplo `88887777` o `+50688887777`), o lo dejó vacío **WHEN** presiona "Guardar" **THEN** el cliente se guarda; un Teléfono vacío se almacena como nulo.
- **GIVEN** el usuario selecciona una Fecha de Nacimiento **WHEN** la selecciona en el campo de fecha **THEN** el campo Edad se calcula y muestra automáticamente, sin permitir edición manual.
- **GIVEN** el usuario no ingresó ningún dato aún **WHEN** presiona "Volver" **THEN** regresa al listado sin mostrar confirmación.
- **GIVEN** el usuario ya ingresó algún dato (por ejemplo Nombre o Id) **WHEN** presiona "Volver" **THEN** se muestra el mensaje de confirmación "Está seguro que desea salir de la pantalla, se perderán los datos si no los guarda primero." antes de salir.

### Edición de cliente (Pantalla de Edición)
- **GIVEN** el usuario modificó uno o más campos editables **WHEN** presiona "Guardar" y todos los campos obligatorios son válidos **THEN** se actualiza el cliente, se navega al listado y se muestra el mensaje "Cliente guardado con éxito".
- **GIVEN** el usuario dejó vacío un campo obligatorio **WHEN** presiona "Guardar" **THEN** se muestra el mensaje de datos faltantes y se mantiene en la pantalla de edición sin perder los cambios ingresados.
- **GIVEN** el usuario no modificó ningún dato respecto a los valores originales **WHEN** presiona "Volver" **THEN** regresa al listado sin mostrar confirmación.
- **GIVEN** el usuario modificó al menos un dato respecto a los valores originales **WHEN** presiona "Volver" **THEN** se muestra el mensaje de confirmación de pérdida de datos antes de salir.
- **GIVEN** la pantalla de edición está cargada **WHEN** el usuario intenta modificar Id o Edad **THEN** estos campos permanecen no editables.

## Fuera de Alcance
- Eliminación física de clientes.
- Edición de Id y Edad desde la pantalla de Edición.
