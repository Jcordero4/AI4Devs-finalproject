# Estándar UI/UX de NutriTrack

Memoria de diseño del frontend (`Web/`). La mantiene el agente `frontend-designer` (`.claude/agents/frontend-designer.md`): lo **lee antes** de implementar y lo **actualiza después** con patrones y decisiones nuevas. Los humanos también pueden editarlo.

Precedencia: `openspec/specs/` define comportamiento; `README.md` define stack; este documento define cómo se ve y se construye la UI.

## 1. Stack UI y marca

- React 19 + TypeScript + Vite + `react-router-dom`.
- Bootstrap **5.3.8** solo vía CSS: `import 'bootstrap/dist/css/bootstrap.min.css'` en `Web/src/main.tsx`. Sin React-Bootstrap, librerías de iconos ni de fuentes.
- Idioma de UI y código: español.
- **Marca**: fuente de diseño `docs/Propuesta-UI-UX/Ficha-diseno-NutriTrack.md` (rediseño 2026-10-16). Logo `Web/public/logo-nutritrack.png` (hoja verde, flor azul cielo con centro amarillo, texto verde); patrón de hojas optimizado en `Web/src/assets/patron-hojas-sidebar.jpg` (13 KB, 512x768). `NutriTrack-hojas.png` no se usa. Favicon: se conserva `Web/public/favicon.svg` (plantilla Vite) hasta tener uno propio. `index.html`: `lang="es"`, título "NutriTrack — Nutrition Software".

## 2. Estructura y convenciones

- `Web/src/components/`: componentes y pantallas (`PascalCase.tsx`, export default). Hoy: `LayoutApp.tsx` (sidebar + topbar + `<Outlet />`, ruta padre), `ListadoClientes.tsx`, `FormularioCliente.tsx`, `NuevaMedicion.tsx` y los modales `ModalBase.tsx` (base reutilizable), `ModalConfirmacion.tsx`, `ModalTratamiento.tsx`, `ModalPlanNutricion.tsx`; `BadgeEstado.tsx` (mapa estado -> tono, §3.2) e `Iconos.tsx` (iconos SVG, §5).
- `Web/src/hooks/`: hooks reutilizables (`useDatosMedicion`: cliente + histórico de mediciones).
- `Web/src/utils/`: lógica pura de formulario sin React (`medicionFormulario.ts`: tipos de captura, validación por bloques, formato de fecha).
- `Web/src/services/`: acceso a API. `apiClient.ts` (base `VITE_API_URL`, `credentials: 'include'`, `ApiError` con `status` y `errores`) y un servicio por entidad (`clienteService.ts`).
- Rutas en `Web/src/App.tsx` (`/clientes`, `/clientes/nuevo`, `/clientes/:id/editar`, `/clientes/:id/mediciones/nueva`).
- Tipos de DTO exportados desde el servicio de su entidad.

## 3. Identidad visual y paleta

Referencia: ficha `docs/Propuesta-UI-UX/Ficha-diseno-NutriTrack.md` (sustituye al mockup anterior `docs/DisenoSistemasUI-UX.jpeg`, retirado). Personalidad: bienestar profesional, limpia y cálida. Tarjetas blancas con radio 16px, bordes suaves y sombra tenue; botones e inputs con radio 10px; chips redondeados; tipografía sans-serif del sistema (`system-ui, Segoe UI, Roboto…`; Inter no está disponible en el proyecto y no se agrega), títulos en tinta (`--nt-ink`) con peso 700.

### 3.1 Tokens de color

| Token | Hex | Uso |
|---|---|---|
| `--nt-ink` | `#183B3A` | Títulos, texto sobre amarillo, encabezado de tabla, ítem activo del menú (reemplaza `--nt-navy`) |
| `--nt-primary` | `#167546` | **Verde profundo**: sidebar, botón primario/guardar, enlaces, foco, selección. Hover `--nt-primary-hover` `#0F5E37`, activo `--nt-primary-active` `#0B4A2B` |
| `--nt-leaf` | `#2EAA57` | **Verde hoja**: solo decorativo (franja de tarjeta, íconos, bordes de validación). **Nunca texto blanco encima** (3.00:1) |
| `--nt-sky` | `#79C7E8` | Azul cielo: información y acentos (franja de tarjeta azul, borde de badge/alerta informativa, anillo de foco de inputs). No es color de texto (1.88:1 sobre blanco) |
| `--nt-accent` | `#F4CC4E` | **Amarillo solar**: énfasis (`btn-accent` con texto tinta). Hover `#F7D877`, activo `#F9E3A0` |
| `--nt-danger` / `--nt-danger-strong` | `#D9534F` / `#B3302C` | Rojo solo errores/destructivo; el texto/borde de rojo usa `-strong` |
| `--nt-bg` | `#F4F8F5` | Fondo de la aplicación (menta muy pálido) |
| `--nt-surface` | `#FFFFFF` | Tarjetas, topbar, tablas, placa del logo |
| `--nt-border` | `#E2ECE5` | Bordes de tarjetas, tablas y separadores |
| `--nt-border-input` | `#759286` | Borde de inputs/selects/checks (3.38:1 sobre blanco, WCAG 1.4.11) |
| `--nt-text` / `--nt-text-muted` | `#1F3330` / `#546B64` | Texto principal / secundario y placeholders |
| `--nt-primary-soft` | `#E3F2E8` | Fila seleccionada, hover de outline, chip, ítem activo del menú |
| `--nt-primary-tint` | `#EEF7F1` | Hover de fila de tabla |
| `--nt-table-head` | `#E4F2E9` | Encabezado de tabla (texto `--nt-ink`, peso 600) |
| `--nt-success-soft` | `#DDF2E3` | Badge verde |
| `--nt-accent-soft` | `#FDF0C0` | Badge amarillo/naranja |
| `--nt-info-soft` / `--nt-info-text` | `#E3F4FB` / `#0B5070` | Badge azul y `alert-info` (fondo / texto) |
| `--nt-danger-soft` | `#FBE3E2` | Badge rojo |
| `--nt-heading` | `= --nt-ink` | `h1`-`h6` y títulos de tarjeta |
| `--nt-radius` / `-control` / `-sm` | `1rem` / `0.625rem` / `0.5rem` | Tarjetas y modales / botones, inputs, alertas / botones `btn-sm` |
| `--nt-sombra` | tinta al 5%, dos capas | Sombra tenue de tarjetas |

**Nombres semánticos conservados** (para no tocar los TSX): `--nt-success` = verde hoja (`--nt-leaf`); `--nt-success-strong/-hover/-active` = alias del primario y sus estados (el botón Guardar y el primario ahora comparten el verde profundo); `--nt-warning` = amarillo solar; clases `nt-card--azul` (franja azul cielo), `nt-card--naranja` (franja amarillo solar), `nt-card--verde` (franja verde hoja); `btn-accent` (amarillo, texto tinta); badges `nt-badge--naranja` (amarillo) y `--ambar` (crema), `--azul` (azul cielo). El nombre indica la **función**, no el matiz actual.

Bloque `:root` (resumen; el completo y vigente está en `Web/src/index.css`):

```css
:root {
  --nt-ink: #183B3A;
  --nt-primary: #167546;  --nt-primary-hover: #0F5E37;  --nt-primary-active: #0B4A2B;
  --nt-leaf: #2EAA57;     --nt-sky: #79C7E8;
  --nt-accent: #F4CC4E;   --nt-accent-hover: #F7D877;   --nt-accent-active: #F9E3A0;
  --nt-danger: #D9534F;   --nt-danger-strong: #B3302C;  --nt-danger-soft: #FBE3E2;
  --nt-bg: #F4F8F5;       --nt-surface: #FFFFFF;        --nt-border: #E2ECE5;  --nt-border-input: #759286;
  --nt-text: #1F3330;     --nt-text-muted: #546B64;
  --nt-primary-soft: #E3F2E8; --nt-primary-tint: #EEF7F1; --nt-table-head: #E4F2E9;
  --nt-success-soft: #DDF2E3; --nt-accent-soft: #FDF0C0;  --nt-info-soft: #E3F4FB; --nt-info-text: #0B5070;

  --bs-primary: var(--nt-primary);  --bs-primary-rgb: 22, 117, 70;
  --bs-success: var(--nt-leaf);     --bs-info: var(--nt-sky);
  --bs-warning: var(--nt-accent);   --bs-danger: var(--nt-danger);
  --bs-body-bg: var(--nt-bg);       --bs-body-color: var(--nt-text);
  --bs-link-color: var(--nt-primary);
  --bs-border-radius: var(--nt-radius-control);
  --bs-focus-ring-color: rgba(121, 199, 232, 0.45);
}
```

Notas Bootstrap 5.3: los botones usan variables `--bs-btn-*`; `index.css` las reasigna en `.btn-primary/.btn-success` (idénticas), `.btn-accent`, `.btn-outline-primary/-secondary/-danger` y `.btn-secondary`. Sobrescrituras globales documentadas: `--bs-*` de `:root`, `.btn` (radio y peso 500), `.alert-info` (azul cielo), `.card`, `.modal`, `.form-control/.form-select/.form-check-input` (borde y foco), `h1-h6` (tinta, 700). `text-warning`/`bg-warning` ahora son amarillo claro: no usar `text-warning` (ilegible sobre blanco).

**Foco por teclado**: `a`, `.btn`, `.form-check-input` y `[tabindex]` muestran contorno de 3px en `--nt-primary` con offset 2px (5.73:1 sobre blanco, 5.34:1 sobre el fondo); inputs: borde `--nt-primary` + anillo azul cielo; sidebar: contorno blanco 3px.

### 3.2 Badges de estado

Chip redondeado (`nt-badge`, punto decorativo + texto) con **fondo suave + texto oscuro del mismo tono + borde fino**. Siempre con el texto del estado (no solo color).

| Tono | Fondo | Texto | Borde | Estados típicos |
|---|---|---|---|---|
| Crema (`ambar`) | `#FFF8E1` | `#6F4B00` | `#EBD27F` | Pendiente |
| Azul cielo (`azul`) | `#E3F4FB` | `#0B5070` | `#79C7E8` | Programado, Enviado, informativo |
| Amarillo (`naranja`) | `#FDF0C0` | `#664A00` | `#F4CC4E` | En proceso, Negociación |
| Verde (`verde`) | `#DDF2E3` | `#115C37` | `#9BD6AE` | Completado, Aceptado, Activo |
| Gris | `#EDF1EE` | `#44554F` | `#CAD6CF` | Borrador, Inactivo |
| Rojo | `#FBE3E2` | `#9C2B27` | `#F1B5B2` | Cancelado, Rechazado, Vencido |

Mapa estado → tono centralizado en `BadgeEstado`.

### 3.3 Componentes (forma y color)

- **Color de botón por función** (obligatorio; solo tokens):

| Función | Clase | Color actual | Ejemplos |
|---|---|---|---|
| Crear / acción principal | `btn btn-primary` | Verde profundo `#167546`, texto blanco | Nuevo, Filtrar, Nuevo Producto |
| Guardar / confirmar | `btn btn-success` | Igual que el primario (verde profundo) | Guardar, afirmativa de `ModalConfirmacion` |
| Selección / editar | `btn btn-outline-primary` | Outline verde profundo | Editar |
| Acción destacada o derivada | `btn btn-accent` | Amarillo solar `#F4CC4E`, **texto tinta** | Nueva Medición, Tratamiento, Plan de Nutrición |
| Volver / Cerrar / paginación / negativa | `btn btn-outline-secondary` u `outline-primary` | Outline verde profundo | Volver, Cerrar, Anterior/Siguiente, Omitir |
| Eliminar | `btn btn-outline-danger` | Outline rojo `-strong`; hover rojo sólido con texto blanco | Papelera de fila |

  **Por qué el primario es el verde profundo y no el verde hoja**: blanco sobre `#2EAA57` = 3.00:1 (falla AA para texto); sobre `#167546` = 5.73:1. El verde hoja queda para franjas e íconos. Prohibido `btn-secondary` gris sólido (se neutraliza como outline). Radio 10px (`btn-sm` 8px). Iconos SVG a la izquierda del texto (`Iconos.tsx`).
- **Tarjetas**: superficie blanca, borde `--nt-border`, radio 16px, sombra tenue, título `h2.card-header.h6` en `--nt-heading` (700) y **franja superior de 4px por función**: `.nt-card--azul` (azul cielo: datos, filtros, listados), `.nt-card--naranja` (amarillo solar: acciones derivadas), `.nt-card--verde` (verde hoja: resultados, captura de medición).
- **Inputs**: etiqueta visible en tinta, borde `--nt-border-input`, radio 10px, foco con borde verde profundo + anillo azul cielo; checks con `--nt-primary`.
- **Tablas**: encabezado `--nt-table-head` (menta) con texto tinta 600 y borde inferior `--nt-primary-soft` (todo `.table > thead`; sticky en tablas con scroll); hover `--nt-primary-tint`; **fila seleccionada** `table-primary` = fondo `--nt-primary-soft` + borde izquierdo verde profundo 4px (más el radio seleccionado, no solo color); columna Id con `.nt-celda-id`; estados con `BadgeEstado`; acciones por fila a la derecha.
- **Chip** `.nt-chip`: píldora menta con texto tinta (cantidad de resultados).
- **Estado vacío** `.nt-vacio`: icono en círculo menta, título tinta y texto de ayuda con la siguiente acción.
- **Alertas**: `alert-danger` Bootstrap; `alert-info` en azul cielo claro con texto `#0B5070`.
- **Modales**: radio 16px, franja superior verde hoja, bordes `--nt-border`.
- **Tarjeta KPI / timeline / tabs**: sin uso (no hay dashboard). Si se crean: cifra grande en tinta, amarillo para métricas destacadas, verde/azul para progreso.

## 4. Layout de aplicación

```
Escritorio (>= lg)                         Móvil (< lg)
+----------+-----------------------+       +----------------------------+
| [placa   | Título (h1) + descrip.|       | menu  NutriTrack (topbar)  |
|  logo]   |             [+ Acción]|       +----------------------------+
| Clientes | Contenido en tarjetas |       | Contenido en tarjetas      |
| Config   | sobre fondo menta     |       +----------------------------+
+----------+-----------------------+       (sidebar = offcanvas desde el menú)
```

- **Sidebar**: fijo a la izquierda (240px), fondo verde profundo `--nt-primary` con el patrón de hojas (`patron-hojas-sidebar.jpg`, `background-size: cover`) y una capa degradada (`rgba(22,117,70,.25)` → `rgba(11,74,43,.35)`) que unifica el tono y garantiza el contraste. Arriba, el **logo completo dentro de una placa blanca redondeada** (`img` con `object-fit: contain`, proporción 700x200 preservada, sin recolorear, `alt="NutriTrack — Nutrition Software"`): el texto del logo es verde y no se lee sobre el verde del sidebar. Ítems con icono SVG + texto (`#EAF5EE`); ítem activo claro (fondo `--nt-primary-soft`, texto tinta, icono verde profundo); "Configuración" anclado abajo, `disabled` y con chip "Próximamente".
- **Topbar**: clara (`--nt-surface`, borde inferior `--nt-border`), **solo móvil** (`d-lg-none`): hamburguesa + nombre del producto. Sin buscador ni usuario: eran placeholders sin función y no se presentan como controles activos; se reincorporan cuando existan (búsqueda global, autenticación).
- **Encabezado de página**: `h1.h3` + descripción breve en `--nt-text-muted`; acción principal a la derecha.
- **Listado**: encabezado + tarjeta de filtros/búsqueda + tarjeta de resultados con chip de cantidad, tabla limpia y paginación.
- **Formulario / captura**: tarjetas por sección; barra de acciones al pie (Volver outline, Guardar verde profundo; derivadas en amarillo).
- **Responsive**: bajo `lg` el sidebar es offcanvas (estado React, backdrop, Escape, `visibility` oculto cerrado); tablas en `table-responsive`; filtros apilados (`col-12 col-sm`).
- **Dashboard futuro**: no implementado (no hay ruta). KPIs y actividad reciente solo si el producto incorpora esa pantalla.
- **Componente de layout**: `Web/src/components/LayoutApp.tsx` (sidebar + topbar + `<Outlet />`) como ruta padre en `App.tsx`. El área `.nt-contenido` aporta el padding.

## 5. Patrones vigentes

**Página**
- Sin contenedor externo (lo da `LayoutApp`). Encabezado: `div.nt-encabezado` con `h1.h3.mb-0` + `p.nt-encabezado__subtitulo` (descripción breve, muted) y, a la derecha, la acción primaria (`btn btn-primary` con `IconoMas`). Las pantallas devuelven un fragmento `<>...</>`.
- Secciones agrupadas en `section.card.mb-3` con `card-header` (opcional) y `card-body`.

**Formulario**
- Grid dentro del `card-body`: `row g-3` con columnas `col-md-N`.
- Cada campo: `label.form-label[htmlFor]` + `input.form-control` / `select.form-select` con `id` coincidente. Checkbox con `form-check`.
- Campos calculados o de solo lectura: `disabled readOnly`.
- Acciones al pie en `div.d-flex.gap-2`: Volver (`btn btn-outline-secondary` con `IconoFlechaIzquierda`) y Guardar (`btn btn-success`).
- Salir con cambios sin guardar: `window.confirm` con mensaje estándar.
- Guardar con éxito: `navigate(ruta, { state: { mensaje } })`.

**Listado**
- Tarjeta "Buscar clientes" (`row g-2`, botón `btn btn-primary` con `IconoLupa`) + tarjeta de resultados con `h2` y chip `.nt-chip` con la cantidad ("N resultados", `role="status"`).
- `+ Nuevo` en el encabezado de página (`btn-primary`); sobre la tabla, Editar `btn btn-outline-primary` (`IconoEditar`) y Nueva Medición `btn btn-accent` (`IconoActividad`) (§3.3). Tabla dentro de `table-responsive`.
- Tabla `table table-hover align-middle`; fila seleccionada `table-primary` (tinte verde + borde izquierdo); columna Activo con `BadgeEstado` ("Activo" verde / "Inactivo" gris, siempre con texto y punto decorativo); selección con radio con `aria-label`.
- Cargando: fila con spinner y "Cargando..." (`role="status"`, derivado de `resultado === null`). Vacío: `.nt-vacio` con icono, título y ayuda distinta según haya o no filtros aplicados. Histórico de mediciones sin datos: "Aún no hay mediciones registradas para este cliente.".
- Paginación: texto "Página X de Y (N clientes)" + `btn-group` Anterior/Siguiente `btn-outline-primary`, deshabilitados en los extremos.

**Mensajes**
- Error: `div.alert.alert-danger[role="alert"]`; varios errores, un `div` por mensaje.
- Aviso/éxito: `div.alert.alert-info[role="alert"]` (llega por `location.state.mensaje`).
- Carga: texto "Cargando..." con `role="status"` y spinner.

**Colores de botón**: ver tabla "Color de botón por función" en §3.3 (única fuente).

**Modales (`ModalBase`)**
- Controlados por estado React, sin JS de Bootstrap: clases `modal d-block` + `modal-backdrop show` renderizadas con portal en `document.body`. `role="dialog"` (o `alertdialog` en confirmaciones), `aria-modal`, `aria-labelledby` (título `h2.modal-title.h5`).
- Foco inicial en `[data-autofocus]` o primer control del cuerpo; Tab/Shift+Tab atrapado; `#root` recibe `inert` mientras haya modales; al cerrar el foco vuelve al elemento que lo abrió.
- Escape nunca cierra por sí solo: llama a `onSolicitarCierre` y el padre decide (Tratamiento aplica su validación; confirmaciones cancelan). Clic en el fondo no cierra.
- Apilado (confirmación sobre Tratamiento): prop `superior` sube el z-index (`.nt-modal--superior`).
- Confirmaciones de dos opciones con textos propios: `ModalConfirmacion` (Sí/No, Guardar/Omitir). Reemplaza `window.confirm` en pantallas nuevas.
- Pie: acción secundaria `btn-outline-secondary` a la izquierda y principal a la derecha según función (§3.3: guardar/confirmar `btn-success`, crear `btn-primary`). Los botones de fila solo-icono (papelera) llevan `aria-label` y `title`.

**Tabla con encabezado fijo**
- Contenedor `table-responsive nt-tabla-scroll` (altura = 11 × `--nt-fila-alto`: encabezado + 10 filas con `table-sm`, `overflow-y: auto`) y `thead th` con `position: sticky; top: 0`, fondo `--nt-table-head`, texto tinta. Con `caption.visually-hidden` y fila vacía con texto descriptivo.

**Tabla de captura en una fila**
- Cabeceras `th[scope=col]`, cada input con `aria-label` igual a su cabecera; campos no editables `disabled readOnly`; asterisco `.campo-obligatorio` en la cabecera.

**Mensajes de acción**: en pantallas con barra de acciones al pie, los avisos/errores de guardado se muestran dentro de la tarjeta Acciones (junto al botón que los origina).

**Iconos**
- SVG inline en `Web/src/components/Iconos.tsx` (trazo `currentColor`, 24x24, `aria-hidden="true"` y `focusable="false"`): `IconoUsuarios`, `IconoAjustes`, `IconoMenu`, `IconoMas`, `IconoFlechaIzquierda`, `IconoLupa`, `IconoPapelera`, `IconoEditar`, `IconoActividad`, `IconoBandeja`. Clase `.nt-icono` (1.1em); en botones con texto se separa con margen automático. Sin emoji en la UI. El control que contiene solo un icono debe llevar `aria-label`.

## 6. Checklist de accesibilidad

- [ ] Todo control tiene `<label htmlFor>` o `aria-label`.
- [ ] Errores y avisos con `role="alert"`.
- [ ] Interactivos son `<button>`/`<a>`, operables con teclado, foco visible.
- [ ] Iconos decorativos con `aria-hidden="true"`.
- [ ] Contraste suficiente (AA); no transmitir información solo por color (badges llevan texto).
- [ ] Tablas con `<thead>`; cabeceras vacías con `aria-label`.
- [ ] Orden de tabulación lógico; sin trampas de foco.

## 7. Responsive y rendimiento

- Mobile-first con grid Bootstrap; evitar anchos fijos.
- Claves estables en listas; `useCallback`/`useMemo` solo con motivo; `React.lazy` para rutas pesadas.
- Estados contemplados en toda pantalla con datos remotos: cargando, vacío, error, éxito.

## 8. Registro de decisiones de diseño

| Fecha | Decisión | Motivo | Componentes |
|---|---|---|---|
| 2026-10-11 | Bootstrap 5.3.8 solo CSS, sin React-Bootstrap | Menos dependencias, alineado con README §1.4 | Global |
| 2026-10-11 | Layout `container py-4` + tarjetas `card` por sección | Consistencia entre pantallas | ListadoClientes, FormularioCliente |
| 2026-10-11 | Mensajes de éxito entre rutas vía `location.state` | Evita estado global para un aviso puntual | ListadoClientes, FormularioCliente |
| 2026-10-11 | Confirmación `window.confirm` al salir con cambios | Requisito de la US-004 | FormularioCliente |
| 2026-10-11 | Paleta basada en `docs/DisenoSistemasUI-UX.jpeg` como tokens CSS (`--nt-*`) sobre variables Bootstrap | Identidad visual única sin colores sueltos; hex estimados | Global |
| 2026-10-11 | Layout objetivo sidebar navy + topbar con buscador | Consistencia con el diseño de referencia | Global (`LayoutApp`) |
| 2026-10-11 | Del mockup se toma solo estilo visual, sin marca ni módulos de otro producto | El mockup corresponde a otro sistema | Global |
| 2026-10-11 | Tokens `--nt-*`, overrides `--bs-*` y `.btn-primary`/`.btn-outline-secondary`/`.card`/inputs con variables `--bs-*` en `index.css`; se eliminan los estilos de la plantilla Vite (`#root`, `h1`, `h2`, `code`, modo oscuro) y `App.css` (no se importaba) | Los estilos de plantilla centraban el texto y fijaban `h1` a 56px, chocando con Bootstrap | Global |
| 2026-10-11 | Formulario envuelto en `<form noValidate onSubmit>` con Guardar `type="submit"` (Enter envía); validación sigue en `guardar()` | Accesibilidad de teclado sin cambiar validaciones | FormularioCliente |
| 2026-10-11 | Estado `enviando`: Guardar y Volver deshabilitados, spinner y texto "Guardando..." | Evitar doble envío (spec: sin cambios de comportamiento) | FormularioCliente |
| 2026-10-11 | Campos obligatorios: asterisco `.campo-obligatorio` con `aria-hidden` + `required`/`aria-required`; leyenda bajo el h1 | No depender solo del color; el lector de pantalla anuncia "obligatorio" | FormularioCliente |
| 2026-10-11 | Sección en tarjeta con `card-header` como `h2.h6` y `aria-labelledby`; botón Guardar sin emoji | Jerarquía de títulos y menos iconos decorativos sin librería | FormularioCliente |
| 2026-10-11 | Carga con `role="status"` y spinner Bootstrap | Anuncio a lectores de pantalla | FormularioCliente |
| 2026-10-11 | `LayoutApp` como ruta padre: sidebar fijo 240px desde `lg`; bajo `lg` offcanvas controlado por estado React (sin JS Bootstrap), con backdrop, cierre por Escape (devuelve foco a la hamburguesa), por clic en backdrop o en un ítem; oculto con `visibility` cuando está cerrado para sacarlo del orden de tabulación | Cumplir §4 sin dependencias nuevas y con accesibilidad de teclado | LayoutApp |
| 2026-10-11 | Ítem activo vía `NavLink` (clase `.active` + `aria-current="page"` automático) estilizado en `.nt-nav-item.active`; "Configuración" es `button disabled` placeholder; buscador global y usuario son decorativos (input `disabled`) | Aún no hay módulos ni autenticación (fuera del MVP) | LayoutApp |
| 2026-10-11 | Íconos del layout son emoji con `aria-hidden` (sin librería de íconos) | Mantener cero dependencias; revisar si se aprueba librería | LayoutApp |
| 2026-10-11 | Encabezado de página estándar `.nt-encabezado`; `+ Nuevo` pasa de `btn-success` en la tarjeta a `btn-primary` en el encabezado; filtros sin `flex-nowrap` (`col-12 col-sm`); tabla en `table-responsive`; `cursor: pointer` movido a `.nt-fila-seleccionable` | Alinear con §3.3/§4 y resolver deuda responsive | ListadoClientes, FormularioCliente |
| 2026-10-11 | Modales propios (`ModalBase`) con portal, `inert` en `#root`, trampa de foco y Escape delegado al padre | Spec de medición exige que Escape no salte la validación de cierre; evitar JS de Bootstrap | ModalBase, ModalTratamiento, ModalPlanNutricion, ModalConfirmacion |
| 2026-10-11 | Confirmaciones Sí/No y Guardar/Omitir con `ModalConfirmacion` en vez de `window.confirm`; Escape en "salir" cancela (permanece), nunca equivale a Omitir | Botones con texto propio (spec) y evitar pérdida accidental de datos | NuevaMedicion, ModalTratamiento |
| 2026-10-11 | Tabla histórico con encabezado sticky y altura de 10 filas por CSS (`.nt-tabla-scroll`) | Spec: cargar todo, 10 visibles, scroll, encabezado fijo | NuevaMedicion |
| 2026-10-11 | Plan de Nutrición se abre como modal (7 filas fijas, sin encabezado visible) y sus valores se validan al Guardar | La US lo trata como ventana abierta por botón; la validación global informa el bloque inválido | ModalPlanNutricion |
| 2026-10-11 | Tratamiento con 0 filas es válido (spec: cero o más); la fila vacía por defecto cuenta como bloque incompleto hasta completarla o eliminarla | Spec de medición y validación por bloque | NuevaMedicion |
| 2026-10-11 | `yaGuardado` = fecha devuelta por el POST; Guardar posterior hace PUT a esa fecha; `haCambiado` compara una huella JSON con el último estado guardado | Decidir POST/PUT y confirmar salida sin estado global | NuevaMedicion |
| 2026-10-11 | Carga de datos de pantalla en hook `useDatosMedicion` (sin `setState` síncrono en el efecto; "cargando" derivado) | Evitar el warning `set-state-in-effect` | useDatosMedicion |
| 2026-10-11 | Más color (la UI se veía "blanca y gris"): tintes `*-soft`/`primary-tint`/`table-head`, `--nt-heading` navy, fondo app `#F1F5FC`; tabla "color de botón por función" (naranja `btn-accent`, verde `btn-success`, outline azul); `btn-secondary` gris neutralizado; encabezados de tabla azul claro, hover/selección azulados; tarjetas con franja superior por función; topbar con borde azul claro | Corrige el §3.3 anterior (encabezado gris, botón secundario gris) que producía una UI sin color; alinea con el mockup | Global, ListadoClientes, FormularioCliente, NuevaMedicion, modales, LayoutApp |
| 2026-10-11 | `btn-accent` con **texto navy**, no blanco; hover/activo más claros | Blanco sobre `#F28C28` = 2.45:1 (falla AA); navy = 5.68:1 | `index.css` |
| 2026-10-11 | Botón verde usa `--nt-success-strong` `#237A3C`; `--nt-success` queda para franjas/íconos | Blanco sobre `#2E9E4F` = 3.43:1 (falla); sobre `#237A3C` = 5.36:1 | `index.css` |
| 2026-10-11 | `--nt-text-muted` `#6B7A90` a `#5B6A80`; asterisco y `outline-danger` usan `--nt-danger-strong` | Muted sobre blanco 4.36:1 (falla) a 5.50:1; `#D9534F` sobre blanco 3.96:1 a `#B3302C` 6.22:1 | `index.css` |
| 2026-10-11 | `BadgeEstado` creado; columna Activo del listado pasa de checkbox deshabilitado a badge con texto | Mapa único estado -> tono; no transmitir solo por color; mismo dato | BadgeEstado, ListadoClientes |
| 2026-10-11 | Guardar de cliente/medición y afirmativa de confirmaciones en verde; Tratamiento y Plan de Nutrición en naranja | Color por función (§3.3) | FormularioCliente, NuevaMedicion, ModalConfirmacion |
| 2026-10-15 | Campo opcional Teléfono (`type="tel"`, `inputMode="tel"`, `maxLength=15`): el tecleo/pegado se filtra a dígitos y '+' solo en la primera posición, y se valida con `^\+?\d{7,15}$` antes de enviar (mensaje en la alerta global); listado con columna Teléfono entre Nombre y Email | Change `agregar-telefono-cliente`; filtrar al teclear evita errores y la validación cubre el largo mínimo | FormularioCliente, ListadoClientes, clienteService |
| 2026-10-16 | Rediseño de marca según `docs/Propuesta-UI-UX/Ficha-diseno-NutriTrack.md`: paleta verde/azul cielo/amarillo/tinta reemplaza navy/azul/naranja; `--nt-navy` se renombra `--nt-ink` y `--nt-accent` pasa a amarillo; se mantienen los nombres de clase y tokens semánticos (`nt-card--azul`, `btn-accent`, `--nt-success`…) | La ficha es la nueva fuente de diseño; conservar nombres evita tocar TSX y no cambia comportamiento | Global |
| 2026-10-16 | Primario/Guardar en verde profundo `#167546` y no en verde hoja `#2EAA57`; `btn-success` y `btn-primary` comparten color | Blanco sobre verde hoja = 3.00:1 (falla AA); sobre `#167546` = 5.73:1. El verde hoja queda decorativo | `index.css` |
| 2026-10-16 | `btn-accent` amarillo solar con texto tinta (hover/activo más claros) | Tinta sobre `#F4CC4E` = 7.88:1; blanco sobre amarillo no cumple | `index.css` |
| 2026-10-16 | Logo completo sobre placa blanca redondeada en el sidebar, sin recolorear, `object-fit: contain` | El texto del logo es verde y no se lee sobre el sidebar verde; la placa conserva la marca intacta | LayoutApp |
| 2026-10-16 | Patrón de hojas reducido de 1024x1536 PNG (1.6 MB) a 512x768 JPEG q72 (13 KB) en `src/assets/`, con capa degradada encima | Peso de carga; la capa fija el peor caso de contraste del texto (blanco 6.04:1 sobre la hoja más clara) | `index.css`, assets |
| 2026-10-16 | `NutriTrack-hojas.png` no se usa | Decisión del equipo | assets |
| 2026-10-16 | Iconos SVG inline propios (`Iconos.tsx`) reemplazan todos los emoji y los `+`/`←` textuales; sin librería de iconos | Cero dependencias, trazo coherente, `aria-hidden` y color heredado | LayoutApp, ListadoClientes, FormularioCliente, NuevaMedicion, ModalTratamiento |
| 2026-10-16 | Topbar solo móvil (hamburguesa + nombre), sin buscador global ni usuario; "Configuración" se conserva deshabilitado con chip "Próximamente" | Eran placeholders sin función; no deben parecer controles activos (ficha) | LayoutApp |
| 2026-10-16 | Listado: tarjeta "Buscar clientes", chip con cantidad de resultados, estado de carga y estado vacío útil (texto distinto con/sin filtros) | Ficha: cantidad de resultados y estado vacío útil; el estándar exige cargando/vacío/error/éxito. Solo presentación (derivado de `resultado`/`aplicados`) | ListadoClientes |
| 2026-10-16 | Bordes de input/checks `--nt-border-input` `#759286` (3.38:1) distinto del borde suave de tarjetas `--nt-border` | WCAG 1.4.11: el límite de un control necesita 3:1; `#E2ECE5` solo da ~1.2:1 | `index.css` |
| 2026-10-16 | Foco visible global: contorno 3px verde profundo en enlaces/botones/checks; sidebar contorno blanco | >= 3:1 sobre fondos claros y sobre el sidebar | `index.css` |
| 2026-10-16 | `alert-info` reasignado a azul cielo claro con texto `#0B5070`; `--bs-form-invalid-color` = `--nt-danger-strong` | Coherencia de marca y contraste AA del texto de error | `index.css` |
| 2026-10-16 | Las filas anteriores de §8 que mencionan navy/azul/naranja/mockup quedan como historial; vale lo descrito en §3 y §4 | Evitar contradicciones sin borrar el registro | Documento |

### Ratios de contraste calculados (WCAG 2.1, 2026-10-16)

Calculados con script (luminancia relativa WCAG). Umbrales: texto >= 4.5:1; UI/foco >= 3:1.

| Par (texto / fondo) | Ratio | Criterio |
|---|---|---|
| Blanco / `--nt-primary` #167546 (btn primario, guardar) | 5.73 | AA texto |
| Blanco / primary-hover #0F5E37 · active #0B4A2B | 7.85 · 10.35 | AA texto |
| Blanco / `--nt-leaf` #2EAA57 | 3.00 | **no usar con texto**; solo decorativo |
| Tinta #183B3A / `--nt-accent` #F4CC4E (btn-accent) | 7.88 | AA texto |
| Tinta / accent-hover #F7D877 · active #F9E3A0 | 8.72 · 9.58 | AA texto |
| `--nt-primary` / blanco (enlaces, outline) | 5.73 | AA texto |
| `--nt-primary` / fondo #F4F8F5 | 5.34 | AA texto |
| `--nt-primary` / primary-soft #E3F2E8 (Id en fila seleccionada, icono de chip) | 4.94 | AA texto |
| primary-active #0B4A2B / primary-soft (hover outline) | 8.94 | AA texto |
| `--nt-primary` / primary-tint #EEF7F1 (hover de fila) | 5.24 | AA texto |
| Tinta / `--nt-table-head` #E4F2E9 | 10.53 | AA texto |
| Tinta / blanco · / fondo | 12.17 · 11.35 | AA texto |
| `--nt-text` #1F3330 / fondo · primary-soft · primary-tint | 12.44 · 11.52 · 12.20 | AA texto |
| `--nt-text-muted` #546B64 / blanco · fondo · table-head · primary-soft | 5.73 · 5.35 · 4.96 · 4.95 | AA texto |
| `--nt-danger-strong` #B3302C / blanco · fondo | 6.22 · 5.80 | AA texto |
| Blanco / danger-strong (hover outline-danger) | 6.22 | AA texto |
| `--nt-info-text` #0B5070 / info-soft #E3F4FB (alert-info, badge azul) | 7.76 | AA texto |
| Badges texto/fondo: crema 7.37, azul 7.76, amarillo 7.23, verde 6.85, gris 6.93, rojo 6.16 | >= 6.16 | AA texto |
| Blanco / sidebar, peor caso sobre la hoja más clara (#1E704B) | 6.04 | AA texto |
| Texto de ítem `#EAF5EE` / sidebar peor caso | 5.41 | AA texto |
| Blanco / ítem en hover (blanco 10%) sobre peor caso | 4.90 | AA texto |
| Tinta / ítem activo (primary-soft) | 10.51 | AA texto |
| "Configuración" deshabilitado `#B9D5C5` / sidebar peor caso | 3.81 | exento (control deshabilitado) |
| Primario / blanco · fondo (contorno de foco, título de topbar) | 5.73 · 5.34 | UI >= 3 |
| Foco blanco / sidebar peor caso | 6.04 | UI >= 3 |
| `--nt-border-input` #759286 / blanco · fondo | 3.38 · 3.15 | UI >= 3 |
| Verde hoja / blanco (franja decorativa) | 3.00 | UI >= 3 (decorativo) |
| Azul cielo / blanco (franja decorativa) | 1.88 | solo decorativo; nunca único indicador (los badges llevan texto y borde) |

## 9. Deuda y pendientes de estandarización

Vigentes tras el rediseño (2026-10-16):

- **Favicon propio pendiente**: se conserva `favicon.svg` de la plantilla Vite; no hay favicon compatible con la marca (preparar uno a partir del logo).
- **Dashboard y tarjeta KPI**: futuros, sin implementar (no hay ruta). Reincorporar buscador global y usuario en la topbar cuando existan funcionalmente.
- **Revisión visual manual pendiente** en `npm run dev` (Ctrl+F5): `/clientes`, `/clientes/nuevo`, `/clientes/:id/mediciones/nueva`, modales, sidebar escritorio y offcanvas móvil. Verificado solo por CSS y contraste calculado, sin navegador.
- Texto de ítems sobre el patrón: calculado con el peor caso (hoja más clara); si se cambia el patrón o la capa, recalcular.
- `FormularioCliente` y `NuevaMedicion`: **errores solo en alerta global**, sin mensaje junto al campo ni `aria-invalid`/`is-invalid` (la ficha lo pide; exige estado de validación por campo, es lógica nueva).
- `ListadoClientes`: fila clicable sin acceso por teclado (solo el radio es operable); warning de lint preexistente `set-state-in-effect` (`cargar()` hace `setError(null)` síncrono; requiere refactor a hook de datos).
- `LayoutApp`: sin atrapar foco dentro del offcanvas abierto.
- `FormularioCliente` aún usa `window.confirm`; migrar a `ModalConfirmacion` (ya existe).
- `NuevaMedicion`: validar visualmente que el histórico muestra exactamente 10 filas (altura por `--nt-fila-alto` aproximada); sin aviso al cerrar la pestaña con cambios sin guardar; recargar tras guardar y volver a guardar da 409 (diseño actual).
- Hex de marca tomados de la ficha; confirmar contra manual de marca si existe.

Resuelto (2026-10-16): emoji sustituidos por SVG; placeholders de topbar retirados; estado de carga y vacío en el listado; contraste AA recalculado con la paleta nueva (incluido el sidebar sobre el patrón y los bordes de input).
Resuelto (2026-10-11, histórico): tokens `--nt-*` y overrides `--bs-*`, plantilla Vite limpiada, `LayoutApp`, `BadgeEstado`, botones por función.
