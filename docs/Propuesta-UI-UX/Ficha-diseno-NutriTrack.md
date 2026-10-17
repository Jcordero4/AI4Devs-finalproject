# Ficha de diseño — NutriTrack

## Objetivo
Actualizar la interfaz de NutriTrack para que se perciba moderna, cálida y confiable, conservando los flujos actuales de clientes y mediciones. La identidad nace del logo entregado: hojas verdes, pétalos azul cielo y centro amarillo.

## Dirección visual
- **Personalidad:** bienestar profesional; limpia, cercana y enfocada en el seguimiento nutricional.
- **Paleta base:** verde hoja `#2EAA57`; verde profundo `#167546`; azul cielo `#79C7E8`; amarillo solar `#F4CC4E`; azul tinta `#183B3A`; fondo menta muy pálido `#F4F8F5`; superficie `#FFFFFF`; borde `#E2ECE5`.
- **Uso del color:** verde para navegación y acciones principales; amarillo para énfasis y métricas destacadas; azul para información y acentos; rojo solo para errores/acciones destructivas. Garantizar contraste AA en texto y botones.
- **Tipografía:** sistema sans-serif legible (Inter si ya está disponible; sin agregar dependencias para obtenerla). Títulos en azul tinta, jerarquía clara y cifras KPI grandes.
- **Formas:** tarjetas blancas con radio 14–18 px, bordes suaves y sombras tenues; botones e inputs con radio 9–11 px; chips de estado redondeados.
- **Marca:** usar el logo completo en el encabezado lateral con `object-fit: contain`, preservando proporción y sin recolorearlo. Proveer texto alternativo “NutriTrack — Nutrition Software”.

## Composición del sitio
- **Navegación lateral** fija en escritorio, fondo verde profundo, marca arriba e ítems con iconos SVG simples y consistentes. En móvil se abre como panel accesible desde el botón menú.
- **Barra superior** clara, buscador, notificaciones/perfil solo si existen funcionalmente; si son placeholders, no presentarlos como controles activos.
- **Área de trabajo** con fondo menta pálido, ancho fluido y espaciado generoso. Cada vista empieza con título, descripción breve y acción principal.
- **Clientes:** filtros y búsqueda en una tarjeta; resultados en tabla limpia; estado como chip con texto; acciones claras y paginación. Mostrar cantidad de resultados y un estado vacío útil.
- **Mediciones:** captura por secciones y tarjetas, agrupando datos relacionados; resaltar progreso/resultados con verde y azul, reservar amarillo para foco. Mantener las validaciones y el flujo actual.
- **Dashboard futuro (no implementarlo como requisito de esta entrega):** KPIs y actividad reciente, únicamente si el producto incorpora esa pantalla.

## Componentes y comportamiento
- Mantener React + TypeScript + Vite y Bootstrap CSS; no agregar librerías visuales.
- Centralizar colores como variables CSS `--nt-*` y conectarlos a variables Bootstrap.
- Mantener patrones de `docs/estandarUI-UX.md`, rutas y servicios actuales. No cambiar reglas de negocio ni contratos de API.
- Formularios: etiquetas visibles, errores junto al campo además del resumen, estados de foco/teclado claros.
- Accesibilidad: contraste AA, foco visible, teclado completo, `aria-label` para iconos sin texto, tablas con encabezados semánticos y texto para estados (no depender solo del color).
- Responsive: escritorio con sidebar; tablet/móvil con menú plegable; tabla con desplazamiento horizontal cuando sea necesario; filtros que se apilan sin desbordarse.

## Alcance recomendado
1. Integrar el logo en `Web/public/` y actualizar `Web/index.html` (idioma, título y favicon si se prepara uno compatible).
2. Ajustar tokens y estilos globales de `Web/src/index.css` a la marca.
3. Refinar `Web/src/components/LayoutApp.tsx` y la pantalla existente `ListadoClientes.tsx` como primera entrega visible.
4. Aplicar el mismo lenguaje visual a `FormularioCliente.tsx`, `NuevaMedicion.tsx` y modales, preservando el comportamiento.
5. Actualizar `docs/estandarUI-UX.md` con decisiones de marca y tokens finales.

## Criterios de aceptación
- El logo se ve nítido, completo y proporcionado en escritorio y móvil.
- Las vistas actuales se sienten parte del mismo producto y respetan la paleta propuesta.
- Las acciones principales, navegación, formularios, tablas y estados se pueden usar con teclado y tienen foco visible.
- Sin regresiones funcionales, errores de TypeScript o reglas de lint incumplidas.
- Verificar build y lint de `Web/` antes de cerrar la implementación.

## Instrucción lista para Claude
Implementa el rediseño descrito en esta ficha sobre el proyecto NutriTrack existente. Antes de editar, lee `AGENTS.md`, `docs/estandarUI-UX.md`, la spec OpenSpec aplicable y los componentes actuales. Mantén React + TypeScript + Vite + Bootstrap CSS, no agregues librerías visuales ni cambies comportamiento/API. Integra el logo proporcionado, actualiza los tokens globales y adapta LayoutApp, ListadoClientes, FormularioCliente, NuevaMedicion y modales con una experiencia responsive y accesible. Registra las decisiones en `docs/estandarUI-UX.md`. Al terminar, ejecuta lint y build del frontend e informa archivos cambiados, resultados y cualquier limitación. No crees un dashboard nuevo: no existe en las rutas actuales.
