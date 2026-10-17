# historial-progreso-cliente Specification

## Purpose
Pantalla de consulta del historial de mediciones de un cliente: filtro por rango de fechas, tabla de historial, gráfico de peso y descarga de un informe en PDF.

## Requirements

### Requirement: Acceso a la pantalla de Historial
El sistema SHALL abrir la pantalla de Historial del cliente seleccionado desde el listado de clientes, mostrando Nombre del cliente y Fecha del informe precargados y no editables, con la tabla y el gráfico vacíos.

#### Scenario: Acceso con cliente seleccionado
- **GIVEN** el usuario está en el listado de clientes con un cliente seleccionado
- **WHEN** presiona "Historial"
- **THEN** se abre `/clientes/{id}/historial` con el Nombre del cliente y la Fecha del informe (fecha actual) no editables, y la tabla y el gráfico vacíos sin haber consultado mediciones

#### Scenario: Cliente inexistente
- **WHEN** se abre el historial de un Id de cliente que no existe
- **THEN** se muestra el error de cliente no encontrado y la opción "Volver" al listado

### Requirement: Filtro por rango de fechas
El sistema SHALL ofrecer los campos Fecha Inicial y Fecha Final y el botón "Filtrar" en la misma fila, y SHALL cargar la tabla y el gráfico únicamente al presionar "Filtrar" con un rango válido (Fecha Inicial anterior o igual a Fecha Final), con las mediciones del cliente cuya fecha esté dentro del rango, ambos extremos incluidos.

#### Scenario: Rango válido con datos
- **GIVEN** el cliente tiene mediciones dentro del rango ingresado
- **WHEN** el usuario ingresa Fecha Inicial y Fecha Final válidas y presiona "Filtrar"
- **THEN** la tabla y el gráfico se cargan con esas mediciones y no se muestran mediciones fuera del rango

#### Scenario: Fecha Inicial posterior a Fecha Final
- **WHEN** la Fecha Inicial es posterior a la Fecha Final y el usuario presiona "Filtrar"
- **THEN** se muestra un mensaje indicando que el rango de fechas es inválido y no se cargan datos

#### Scenario: Fechas sin ingresar
- **WHEN** falta la Fecha Inicial o la Fecha Final y el usuario presiona "Filtrar"
- **THEN** se muestra un mensaje pidiendo ingresar ambas fechas y no se consultan datos

#### Scenario: Rango sin mediciones
- **GIVEN** el cliente no tiene mediciones dentro del rango ingresado
- **WHEN** el usuario presiona "Filtrar"
- **THEN** la tabla y el gráfico permanecen vacíos y se indica que no hay datos para ese rango

#### Scenario: Nuevo filtro reemplaza el anterior
- **GIVEN** ya hay datos cargados de un filtro previo
- **WHEN** el usuario cambia el rango y presiona "Filtrar" con un rango válido
- **THEN** la tabla y el gráfico se actualizan con el nuevo rango

### Requirement: Tabla de historial
El sistema SHALL mostrar en la columna izquierda una tabla de solo lectura con las columnas Fecha, Peso, M. Muscular, % Grasa, % Agua e IMC, ordenada de la fecha más reciente a la más antigua, que se muestra vacía hasta que se ejecute un filtro válido.

#### Scenario: Tabla inicial vacía
- **WHEN** el usuario abre la pantalla de Historial
- **THEN** la tabla se muestra vacía con sus encabezados

#### Scenario: Tabla cargada
- **GIVEN** el filtro devolvió mediciones
- **WHEN** se carga la tabla
- **THEN** cada fila muestra Fecha, Peso, M. Muscular, % Grasa, % Agua e IMC de una medición, ordenadas de la más reciente a la más antigua

### Requirement: Gráfico de peso
El sistema SHALL mostrar en la columna derecha un gráfico de líneas con Peso en el eje Y y Fecha en el eje X, con el mismo conjunto de datos filtrado que la tabla, ordenado cronológicamente, con una cuadrícula sutil de color gris y un nodo por medición que muestra un tooltip con el valor de Peso. El gráfico SHALL mostrarse vacío hasta que se ejecute un filtro válido y SHALL dibujarse sin librerías externas de gráficos.

#### Scenario: Gráfico inicial vacío
- **WHEN** el usuario abre la pantalla de Historial
- **THEN** el gráfico se muestra vacío

#### Scenario: Tooltip en un nodo
- **GIVEN** el gráfico tiene datos cargados
- **WHEN** el usuario posiciona el mouse sobre un nodo
- **THEN** se muestra un tooltip con el valor de Peso correspondiente a esa fecha

#### Scenario: Tooltip por teclado
- **GIVEN** el gráfico tiene datos cargados
- **WHEN** el usuario enfoca un nodo con el teclado
- **THEN** se muestra el mismo tooltip con la fecha y el Peso de esa medición

#### Scenario: Una sola medición
- **GIVEN** el filtro devolvió una única medición
- **WHEN** se carga el gráfico
- **THEN** se dibuja un único nodo con su tooltip, sin línea

#### Scenario: Orden cronológico
- **GIVEN** el filtro devolvió varias mediciones
- **WHEN** se dibuja el gráfico
- **THEN** los puntos se unen de la fecha más antigua (izquierda) a la más reciente (derecha)

### Requirement: Acciones de la pantalla de Historial
El sistema SHALL ofrecer los botones "Volver" e "Imprimir a PDF" debajo de la tabla y el gráfico. "Volver" SHALL regresar al listado de clientes. "Imprimir a PDF" SHALL estar disponible solo con datos cargados y SHALL descargar un archivo PDF generado en el navegador con el nombre del cliente, la fecha del informe, la tabla de historial y el gráfico de peso.

#### Scenario: Volver
- **WHEN** el usuario presiona "Volver"
- **THEN** regresa al listado de clientes

#### Scenario: Imprimir a PDF con datos
- **GIVEN** la tabla y el gráfico tienen datos cargados
- **WHEN** el usuario presiona "Imprimir a PDF"
- **THEN** se descarga un archivo `.pdf` que contiene el nombre del cliente, la fecha del informe, el rango consultado, todas las filas de la tabla y el gráfico de peso con los mismos datos que se muestran en pantalla

#### Scenario: PDF con muchas mediciones
- **GIVEN** el filtro devolvió más filas de las que caben en una página
- **WHEN** el usuario presiona "Imprimir a PDF"
- **THEN** el PDF continúa la tabla en las páginas siguientes repitiendo el encabezado de columnas

#### Scenario: Imprimir a PDF sin datos
- **GIVEN** la tabla y el gráfico están vacíos
- **WHEN** el usuario observa la sección de acciones
- **THEN** el botón "Imprimir a PDF" está deshabilitado

#### Scenario: Error al generar el PDF
- **GIVEN** la tabla y el gráfico tienen datos cargados
- **WHEN** falla la generación del archivo
- **THEN** se muestra un mensaje de error, el botón vuelve a habilitarse y los datos en pantalla no se pierden

### Requirement: Pantalla de solo consulta
El sistema SHALL NOT permitir crear, editar ni eliminar mediciones desde la pantalla de Historial.

#### Scenario: Sin acciones de modificación
- **WHEN** el usuario está en la pantalla de Historial
- **THEN** no se muestran controles para crear, editar ni eliminar mediciones y la pantalla solo consulta la API
