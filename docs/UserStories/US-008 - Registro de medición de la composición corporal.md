# US-008 — Registro de medición de la composición corporal

## Resumen Ejecutivo
Como nutricionista, quiero registrar una nueva medición de composición corporal para un cliente en cualquier momento, para hacer seguimiento de su progreso físico entre consultas.

### Campos del Catálogo de Medicion
1. Id, string de 15 caracteres (Varchar 15), no nulo, PK y FK con la table de cliente
2. Fecha Medicion, campo fecha, no nulo PK. Es una llave compuesta con el Id.
3. Peso, decimal (10,2), no nulo
4. Grasa, decimal (10,2), no nulo
5. MasaMuscular, decimal (10,2), no nulo
6. Agua, decimal (10,2), no nulo
7. GrasaVisceral, decimal (10,2), no nulo
8. IMC, decimal (10,2), no nulo

### Campos del catálogo de Tratamiento
1. Id, string de 15 caracteres (Varchar 15), no nulo, PK y FK con la table de Medición.
2. Producto, string de 50 (Varchar 50), no nulo
3. Dosis, string de 150 (Varchar 150), no nulo.

### Campos del catálogo de Plan Nutricional
1. Id, string de 15 caracteres (Varchar 15), no nulo, PK y FK con la table de Medición.
2. Fecha, campo fecha, no nulo
3. Lacteo, entero, no nulo, valor defecto 0
4. Fruta, entero, no nulo, valor defecto 0
5. Vegetales, entero, no nulo, valor defecto 0
6. Harinas, entero, no nulo, valor defecto 0
7. Grasa, entero, no nulo, valor defecto 0
8. Agua, entero, no nulo, valor defecto 0


### CRUD
Solo permite crear ya que cada vez que se crea un nuevo registro, no hay eliminar ya que esto es también el histórico de seguimiento del cliente.

## Interfaz de usuario
La pantalla se debe ingresar a través de la pantalla de listado de clientes, para lo cual se necesita agregar a esa pantalla un botón de "Nueva Medición", abrirá una nueva pantalla.
**Nueva Medición**
Mostrará 3 secciones, Datos generales, Datos Nueva Medición y seccion de acciones.
**Sección de Datos Generales**
1. Mostrará el nombre del cliente, este campo no es editable.
2. Edad, no editable.
3. Género, no editable.
4. Altura, no editable.
**Sección Nueva Medicion**
1. Tabla con los campos de Fecha (mostrará la fecha actual, sin la hora en formato dd/MM/yyyy), Peso, % Grasa, M. Muscular, % Agua, G. Visceral, IMC. Cada uno de estos campos excepto la fecha son editables.
2. Debajo de esta tabla habrá otra tabla con los mismos encabezados, pero mostrará el histórico del cliente ordenado por fecha de la más reciente a la última fecha, esta tabla cargará todos los registros, sin embargo debe mostrar los primeros 10, el resto debe existir un scroll para observar el resto de registros, el encabezado de la tabla no se debe perder al hacer scroll.
**Sección de acciones**
1. Botón de Volver, al presionarlo se regresa al lista de clientes, sin guardar los datos, pero antes de volver si se ingresaron datos debe mostrar un cuadro de confirmación al usuario donde indique "No se han guardado los cambios. ¿Desea guardarlos?", botones de Guardar, Omitir.
Si presiona Guardar, guarda en base de datos los datos, omitir descarta los datos.
2. Botón de Guardar, almacena en base de datos la información introducida en la primera tabla, debe permanecer en la misma ventana, si el usuario desea hacer una modificación la puede realizar y volver a presionar guardar, esto actualizará los cambios en la base de datos, por lo cual debe de llevar una bandera que indique si ya se habian guardado los cambios, entonces actualice.
3. Botón de Tratamiento, este abre una ventana modal con el titulo de Tratamiento, en esta mostrará:
	1. Tabla con encabezado de Producto y Dosis, esta tabla tendrá por defecto una fila editable, la fila debe mostrar un botón de un ícono de basurero que al presionarlo elimina la fila.
	2. Debajo de esta tabla un botón de cerrar y otro de Nuevo Producto.
	Al presionar nuevo producto debe agregar a la tabla de tratamiento, tabla anterior una nueva fila para agregar el producto.
	Al presionar cerrar oculta la modal.
	No se permite cerrar la tabla si falta algún dato, debe informar al usuario que "Hay tratamientos sin asignar. Debe asegurarse de que todo esté completo."
	Al presionar eliminar de la fila debe mostrar un mensaje de confirmación "¿Está seguro de eliminar éste tratamiento?" botónes sí, no, si procede a eliminar, no conserva la fila.
4. Botón Plan de nutrición
	Mostrará una tabla sin encabezados y tendrá 7 fila con 2 columnas.
	fila 1: columna 1 dirá Lácteos, columna 2 campo editable
	fila 2: columna 1 Frutas, columna 2 campo editable
	fila 3: columna 1 Vegetales, columna 2 campo editable
	fila 4: columna 1 Harinas, columna 2 campo editable
	fila 5: columna 1 Proteinas, columna 2 campo editable
	fila 6: columna 1 Grasas, columna 2 campo editable
	fila 7: columna 1 Agua, columna 2 campo editable
	
Al presionar guardar se debe verificar si todo está completo, el plan de nutrición, el tratamiento y los datos de la medición, si hace falta alguno debe informarse al usuario.
El botón guardar guarda todos los datos del plan de nutrición, el tratamiento y los datos de la medición.
	
