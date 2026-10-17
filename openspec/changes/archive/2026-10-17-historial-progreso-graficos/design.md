## Context

US-008 ya registra mediciones y la API expone `GET /api/clientes/{clienteId}/mediciones` con el histórico completo ordenado de más reciente a más antigua (`MedicionController.Listar` → `ServicioMedicion.ListarAsync` → `IRepositorioMedicion.ListarAsync(clienteId)`). `MedicionResumenDto` ya trae Fecha, Peso, Grasa, MasaMuscular, Agua e IMC, justo lo que pide la tabla de US-009. Los parámetros `desde`/`hasta` figuran en `docs/API-Controllers.md` pero no están implementados. El frontend (`Web/`) no tiene librería de gráficos ni de PDF. El estándar (`docs/estandarUI-UX.md`) y la ficha de diseño prohíben agregar librerías visuales sin aprobación; el usuario aprobó `jspdf` y `jspdf-autotable` para generar el PDF.

Restricciones: N-tier (`API` → `Application` → `Domain`; `Infrastructure` → `Application`); consultas parametrizadas, sin SQL crudo; validación en `Application`; nombres en español; sin autenticación (fuera del MVP).

## Goals / Non-Goals

**Goals:**
- Pantalla de consulta del historial de un cliente con filtro por rango de fechas, tabla y gráfico de Peso.
- Filtrar en el servidor con `desde`/`hasta` opcionales, sin romper a los consumidores actuales (histórico de `NuevaMedicion`).
- Gráfico sin librería (SVG propio) y PDF con una única pareja de dependencias (`jspdf` + `jspdf-autotable`), cargada bajo demanda.
- Accesibilidad: gráfico con alternativa textual (la tabla) y nodos operables con teclado.

**Non-Goals:**
- Editar o eliminar mediciones, otros formatos de exportación, gráfico de varias métricas, paginación.
- Generar el PDF en el servidor o con captura de pantalla (`html2canvas`).
- Encabezado del PDF con datos personales o plan activo (PRD), que el US-009 detallado no pide.

## Decisions

1. **Filtro en el servidor con `desde` y `hasta` opcionales.** `GET /api/clientes/{clienteId}/mediciones?desde=yyyy-MM-dd&hasta=yyyy-MM-dd`; ambos inclusivos e independientes (se puede enviar solo uno). `MedicionController.Listar` recibe `DateOnly? desde, DateOnly? hasta`, y `ServicioMedicion.ListarAsync` y `IRepositorioMedicion.ListarAsync` los reciben como parámetros opcionales (valor por defecto `null`), de modo que `NuevaMedicion` y los tests actuales siguen funcionando. `RepositorioMedicion` agrega `Where` condicionales sobre `FechaMedicion` (LINQ parametrizado, sin SQL crudo). Alternativa descartada: traer todo y filtrar en el cliente; el US pide cargar "con el rango", el contrato documentado ya prevé los parámetros y el histórico puede crecer.

2. **Validación del rango en `ServicioMedicion`.** Si `desde` > `hasta`, se lanza `ValidationException` (FluentValidation) con el mensaje "La fecha inicial no puede ser posterior a la fecha final.", que el `ManejoErroresMiddleware` ya traduce a 400 `ValidationProblemDetails`. Cliente inexistente sigue siendo 404 (se valida antes que el rango). Una fecha con formato inválido la rechaza el binding de ASP.NET (400). No hay límite de rango máximo.

3. **Orden de respuesta y de pantalla.** La API conserva el orden de más reciente a más antigua. La tabla del historial muestra ese orden (coincide con el PRD: "del más reciente al más antiguo por defecto"). El gráfico ordena una copia en el cliente de forma ascendente por fecha, porque el eje X es cronológico.

4. **Ruta y navegación.** `/clientes/:id/historial` dentro de `LayoutApp`, componente `HistorialCliente.tsx`. `ListadoClientes` agrega el botón "Historial" junto a Editar y Nueva Medición, con la misma regla de selección (sin selección, aviso y sin navegar). El nombre del cliente se obtiene con `clienteService` (`GET /api/clientes/{id}`); si el cliente no existe, se muestra el error y "Volver".

5. **Carga solo al filtrar.** Al abrir, tabla y gráfico están vacíos y no se llama a `GET .../mediciones`. "Filtrar" valida en cliente que ambas fechas estén ingresadas y `desde` ≤ `hasta`; si no, muestra el mensaje y no consulta. Si ambas fechas faltan, se pide ingresarlas (el US solo habla de "valores de las fechas"). Se muestra un mensaje de "sin datos para ese rango" si el resultado está vacío. Las fechas se manejan siempre como cadenas `yyyy-MM-dd` (sin `Date`) para evitar corrimientos por huso horario con `DateOnly`; la fecha del informe es la fecha local actual formateada `dd/MM/yyyy`.

6. **Gráfico: SVG propio (`GraficoPeso.tsx`).** Componente puro que recibe `{ fecha, peso }[]` y dibuja con `<svg viewBox>` responsivo: eje X con fechas, eje Y con rango de peso con margen, cuadrícula horizontal gris sutil (tokens de `index.css`), polilínea y un `<circle>` por nodo. Escala X por posición proporcional al tiempo (diferencia en días calculada sobre las cadenas con `Date.UTC`) o por índice si todas las fechas coinciden; con un solo punto, se dibuja un nodo centrado sin línea. Tooltip: `<title>` nativo en cada nodo (visible al pasar el mouse) más un tooltip propio con "Fecha: Peso kg" para dar control de estilo y soporte de foco (nodos con `tabIndex=0`, se muestra en `focus` y `mouseenter`). `role="img"` con `aria-label` descriptivo; la tabla es la alternativa accesible. Alternativa descartada: Chart.js/Recharts (nueva dependencia, canvas como imagen en el PDF, el estándar prohíbe librerías visuales).

7. **PDF descargable con `jsPDF` + `jspdf-autotable`.** "Imprimir a PDF" llama a una función `generarPdfHistorial` (`Web/src/utils/generarPdfHistorial.ts`) que importa las librerías con `import()` dinámico al presionar el botón, de modo que no pesan en el bundle inicial, y descarga el archivo con `doc.save(...)` (nombre `historial-{clienteId}-{yyyy-MM-dd}.pdf`). Contenido: título, Nombre del cliente, Fecha del informe, rango consultado, tabla (Fecha, Peso, M. Muscular, % Grasa, % Agua, IMC) con `autoTable` (salto de página automático y encabezado repetido) y el gráfico de peso. El gráfico se dibuja con las primitivas de jsPDF (líneas, círculos y texto) reutilizando la misma función pura de escalas de `historialProgreso.ts` que usa `GraficoPeso`, de modo que queda en vector y coincide con la pantalla; no se usa `html2canvas` ni captura de pantalla. Se usan las fuentes estándar de jsPDF (soportan tildes y ñ). El botón se deshabilita si no hay datos cargados y durante la generación. Todo ocurre en el navegador; ningún dato sale a un servidor externo. Alternativas descartadas: `window.print()` (no descarga el archivo, depende del diálogo del navegador), `html2canvas` + jsPDF (PDF como imagen, texto no seleccionable, tablas cortadas), `@react-pdf/renderer` (más pesado y obliga a mantener un segundo diseño) y `svg2pdf.js` (tercera dependencia; se descarta mientras el gráfico se pueda dibujar con primitivas).

8. **UI.** Se delega al subagente `frontend-designer` y se registra en `docs/estandarUI-UX.md`: tarjeta de filtros, tarjeta de datos generales (campos `readOnly`), dos columnas (`col-lg-6`) con tabla y gráfico que se apilan bajo `lg`, tarjeta de acciones. Botones por función según §3.3: Filtrar `btn-primary`, Volver `btn-outline-secondary`, Imprimir a PDF `btn-accent` (con estado "Generando..." mientras se crea el archivo).

## Risks / Trade-offs

- [Dos dependencias nuevas (`jspdf`, `jspdf-autotable`) aumentan la superficie de mantenimiento y el tamaño de lo descargado] → carga diferida con `import()`, versiones fijadas y revisión de su licencia (MIT); no se agregan más librerías para el gráfico.
- [El gráfico del PDF se dibuja con código distinto al SVG de pantalla y podrían divergir] → ambos usan la misma función pura de escalas; se verifica visualmente que coincidan.
- [Escala X por tiempo real puede amontonar nodos cercanos en rangos largos] → etiquetas del eje con muestreo (no más de ~6) y tooltip por nodo con la fecha completa.
- [Gráfico escrito a mano puede tener errores de escala con datos extremos (un punto, pesos iguales)] → casos cubiertos en tareas y revisados manualmente; el cálculo de escalas va en una función pura en `Web/src/utils/` para poder probarla.
- [Cambio de firma de `ListarAsync`] → parámetros opcionales con `null` por defecto; sin impacto en `NuevaMedicion` ni en los tests existentes.
- [Sin framework de pruebas de frontend en el repo] → la lógica pura (escalas, validación de rango, filas de la tabla del PDF) se aísla y se verifica con lint/build y prueba manual; la cobertura automática queda en backend (xUnit).

## Migration Plan

Sin migraciones ni cambios de modelo. Requiere `npm install` en `Web/` por las dependencias nuevas. Rollback: revertir el commit (cambio aditivo en la API).

## Open Questions

- ¿Debe "Filtrar" exigir ambas fechas, o permitir un rango abierto (solo inicial o solo final)? (supuesto actual: la pantalla exige ambas; la API admite cada una por separado).
