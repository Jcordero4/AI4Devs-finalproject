## ADDED Requirements

### Requirement: Acceso y datos generales de Nueva Medición
El sistema SHALL abrir la pantalla de Nueva Medición para el cliente seleccionado en el listado, mostrando Nombre, Edad, Género y Altura del cliente precargados y no editables.

#### Scenario: Apertura de la pantalla
- **GIVEN** el usuario está en el listado de clientes con un cliente seleccionado
- **WHEN** presiona "Nueva Medición"
- **THEN** se abre la pantalla de Nueva Medición con Nombre, Edad, Género y Altura del cliente precargados y no editables

#### Scenario: Cliente inexistente
- **GIVEN** se solicita la pantalla o la API para un clienteId que no existe
- **WHEN** se consultan o crean mediciones de ese cliente
- **THEN** la API responde 404 y la pantalla informa que el cliente no existe

### Requirement: Registro de medición
El sistema SHALL registrar una medición con FechaMedicion igual a la fecha actual (sin hora, formato `dd/MM/yyyy`, no editable) y los campos obligatorios Peso, % Grasa, Masa Muscular, % Agua, Grasa Visceral e IMC, todos valores positivos con precisión Decimal(10,2). La clave de la medición SHALL ser compuesta por el Id del cliente y la FechaMedicion.

#### Scenario: Guardado exitoso
- **GIVEN** el usuario completó Peso, % Grasa, M. Muscular, % Agua, G. Visceral e IMC, además del tratamiento y el plan de nutrición
- **WHEN** presiona "Guardar"
- **THEN** se crea la medición con la fecha actual, la pantalla permanece abierta y la bandera "ya guardado" queda activa para ese registro

#### Scenario: Campo obligatorio faltante
- **GIVEN** falta algún campo de la tabla de nueva medición
- **WHEN** el usuario presiona "Guardar"
- **THEN** se muestra un mensaje con los datos faltantes y no se guarda ningún registro

#### Scenario: Valor no positivo
- **GIVEN** Peso, % Grasa, M. Muscular, % Agua, G. Visceral o IMC es 0 o negativo
- **WHEN** se envía la solicitud
- **THEN** la validación rechaza la solicitud con 400 y no se guarda nada

#### Scenario: Fecha no editable
- **GIVEN** la pantalla de Nueva Medición está abierta
- **WHEN** el usuario intenta modificar la Fecha
- **THEN** el campo permanece no editable y la API ignora cualquier fecha enviada distinta de la actual en el alta

### Requirement: Actualización de la medición del día durante la sesión
El sistema SHALL actualizar la misma medición, en lugar de crear una nueva, cuando el usuario vuelve a presionar "Guardar" en la misma sesión de captura (bandera interna "ya guardado" activa). Una vez fuera de la pantalla, la medición SHALL pasar al histórico y no ser editable desde este alcance.

#### Scenario: Re-guardado en la misma sesión
- **GIVEN** la medición actual ya fue guardada y la bandera está activa
- **WHEN** el usuario modifica algún valor y presiona "Guardar"
- **THEN** se actualiza el mismo registro (PUT) y no se crea uno nuevo

#### Scenario: Medición ya existente para la fecha
- **GIVEN** ya existe una medición del cliente con la fecha actual y la pantalla no tiene la bandera activa
- **WHEN** se intenta crear otra medición mediante POST
- **THEN** la API responde 409 y no se modifica el registro existente

#### Scenario: Medición histórica no editable
- **GIVEN** existe una medición de una fecha anterior a la actual
- **WHEN** se intenta actualizarla mediante PUT
- **THEN** la API rechaza la solicitud y el registro permanece sin cambios

### Requirement: Histórico de mediciones del cliente
El sistema SHALL mostrar el histórico de mediciones del cliente con las mismas columnas de captura (Fecha, Peso, % Grasa, M. Muscular, % Agua, G. Visceral, IMC), ordenado de la fecha más reciente a la más antigua, cargando todos los registros pero mostrando 10 visibles, con scroll para el resto y encabezado fijo durante el scroll.

#### Scenario: Histórico con más de 10 registros
- **GIVEN** el cliente tiene más de 10 mediciones
- **WHEN** se abre la pantalla de Nueva Medición
- **THEN** la tabla de histórico lista todas ordenadas de la más reciente a la más antigua, muestra 10 filas visibles, permite scroll para ver el resto y mantiene el encabezado fijo

#### Scenario: Cliente sin mediciones
- **GIVEN** el cliente no tiene mediciones previas
- **WHEN** se abre la pantalla de Nueva Medición
- **THEN** la tabla de histórico se muestra vacía con un mensaje de sin resultados

#### Scenario: Consulta del detalle
- **GIVEN** existe una medición del cliente en una fecha dada
- **WHEN** se consulta `GET /api/clientes/{clienteId}/mediciones/{fecha}`
- **THEN** la API responde 200 con la medición, sus tratamientos y su plan nutricional; si no existe, responde 404

### Requirement: Tratamiento de la medición
El sistema SHALL permitir capturar cero o más filas de tratamiento (Producto hasta 50 caracteres, Dosis hasta 150 caracteres, ambos obligatorios) en un modal "Tratamiento". Cada fila SHALL almacenarse con una Secuencia entera autoincremental por medición, asociada al mismo Id de la medición.

#### Scenario: Agregar producto
- **GIVEN** el modal de Tratamiento está abierto
- **WHEN** el usuario presiona "Nuevo Producto"
- **THEN** se agrega una nueva fila editable; por defecto el modal muestra una fila editable

#### Scenario: Cerrar con filas incompletas
- **GIVEN** hay filas de tratamiento con Producto o Dosis vacíos
- **WHEN** el usuario presiona "Cerrar"
- **THEN** se muestra "Hay tratamientos sin asignar. Debe asegurarse de que todo esté completo." y el modal permanece abierto

#### Scenario: Cerrar con filas completas
- **GIVEN** todas las filas de tratamiento están completas
- **WHEN** el usuario presiona "Cerrar"
- **THEN** el modal se oculta conservando las filas capturadas

#### Scenario: Eliminar fila confirmada
- **GIVEN** el usuario presiona el ícono de eliminar de una fila
- **WHEN** confirma con "Sí" en "¿Está seguro de eliminar éste tratamiento?"
- **THEN** la fila se elimina de la tabla

#### Scenario: Eliminar fila cancelada
- **GIVEN** el usuario presiona el ícono de eliminar de una fila
- **WHEN** elige "No"
- **THEN** la fila se conserva sin cambios

#### Scenario: Múltiples tratamientos
- **GIVEN** el usuario capturó más de un producto
- **WHEN** se guarda la medición
- **THEN** cada fila se almacena con su propia Secuencia asociada al mismo Id de medición, sin sobrescribir las demás

### Requirement: Plan de Nutrición de la medición
El sistema SHALL capturar el plan de nutrición de la medición en una tabla sin encabezados de 7 filas fijas (Lácteos, Frutas, Vegetales, Harinas, Proteínas, Grasas, Agua) con categoría no editable y valor entero editable, valor por defecto 0. El plan SHALL tener relación 1:1 con la medición y almacenar Id, Fecha (igual a FechaMedicion), Lacteo, Fruta, Vegetales, Harinas, Proteina, Grasa y Agua.

#### Scenario: Visualización de categorías
- **GIVEN** el usuario presiona "Plan de Nutrición"
- **WHEN** se muestra la tabla
- **THEN** aparecen las 7 categorías fijas con su valor editable (por defecto 0)

#### Scenario: Almacenamiento completo
- **GIVEN** el usuario completó las 7 categorías
- **WHEN** se guarda la medición
- **THEN** se almacenan los 9 campos del catálogo, incluyendo Proteina, con Fecha igual a la FechaMedicion

#### Scenario: Valor inválido
- **GIVEN** un valor del plan de nutrición no es un entero mayor o igual a 0
- **WHEN** el usuario presiona "Guardar"
- **THEN** se informa que el plan de nutrición es inválido y no se guarda ningún bloque

### Requirement: Guardado conjunto de medición, tratamiento y plan
El sistema SHALL validar que los tres bloques (medición, tratamiento y plan de nutrición) estén completos antes de guardar, y SHALL persistirlos juntos de forma atómica en una sola operación; si falla uno, no se guarda ninguno.

#### Scenario: Los tres bloques completos
- **GIVEN** medición, tratamiento y plan de nutrición están completos
- **WHEN** el usuario presiona "Guardar"
- **THEN** se guardan en conjunto los tres bloques en una única transacción

#### Scenario: Bloque incompleto
- **GIVEN** falta algún dato en la medición, el tratamiento o el plan de nutrición
- **WHEN** el usuario presiona "Guardar"
- **THEN** se informa qué bloque está incompleto y no se guarda ninguno de los tres

#### Scenario: Fallo de persistencia
- **GIVEN** ocurre un error al guardar uno de los bloques
- **WHEN** se ejecuta el guardado conjunto
- **THEN** se revierte la transacción y no queda ningún bloque guardado

### Requirement: Confirmación al salir de Nueva Medición
El sistema SHALL pedir confirmación al presionar "Volver" solo si hay datos ingresados o modificados sin guardar, ofreciendo "Guardar" y "Omitir".

#### Scenario: Volver sin cambios
- **GIVEN** el usuario no ingresó ni modificó ningún dato
- **WHEN** presiona "Volver"
- **THEN** regresa al listado de clientes sin confirmación

#### Scenario: Volver con cambios sin guardar
- **GIVEN** el usuario ingresó o modificó datos sin guardar
- **WHEN** presiona "Volver"
- **THEN** se muestra "No se han guardado los cambios. ¿Desea guardarlos?" con las opciones "Guardar" y "Omitir"

#### Scenario: Elegir Guardar al salir
- **GIVEN** se muestra la confirmación de salida
- **WHEN** el usuario elige "Guardar"
- **THEN** se valida y almacena la información y luego se navega al listado; si la validación falla, se informa y el usuario permanece en la pantalla

#### Scenario: Elegir Omitir al salir
- **GIVEN** se muestra la confirmación de salida
- **WHEN** el usuario elige "Omitir"
- **THEN** se descartan los datos ingresados y se navega al listado de clientes

### Requirement: Sin eliminación de mediciones
El sistema SHALL NOT exponer eliminación de mediciones.

#### Scenario: Sin endpoint de borrado
- **GIVEN** existe una medición
- **WHEN** se envía `DELETE /api/clientes/{clienteId}/mediciones/{fecha}`
- **THEN** la API responde 405 o 404 y la medición permanece
