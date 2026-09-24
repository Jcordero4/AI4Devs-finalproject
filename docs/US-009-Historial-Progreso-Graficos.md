# US-009 — Ver Historial de Progreso y Gráficos

## Resumen Ejecutivo
Como nutricionista, quiero consultar el historial cronológico completo de las mediciones de composición corporal de un cliente, para evaluar su progreso físico y ajustar el plan con base en evidencia.

## Datos Utilizados
Esta pantalla es de solo consulta y reutiliza los campos del **Catálogo de Medición** definido en US-008: Fecha (FechaMedicion), Peso, MasaMuscular, Grasa, Agua e IMC. No define campos ni tablas nuevas.

## CRUD
Solo lectura (consulta). No permite crear, editar ni eliminar mediciones desde esta pantalla; esas operaciones pertenecen a US-008.

## Interfaz de Usuario

### Acceso
Desde el listado de clientes, se selecciona un cliente y se presiona el botón "Historial", lo que carga la pantalla de Historial dividida en 4 secciones: Filtros, Datos Generales, Historial (Tabla y Gráfico), y Acciones.

### Sección de Filtros
Ubicada en la parte superior, con 3 componentes en la misma fila:
1. Input de Fecha Inicial.
2. Input de Fecha Final.
3. Botón "Filtrar", que ejecuta la búsqueda con el rango de fechas ingresado.

### Sección de Datos Generales
Debajo de los filtros:
1. Nombre del cliente — no editable.
2. Fecha del informe — fecha actual del momento en que se solicita, no editable.

### Sección de Historial (Tabla y Gráfico)
Debajo de la sección de filtros y datos generales, dividida en dos columnas:

**Columna izquierda — Tabla**
- Columnas: Fecha, Peso, M. Muscular, % Grasa, % Agua, IMC.
- Se muestra vacía al ingresar a la pantalla; se carga únicamente al presionar "Filtrar" con un rango de fechas válido.

**Columna derecha — Gráfico**
- Gráfico de líneas con Peso en el eje Y y Fecha en el eje X, usando el mismo conjunto de datos filtrado que la tabla.
- Cada nodo muestra un tooltip con el valor del peso al pasar el mouse sobre él.
- Incluye una cuadrícula sutil de color gris para facilitar la interpretación de la gráfica.
- Se muestra vacío al ingresar a la pantalla, igual que la tabla, y se carga junto con ella al filtrar.

### Sección de Acciones
Ubicada debajo de las secciones de tabla y gráfico:
1. **Botón Volver**: regresa al listado de clientes.
2. **Botón Imprimir a PDF**: genera un PDF con el contenido actual de la pantalla (nombre del cliente, fecha del informe, tabla de historial y gráfico).

## Criterios de Aceptación

### Acceso a la pantalla
- **GIVEN** el usuario está en el listado de clientes **WHEN** selecciona un cliente y presiona "Historial" **THEN** se abre la pantalla de Historial con el Nombre del cliente y la Fecha del informe (fecha actual) precargados y no editables, y la tabla y el gráfico se muestran vacíos.

### Filtro por rango de fechas
- **GIVEN** el usuario ingresó una Fecha Inicial y una Fecha Final válidas (Fecha Inicial anterior o igual a Fecha Final) **WHEN** presiona "Filtrar" **THEN** la tabla y el gráfico se cargan con las mediciones del cliente cuya Fecha esté dentro del rango indicado.
- **GIVEN** la Fecha Inicial ingresada es posterior a la Fecha Final **WHEN** el usuario presiona "Filtrar" **THEN** se muestra un mensaje indicando que el rango de fechas es inválido y no se cargan datos.
- **GIVEN** no existen mediciones del cliente dentro del rango de fechas ingresado **WHEN** el usuario presiona "Filtrar" **THEN** la tabla y el gráfico permanecen vacíos, indicando que no hay datos para ese rango.

### Gráfico
- **GIVEN** el gráfico tiene datos cargados **WHEN** el usuario posiciona el mouse sobre un nodo **THEN** se muestra un tooltip con el valor de Peso correspondiente a esa fecha.

### Acciones
- **GIVEN** el usuario está en la pantalla de Historial **WHEN** presiona "Volver" **THEN** regresa al listado de clientes.
- **GIVEN** la tabla y el gráfico tienen datos cargados **WHEN** el usuario presiona "Imprimir a PDF" **THEN** se genera un PDF con el nombre del cliente, la fecha del informe, la tabla de historial y el gráfico tal como se muestran en pantalla.

## Fuera de Alcance
- Edición o eliminación de mediciones desde esta pantalla (ver US-008).
- Exportación en formatos distintos a PDF.
