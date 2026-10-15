# US-004 — Registrar un nuevo cliente

## Resumen Ejecutivo
Como nutricionista, quiero registrar un nuevo cliente con sus datos personales y de contacto completos, para tener un perfil de cliente completo y consultable desde la primera visita.

## Nota Aclaratoria
Esta definición del US-004 contiene la implementación de los US-005, US-006 y US-007.

## Campos del Catálogo
1. Id, string de 15 caracteres (Varchar 15), no nulo, PK, (representa la cédula, pasaporte)
2. Nombre, string de 50 caracteres (Varchar 50), no nulo, crear un indice para agilizar las busquedas
3. Fecha de nacimiento, fecha, no nulo
4. Edad, entero, no nulo, autocalculado, apartir de la fecha de nacimiento
5. Genero, caracter (char 'M'|'F'), no nulo, donde M= Masculino, F = Femenino, basico para el calculo de los valores de composicion corporal y plan nutricional
6. Altura, entero, no nulo, representado en centímetros
7. Telefono, string de 15 caracteres (Varchar 15), acepta nulos. Si se ingresa, solo dígitos con un símbolo + inicial opcional (código de país); sin letras, guiones ni espacios; mínimo 7 dígitos y máximo 15 caracteres en total
8. Email, string 320 (varchar de 320), acepta nulos
9. Fecha de Ingreso, campo de fecha, no nulo, el sistema tomará la fecha actual
10. Activo

## CRUD
Permite crear y editar, no hay eliminar clientes, solo desactivarlos

## Interfaz de usuario

### Pantalla de Listado
Debe terner:
1. Titulo del Listado
2. La pantalla tiene 2 secciones la de filtros y la del listado de clientes
**Seccion de Filtros**
1. Filtro por nombre, es un input donde se escribe el texto a buscar y se presiona filtrar para ejecutar la busqueda.
2. Filtro por Id, es un input donde se escribe el Id a buscar y se presiona filtrar para ejecutar la busqueda.
3. Botón de Filtar
Estos filtros y el botón deben mostrarse en la misma fila.
**Seccion de Listado**
1. Tabla con las columnas de seleccion única, esta no tiene encabezado, Id, Nombre, telefono, Email, checkbox no editable que indica si el cliente está activo o no.
2. Paginado, el tamaño de página será de 25 por defecto en el sistema
3. Botón para nuevo
4. Botón editar

### Pantalla de nuevo
Debe tener:
1. Titulo del Listado
2. Seccion tipo Card donde se incluirá el Id, Nombre, Fecha de Nacimiento, la Edad (No editable se auto calcula con la fecha de nacimiento), Genero (lista desplegable con la opción de Masculino y Femenino, por default está en blanco sin seleccionar), altura, teléfono (opcional), email y checkbox de activo que por defecto está marcado y no es editable.
3. Fuera del card agregar los botones de Volver y Guardar, agregar un icono al botón.
4. El campo de fecha de nacimiento debe usar el selector de fecha nativo del navegador (`<input type="date">`)

### Pantalla de edición
Es el mismo layout que la pantalla de nuevo, solo que debe permitir la edición de todos los campos excepto el de edad.

### Acciones de la UI
**Pantalla de Listado**
1. Debe permitir la selección única de un item del listado, al seleccionarlo se debe marcar el componente de seleccion única y marcar la fila de color, la seleccion debe permitirse al hacer clic en cualquier parte de la fila.
2. Si se presiona el botón de nuevo, carga la pantalla de Nuevo.
3. Si se presiona el botón de editar, debe verificar primero que hay un cliente seleccionado, si no mostrar un mensaje donde indique "Debe seleccionar el cliente a editar."
4. Si el cliente está seleccionado y presiona editar muestra la pantalla de edición cargando los datos correspondientes al cliente seleccionado.
5. El listado de clientes se debe cargar ordenado por nombre.

**Pantalla de Nuevo**
1. Si se presiona el botón de Guardar debe verificarse que todos los campos obligatorios tengan información, si no mostrar un mensaje indicando al usuario que faltan datos por completar y se mantiene en la pantalla de nuevo sin perder ningun dato, de lo contrario procede a guardar los datos, se carga la pantalla de listado y se muestra el mensaje de "Cliente guardado con exito", debe mostrar el nuevo cliente agregado en el listado actual.
2. Si se presiona volver, no se almacena ningun dato y se regresa a la pantalla de listado, debe evaluar si el usuario ya introdujo algún dato como el nombre o el ID, si ya se introdujo debe mostrar un mensaje que diga "Está seguro que desea salir de la pantalla, se perderan los datos si no los guarda primero.", esto es un mensaje de confirmación.

**Pantalla de Edición**
Funciona de la misma forma que la de Nuevo solo que la función es de update de los datos. En el caso del botón de volver lo que debe evaluar es si realizó algún cambio a los datos originales para mostrar el mensaje.
