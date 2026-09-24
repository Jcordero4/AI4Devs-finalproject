# US-009 — Ver historial de progreso y gráficos

## Resumen Ejecutivo
Como nutricionista, quiero consultar el historial cronológico completo de las mediciones de composición corporal de un cliente, para evaluar su progreso físico y ajustar el plan con base en evidencia.

## Interfaz de usuario

En el listado de clientes se debe seleccionar el cliente y presionar el boton de historial, al presionarlo se carga una pantalla se parada en 4 secciones.
La sección superior se muestran 2 input fecha inicial y fecha final y el botón de filtrar, los tres componentes en la misma fila.
Debajo de los filtros debe poner el nombre del cliente, este no es editable y la fecha en que se está solicitando el informe, que es la fecha actual
Debajo de la seccion de filtros y nombre se muestra la sección de la Izquierda con una tabla con el historial del cliente, este tendrá la fecha, el peso, la M. Muscular, el % Grasa, el % Agua y el IMC, la tabla inicialmente se filtra vacia y se carga cuando se seleccionen los valores de las fechas.
En la sección derecha se tendrá un gráfico de líneas, este estará dibujado por el peso en el eje Y y la fecha en el eje X, cada nodo al poner el mouse debe mostrar un tooltip con el peso, el gráfico debe mostrar una cuadrícula muy sutil de color gris para ayudar al usuario a interpretar la gráfica.
Sección de acciones, esta sección se ubica debajo de las dos secciones de tabla de datos y gráfica, se deben mostrar los botones de volver y imprimir a PDF, al presionar volver vuelve al listado de clientes, al presionar PDF genera un PDF con los datos de la pantalla.




