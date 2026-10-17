## 1. Backend: filtro por rango en el histórico

- [x] 1.1 Agregar `DateOnly? desde = null, DateOnly? hasta = null` a `IRepositorioMedicion.ListarAsync` (`Application/Interfaces/IRepositorioMedicion.cs`) y a `RepositorioMedicion.ListarAsync` con `Where` condicionales inclusivos sobre `FechaMedicion` (LINQ parametrizado, sin SQL crudo)
- [x] 1.2 En `ServicioMedicion.ListarAsync` recibir `desde`/`hasta`, comprobar primero que el cliente existe (404) y lanzar `ValidationException` con "La fecha inicial no puede ser posterior a la fecha final." si `desde` > `hasta` (400 por `ManejoErroresMiddleware`)
- [x] 1.3 En `MedicionController.Listar` recibir `DateOnly? desde, DateOnly? hasta` por query string, agregar `ProducesResponseType` 400 y pasar los valores al servicio

## 2. Tests backend (xUnit)

- [x] 2.1 Unit (`Test/Unit/MedicionUnitTests.cs`): el servicio filtra por `desde`/`hasta` inclusivos, acepta un solo extremo, devuelve vacío sin coincidencias, lanza `ValidationException` si `desde` > `hasta` y `NoEncontradoException` si el cliente no existe (incluso con rango)
- [x] 2.2 Integración (`Test/Integration/MedicionApiTests.cs`): `GET .../mediciones` sin parámetros sigue devolviendo todo; con `desde`/`hasta` devuelve solo el rango, ordenado de más reciente a más antigua; rango invertido responde 400 con `errors`; fecha con formato inválido responde 400; cliente inexistente responde 404
- [x] 2.3 Ajustar los dobles de repositorio en los tests existentes a la nueva firma y ejecutar `dotnet test NutriTrack.slnx`

## 3. Frontend: servicio, lógica pura y gráfico

- [x] 3.1 `Web/src/services/medicionService.ts`: `listarMediciones(clienteId, desde?, hasta?)` con query string solo para los parámetros presentes; mantener el comportamiento actual de las llamadas existentes
- [x] 3.2 `Web/src/utils/historialProgreso.ts`: funciones puras sin React — validación del rango de fechas (cadenas `yyyy-MM-dd`, sin `Date` local), orden cronológico, formato `dd/MM/yyyy` y cálculo de escalas X/Y del gráfico (casos: un solo punto, pesos iguales, fechas iguales)
- [x] 3.3 `Web/src/components/GraficoPeso.tsx`: SVG propio responsivo (`viewBox`), cuadrícula horizontal gris sutil, ejes con etiquetas (máx. ~6 en X), polilínea, nodo por medición con tooltip en `mouseenter`/`focus` (`tabIndex=0`) y `<title>`, `role="img"` con `aria-label`, estado vacío
- [x] 3.4 Instalar `jspdf` y `jspdf-autotable` en `Web/` (versiones fijadas, `npm install`) y crear `Web/src/utils/generarPdfHistorial.ts`: `import()` dinámico de ambas librerías, encabezado (título, nombre del cliente, fecha del informe, rango), tabla con `autoTable` (salto de página y encabezado repetido), gráfico de peso dibujado con primitivas de jsPDF usando las escalas de `historialProgreso.ts`, y `doc.save("historial-{clienteId}-{yyyy-MM-dd}.pdf")`

## 4. Frontend: pantalla de Historial (delegar UI a `frontend-designer`)

- [x] 4.1 `Web/src/components/HistorialCliente.tsx` con las secciones Filtros (Fecha Inicial, Fecha Final, "Filtrar"), Datos Generales (Nombre y Fecha del informe, `readOnly`), Historial (tabla izquierda y gráfico derecha, apilados bajo `lg`) y Acciones ("Volver", "Imprimir a PDF")
- [x] 4.2 Comportamiento: tabla y gráfico vacíos al entrar sin llamar a la API; "Filtrar" valida fechas ingresadas y `desde` ≤ `hasta` con mensaje, consulta, y muestra estado "sin datos para ese rango"; estados de carga y error; nombre del cliente desde `clienteService` con error de cliente inexistente y "Volver"
- [x] 4.3 "Imprimir a PDF" llama a `generarPdfHistorial`: deshabilitado sin datos cargados y durante la generación ("Generando..."), con mensaje de error si falla y sin perder los datos en pantalla
- [x] 4.4 Ruta `/clientes/:id/historial` en `Web/src/App.tsx` y botón "Historial" en `ListadoClientes.tsx` (con el mensaje "Debe seleccionar el cliente cuyo historial desea consultar." sin selección)

## 5. Documentación y verificación

- [x] 5.1 `docs/API-Controllers.md`: documentar `desde`/`hasta` y el 400 del rango invertido, y retirar la nota de discrepancia
- [x] 5.2 `docs/estandarUI-UX.md`: patrón de la pantalla de Historial, gráfico SVG, descarga del PDF y fila nueva en el registro de decisiones (incluye la aprobación de `jspdf` y `jspdf-autotable` como excepción a "sin librerías visuales")
- [x] 5.3 `readme.md` §1.4: agregar `jsPDF` + `jspdf-autotable` al stack del frontend; revisar `AGENTS.md`/`CLAUDE.md` solo si cambian las rutas o el stack indicado
- [x] 5.4 `cd Web && npm run lint` (0 errores) y `npm run build` sin errores; revisar a mano que no queden colores sueltos en TSX
- [x] 5.5 Prueba manual en `npm run dev` con la API local: filtro válido/inválido/sin datos, un solo punto, tooltip con mouse y teclado, "Imprimir a PDF" (descarga y revisión del archivo: datos, gráfico, tildes y varias páginas), "Volver", ancho móvil
