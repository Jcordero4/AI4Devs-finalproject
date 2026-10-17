# gestion-cliente Specification

## Purpose
TBD - Gestión de clientes (CRUD sin eliminación): listado, alta, edición, validaciones y confirmación al salir. Creado al sincronizar el change crud-cliente.

## Requirements

### Requirement: Listado de clientes
El sistema SHALL listar clientes ordenados alfabéticamente por Nombre, paginados de 25 en 25, con filtros por Nombre e Id aplicados al ejecutar "Filtrar".

#### Scenario: Listado inicial
- **WHEN** el usuario abre la pantalla de listado y existen clientes registrados
- **THEN** se muestran ordenados por Nombre, máximo 25 por página, con columnas Id, Nombre, Teléfono, Email y Activo (checkbox no editable)

#### Scenario: Cliente sin teléfono en el listado
- **GIVEN** un cliente registrado sin Telefono
- **WHEN** el usuario abre la pantalla de listado
- **THEN** la celda de Teléfono de ese cliente se muestra vacía

#### Scenario: Filtrar por Nombre o Id
- **WHEN** el usuario ingresa un valor en el filtro de Nombre o de Id y presiona "Filtrar"
- **THEN** el listado muestra solo los clientes que coinciden con el criterio

### Requirement: Selección de fila y navegación desde el listado
El sistema SHALL permitir seleccionar una sola fila a la vez, marcando su radio button y resaltándola, y SHALL ofrecer los botones "Nuevo", "Editar", "Nueva Medición" e "Historial".

#### Scenario: Seleccionar fila
- **WHEN** el usuario hace clic en cualquier parte de una fila
- **THEN** se marca el radio button de esa fila, se resalta con color y se deselecciona la anterior

#### Scenario: Editar sin selección
- **WHEN** ningún cliente está seleccionado y el usuario presiona "Editar"
- **THEN** se muestra "Debe seleccionar el cliente a editar." y no se navega

#### Scenario: Editar con selección
- **WHEN** hay un cliente seleccionado y el usuario presiona "Editar"
- **THEN** se navega a la pantalla de Edición con los datos de ese cliente cargados

#### Scenario: Nuevo
- **WHEN** el usuario presiona "Nuevo"
- **THEN** se navega a la pantalla de Nuevo con todos los campos vacíos

#### Scenario: Nueva Medición sin selección
- **GIVEN** ningún cliente está seleccionado
- **WHEN** el usuario presiona "Nueva Medición"
- **THEN** se muestra "Debe seleccionar el cliente al que desea registrar la medición." y no se navega

#### Scenario: Nueva Medición con selección
- **GIVEN** hay un cliente seleccionado
- **WHEN** el usuario presiona "Nueva Medición"
- **THEN** se navega a la pantalla de Nueva Medición de ese cliente

#### Scenario: Historial sin selección
- **GIVEN** ningún cliente está seleccionado
- **WHEN** el usuario presiona "Historial"
- **THEN** se muestra "Debe seleccionar el cliente cuyo historial desea consultar." y no se navega

#### Scenario: Historial con selección
- **GIVEN** hay un cliente seleccionado
- **WHEN** el usuario presiona "Historial"
- **THEN** se navega a la pantalla de Historial de ese cliente

### Requirement: Alta de cliente
El sistema SHALL crear un cliente cuando Id, Nombre, FechaNacimiento, Genero (M/F) y Altura (> 0) son válidos, asignando FechaIngreso = fecha actual y Activo = true. Telefono y Email son opcionales; si se ingresan, SHALL cumplir su formato.

#### Scenario: Alta exitosa
- **WHEN** el usuario completa los campos obligatorios válidos y presiona "Guardar"
- **THEN** el cliente se crea con FechaIngreso actual y Activo = true, se navega al listado, se muestra "Cliente guardado con éxito" y el cliente aparece en el listado

#### Scenario: Faltan campos obligatorios
- **WHEN** falta Id, Nombre, FechaNacimiento, Genero o Altura y el usuario presiona "Guardar"
- **THEN** se muestra un mensaje de datos faltantes, no se guarda y se conservan los datos ingresados

#### Scenario: Id duplicado
- **WHEN** el Id ingresado ya existe y el usuario presiona "Guardar"
- **THEN** la API responde 409, se muestra que el Id ya está registrado y no se guarda el cliente

#### Scenario: Email con formato inválido
- **WHEN** el Email ingresado no cumple `texto@dominio.tld` y el usuario presiona "Guardar"
- **THEN** se muestra un error de formato, no se guarda, y se mantiene la pantalla con los datos ingresados

#### Scenario: Altura no positiva
- **WHEN** Altura es 0 o negativa
- **THEN** la validación rechaza la solicitud y no se guarda el cliente

#### Scenario: Alta con teléfono local
- **GIVEN** los campos obligatorios válidos
- **WHEN** el usuario ingresa Telefono `88887777` y presiona "Guardar"
- **THEN** el cliente se crea y la API devuelve `telefono` = `88887777`

#### Scenario: Alta con teléfono con código de país
- **GIVEN** los campos obligatorios válidos
- **WHEN** el usuario ingresa Telefono `+50688887777` y presiona "Guardar"
- **THEN** el cliente se crea y la API devuelve `telefono` = `+50688887777`

#### Scenario: Alta sin teléfono
- **GIVEN** los campos obligatorios válidos
- **WHEN** el usuario deja Telefono vacío o con solo espacios y presiona "Guardar"
- **THEN** el cliente se crea con Telefono = null

#### Scenario: Teléfono con caracteres no permitidos
- **WHEN** el Telefono contiene letras, guiones, espacios, paréntesis o un `+` que no está al inicio (por ejemplo `abc12345`, `8888-7777`, `88 88 77 77`, `88887+777`) y el usuario presiona "Guardar"
- **THEN** la API responde 400 con el error en el campo `Telefono`, no se guarda el cliente y se mantiene la pantalla con los datos ingresados

#### Scenario: Teléfono con largo inválido
- **WHEN** el Telefono tiene menos de 7 dígitos o supera 15 caracteres en total (por ejemplo `123456` o `+1234567890123456`) y el usuario presiona "Guardar"
- **THEN** la API responde 400 con el error en el campo `Telefono` y no se guarda el cliente

### Requirement: Edad autocalculada
El sistema SHALL derivar Edad de FechaNacimiento, nunca capturarla manualmente ni aceptarla de la entrada, y nunca ser negativa.

#### Scenario: Cálculo al elegir fecha
- **WHEN** el usuario selecciona una FechaNacimiento
- **THEN** el campo Edad se calcula y muestra automáticamente, no editable

#### Scenario: Fecha futura
- **WHEN** FechaNacimiento es posterior a la fecha actual
- **THEN** la validación rechaza la solicitud

### Requirement: Edición de cliente
El sistema SHALL permitir editar todos los campos excepto Id, Edad, FechaIngreso y Activo, incluido Telefono, con las mismas reglas de formato que en el alta.

#### Scenario: Edición exitosa
- **WHEN** el usuario modifica campos editables válidos y presiona "Guardar"
- **THEN** se actualiza el cliente, se navega al listado y se muestra "Cliente guardado con éxito"

#### Scenario: Obligatorio vacío
- **WHEN** el usuario deja vacío un campo obligatorio y presiona "Guardar"
- **THEN** se muestra el mensaje de datos faltantes y se mantiene en la pantalla con los cambios ingresados

#### Scenario: Id y Edad no editables
- **WHEN** la pantalla de edición está cargada
- **THEN** Id y Edad permanecen no editables, y la API ignora/rechaza cualquier intento de cambiar el Id

#### Scenario: Cliente inexistente
- **WHEN** se edita o consulta un Id que no existe
- **THEN** la API responde 404

#### Scenario: Editar teléfono
- **GIVEN** un cliente existente
- **WHEN** el usuario cambia Telefono a un valor válido y presiona "Guardar"
- **THEN** se actualiza el teléfono del cliente y la API lo devuelve en la respuesta

#### Scenario: Quitar teléfono
- **GIVEN** un cliente con Telefono registrado
- **WHEN** el usuario vacía el campo Telefono y presiona "Guardar"
- **THEN** el cliente queda con Telefono = null

#### Scenario: Editar con teléfono inválido
- **WHEN** el usuario ingresa un Telefono con formato inválido y presiona "Guardar"
- **THEN** la API responde 400 con el error en el campo `Telefono` y no se actualiza el cliente

### Requirement: Confirmación al salir
El sistema SHALL pedir confirmación al presionar "Volver" solo si hay datos modificados respecto al estado inicial (vacío en Nuevo, valores originales en Edición).

#### Scenario: Volver sin cambios
- **WHEN** el usuario no ingresó ni modificó datos y presiona "Volver"
- **THEN** regresa al listado sin confirmación

#### Scenario: Volver con cambios
- **WHEN** el usuario ingresó o modificó al menos un dato y presiona "Volver"
- **THEN** se muestra "Está seguro que desea salir de la pantalla, se perderán los datos si no los guarda primero." antes de salir

### Requirement: Sin eliminación de clientes
El sistema SHALL NOT exponer eliminación de clientes; el campo Activo no es editable en este alcance.

#### Scenario: Sin endpoint de borrado
- **WHEN** se envía `DELETE /api/clientes/{id}`
- **THEN** la API responde 405 o 404 y el cliente permanece
