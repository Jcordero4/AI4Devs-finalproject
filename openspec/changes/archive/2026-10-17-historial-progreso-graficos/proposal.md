## Why

La US-009 (`docs/US-009-Historial-Progreso-Graficos.md`, `docs/UserStories/US-009 - Ver historial de progreso y gráficos.md`; PRD US-009) pide que el nutricionista consulte el historial cronológico de mediciones de un cliente en tabla y gráfico de líneas, para evaluar su progreso y ajustar el plan con evidencia. US-008 ya registra las mediciones y expone el histórico completo, pero no existe la pantalla de consulta, no hay filtro por rango de fechas (`desde`/`hasta` están documentados en `docs/API-Controllers.md` pero no implementados) y el listado de clientes no tiene botón "Historial".

## What Changes

- Nueva pantalla de solo lectura **Historial** en `/clientes/{id}/historial`, con cuatro secciones: Filtros (Fecha Inicial, Fecha Final, "Filtrar"), Datos Generales (Nombre del cliente y Fecha del informe, no editables), Historial (tabla a la izquierda y gráfico a la derecha) y Acciones ("Volver", "Imprimir a PDF").
- Tabla con Fecha, Peso, M. Muscular, % Grasa, % Agua e IMC; tabla y gráfico se muestran vacíos al entrar y se cargan solo al presionar "Filtrar" con un rango válido (Fecha Inicial ≤ Fecha Final).
- Gráfico de líneas con Peso en el eje Y y Fecha en el eje X, cuadrícula gris sutil y tooltip con el peso en cada nodo. Se dibuja con **SVG propio** en React, sin librería de gráficos.
- "Imprimir a PDF" **descarga un archivo PDF** generado en el navegador con `jsPDF` y `jspdf-autotable` (carga diferida al presionar el botón), con nombre del cliente, fecha del informe, tabla y gráfico; el gráfico se dibuja en vector con las mismas escalas del gráfico en pantalla.
- El listado de clientes agrega el botón **"Historial"**, que exige un cliente seleccionado.
- La API `GET /api/clientes/{clienteId}/mediciones` admite los parámetros opcionales `desde` y `hasta` (`yyyy-MM-dd`, inclusivos) y responde 400 si `desde` es posterior a `hasta`. Sin parámetros, el comportamiento actual no cambia.
- Se agregan las dependencias `jspdf` y `jspdf-autotable` al frontend (aprobadas por el usuario).
- Se actualiza `docs/API-Controllers.md` (se elimina la nota de discrepancia), `docs/estandarUI-UX.md` y `readme.md` (stack del frontend).

## Capabilities

### New Capabilities

- `historial-progreso-cliente`: pantalla de consulta de historial con filtro por rango de fechas, tabla, gráfico de peso, y acciones Volver e Imprimir a PDF.

### Modified Capabilities

- `medicion-composicion-corporal`: el requisito "Histórico de mediciones del cliente" agrega el filtro opcional por rango `desde`/`hasta` en la consulta de la API.
- `gestion-cliente`: la selección de fila y navegación del listado agrega el botón "Historial".

## Impact

- **Application**: `ServicioMedicion.ListarAsync` y `IRepositorioMedicion.ListarAsync` reciben `desde`/`hasta` opcionales; validación del rango.
- **Infrastructure**: `RepositorioMedicion.ListarAsync` filtra con `Where` parametrizado (sin SQL crudo). Sin migraciones ni cambios de modelo.
- **API**: `MedicionController.Listar` con los query params nuevos; cambio aditivo y compatible.
- **Web**: nuevos `HistorialCliente.tsx` y `GraficoPeso.tsx`, ruta en `App.tsx`, `medicionService.ts` (filtros), generador del PDF (`generarPdfHistorial`), `package.json` y botón en `ListadoClientes.tsx`. UI delegada a `frontend-designer`.
- **Tests**: xUnit unitarios e integración del filtro y su validación.
- **Docs**: `docs/API-Controllers.md`, `docs/estandarUI-UX.md`, `readme.md` §1.4.
- Dependencias nuevas en `Web/`: `jspdf` y `jspdf-autotable` (MIT), cargadas bajo demanda para no aumentar el bundle inicial. El backend no cambia de dependencias.

## Fuera de alcance

- Crear, editar o eliminar mediciones desde esta pantalla (pertenece a US-008).
- Exportación en formatos distintos a PDF.
- Gráfico de líneas múltiples (% músculo, % grasa) y PDF con datos personales o plan nutricional activo, que menciona el PRD pero no el US-009 detallado.
- Impresión desde el navegador (`window.print()`) y estilos de impresión.
- PDF generado en el servidor.
- Paginación del historial.
- Autenticación y roles (fuera del MVP, README §2.3).
