# Estándar UI/UX de NutriTrack

Memoria de diseño del frontend (`Web/`). La mantiene el agente `frontend-designer` (`.claude/agents/frontend-designer.md`): lo **lee antes** de implementar y lo **actualiza después** con patrones y decisiones nuevas. Los humanos también pueden editarlo.

Precedencia: `openspec/specs/` define comportamiento; `README.md` define stack; este documento define cómo se ve y se construye la UI.

## 1. Stack UI

- React 19 + TypeScript + Vite + `react-router-dom`.
- Bootstrap **5.3.8** solo vía CSS: `import 'bootstrap/dist/css/bootstrap.min.css'` en `Web/src/main.tsx`. Sin React-Bootstrap ni otras librerías UI.
- Idioma de UI y código: español.

## 2. Estructura y convenciones

- `Web/src/components/`: componentes y pantallas (`PascalCase.tsx`, export default). Hoy: `LayoutApp.tsx` (sidebar + topbar + `<Outlet />`, ruta padre), `ListadoClientes.tsx`, `FormularioCliente.tsx`, `NuevaMedicion.tsx` y los modales `ModalBase.tsx` (base reutilizable), `ModalConfirmacion.tsx`, `ModalTratamiento.tsx`, `ModalPlanNutricion.tsx`; `BadgeEstado.tsx` (mapa estado -> tono, §3.2).
- `Web/src/hooks/`: hooks reutilizables (`useDatosMedicion`: cliente + histórico de mediciones).
- `Web/src/utils/`: lógica pura de formulario sin React (`medicionFormulario.ts`: tipos de captura, validación por bloques, formato de fecha).
- `Web/src/services/`: acceso a API. `apiClient.ts` (base `VITE_API_URL`, `credentials: 'include'`, `ApiError` con `status` y `errores`) y un servicio por entidad (`clienteService.ts`).
- Rutas en `Web/src/App.tsx` (`/clientes`, `/clientes/nuevo`, `/clientes/:id/editar`, `/clientes/:id/mediciones/nueva`).
- Tipos de DTO exportados desde el servicio de su entidad.

## 3. Identidad visual y paleta

Referencia: `docs/DisenoSistemasUI-UX.jpeg`. Se toma **solo el estilo visual** (colores, forma de componentes, layout); no la marca, logo ni módulos del mockup. Los hex son **estimados** a partir de la imagen: confirmar valores oficiales y ajustar aquí.

Estilo general: corporativo con presencia de color (no "blanco y gris"): fondo con tinte azulado, tarjetas blancas con borde fino, esquinas redondeadas (~8px) y franja superior de color por función, sombra muy suave, sidebar azul oscuro, encabezados de tabla azul claro, naranja y verde en botones según función, tipografía sans-serif legible (la de Bootstrap por defecto).

### 3.1 Tokens de color

| Token | Hex (aprox.) | Uso |
|---|---|---|
| `--nt-navy` | `#0F2A5C` | Fondo del sidebar |
| `--nt-primary` | `#1F5FD1` | Botón primario, ítem activo del menú, enlaces, tabs activas |
| `--nt-accent` | `#F28C28` | Acción destacada secundaria, paso activo de timeline, total resaltado |
| `--nt-success` | `#2E9E4F` | Estados positivos, botón de confirmación, delta positivo |
| `--nt-danger` | `#D9534F` | Eliminar, errores |
| `--nt-warning` | `#E0A100` | Estados pendientes |
| `--nt-success-strong` | `#237A3C` | Fondo de `btn-success` (`--nt-success` con texto blanco da 3.43:1, no cumple AA); hover `#1E6532`, activo `#195429` |
| `--nt-danger-strong` | `#B3302C` | Texto/borde de rojo sobre claro (asterisco, `btn-outline-danger`); `--nt-danger` sobre blanco da 3.96:1 |
| `--nt-accent-hover` / `--nt-accent-active` | `#F5A04E` / `#F7B26E` | Hover/activo de `btn-accent` (más claros: con texto navy el contraste sube) |
| `--nt-primary-soft` | `#E4EDFB` | Fila seleccionada, hover de outline azul, badge azul |
| `--nt-primary-tint` | `#EEF4FD` | Hover de fila de tabla |
| `--nt-table-head` | `#E8F0FC` | Encabezado de tabla (texto `--nt-navy`, peso 600) |
| `--nt-accent-soft` | `#FDE8D3` | Badge naranja, total resaltado, ícono pastel |
| `--nt-success-soft` | `#DFF3E5` | Badge verde, ícono pastel |
| `--nt-danger-soft` | `#FBE3E2` | Badge rojo, ícono pastel |
| `--nt-heading` | `= --nt-navy` | `h1`-`h6` y títulos de tarjeta |
| `--nt-bg` | `#F1F5FC` | Fondo de la aplicación (tinte azulado) |
| `--nt-surface` | `#FFFFFF` | Tarjetas, topbar, tablas |
| `--nt-border` | `#E3E8F0` | Bordes de tarjetas, tablas e inputs |
| `--nt-text` | `#1B2740` | Texto principal |
| `--nt-text-muted` | `#5B6A80` | Subtítulos, placeholders, texto secundario |

Definirlos en `Web/src/index.css` y enlazarlos con Bootstrap sobrescribiendo sus variables (no usar colores sueltos en componentes):

```css
:root {
  --nt-navy: #0F2A5C;
  --nt-primary: #1F5FD1;
  --nt-accent: #F28C28;
  --nt-success: #2E9E4F;
  --nt-danger: #D9534F;
  --nt-warning: #E0A100;
  --nt-bg: #F1F5FC;
  --nt-surface: #FFFFFF;
  --nt-border: #E3E8F0;
  --nt-text: #1B2740;
  --nt-text-muted: #5B6A80;
  /* + tintes y variantes (primary-soft, primary-tint, table-head, accent-soft, success-soft,
     danger-soft, success-strong, danger-strong, accent-hover/active, heading): ver tabla de arriba */

  --bs-primary: var(--nt-primary);
  --bs-primary-rgb: 31, 95, 209;
  --bs-success: var(--nt-success);
  --bs-success-rgb: 46, 158, 79;
  --bs-danger: var(--nt-danger);
  --bs-danger-rgb: 217, 83, 79;
  --bs-warning: var(--nt-warning);
  --bs-warning-rgb: 224, 161, 0;
  --bs-body-bg: var(--nt-bg);
  --bs-body-color: var(--nt-text);
  --bs-border-color: var(--nt-border);
  --bs-secondary-color: var(--nt-text-muted);
}
```

Nota: `.btn-primary`, `.btn-success`, `.btn-accent`, `.btn-outline-primary`, `.btn-outline-secondary` y `.btn-outline-danger` en Bootstrap 5.3 usa variables propias (`--bs-btn-bg`, etc.); definir una clase `.btn-primary` con esas variables en `index.css` para que el azul aplique a botones.

### 3.2 Badges de estado

Píldora redondeada (`badge rounded-pill`) con **fondo suave + texto oscuro del mismo tono + borde fino**. Siempre con texto del estado (no solo color).

| Tono | Fondo | Texto | Estados típicos |
|---|---|---|---|
| Ámbar | `#FFF3D6` | `#8A5A00` | Pendiente |
| Azul | `#E4EDFB` | `#1F4FA8` | Programado, Enviado, Activo informativo |
| Naranja | `#FDE8D3` | `#9A4F0A` | En proceso, Negociación |
| Verde | `#DFF3E5` | `#1E6B36` | Completado, Aceptado, Activo |
| Gris | `#ECEFF4` | `#4A566B` | Borrador, Inactivo |
| Rojo | `#FBE3E2` | `#9C2B27` | Cancelado, Rechazado, Vencido |

Adaptar los nombres al dominio de NutriTrack; mantener un mapa estado → tono centralizado (un único componente `BadgeEstado`).

### 3.3 Componentes (forma y color)

- **Color de botón por función** (obligatorio; los colores salen solo de tokens):

| Función | Clase | Ejemplos |
|---|---|---|
| Crear / acción principal | `btn btn-primary` (azul sólido, `+ Nuevo ...`) | Nuevo, Filtrar, Nuevo Producto |
| Selección / editar | `btn btn-outline-primary` | Editar |
| Acción destacada o derivada | `btn btn-accent` (naranja, **texto navy**) | Nueva Medición, Tratamiento, Plan de Nutrición |
| Guardar / confirmar | `btn btn-success` (verde `--nt-success-strong`, texto blanco) | Guardar, afirmativa de `ModalConfirmacion` |
| Volver / Cerrar / paginación / negativa | `btn btn-outline-secondary` u `outline-primary` (outline azul) | Volver, Cerrar, Anterior/Siguiente, Omitir |
| Eliminar | `btn btn-outline-danger` o ícono rojo (`--nt-danger-strong`) | Papelera de fila |

  Prohibido `btn-secondary` gris sólido (en `index.css` se neutraliza como outline azul). Esquinas ~6px.
- **Tarjetas**: fondo `--nt-surface`, borde `--nt-border`, radio ~8px, sombra mínima, título en negrita color `--nt-heading` (navy) y **franja superior de 3px por función**: `.nt-card--azul` (datos, filtros, listados), `.nt-card--naranja` (plan, tratamiento, acciones derivadas), `.nt-card--verde` (resultados, captura de medición).
- **Inputs**: borde `--nt-border`, radio ~6px, foco con anillo `--nt-primary`; buscador con ícono de lupa a la izquierda.
- **Tablas**: encabezado `--nt-table-head` con texto `--nt-navy` en peso 600 y borde inferior `--nt-primary-soft` (aplicado a todo `.table > thead`; en tablas con scroll sigue sticky); filas con línea fina; hover `--nt-primary-tint`; **fila seleccionada** `table-primary` = fondo `--nt-primary-soft` + borde izquierdo azul 3px (además del radio seleccionado, no solo color); columna identificadora (Id) con `.nt-celda-id` (azul 600); estados con `BadgeEstado`; acciones por fila alineadas a la derecha.
- **Tarjeta KPI**: ícono en cuadro pastel redondeado (tono según métrica), título, cifra grande, subtítulo en `--nt-text-muted`, variación porcentual en verde con flecha.
- **Topbar**: borde inferior de 2px `--nt-primary-soft`. Enlaces "Ver todas" en azul.
- **Tabs**: activa con texto y subrayado `--nt-primary`.
- **Timeline de estado**: círculos conectados por línea; pasos completados en gris/azul suave, paso actual en `--nt-accent`.

## 4. Layout de aplicación (objetivo)

Estructura general de todas las pantallas:

```
┌──────────┬──────────────────────────────────────────┐
│ Sidebar  │ Topbar: ☰  [🔍 Buscador global]   Usuario ▾ │
│ (navy)   ├──────────────────────────────────────────┤
│ logo     │ Título (h1) + subtítulo        [+ Acción]│
│ ítems    │                                          │
│          │ Contenido en tarjetas sobre fondo claro  │
│ ⚙ Config │                                          │
└──────────┴──────────────────────────────────────────┘
```

- **Sidebar**: fijo a la izquierda (~240px), fondo `--nt-navy`, texto claro. Arriba nombre/logo del sistema; ítems con ícono + texto; ítem activo con fondo `--nt-primary` y esquinas redondeadas; "Configuración" anclado abajo.
- **Topbar**: fondo `--nt-surface` con borde inferior azul claro, botón hamburguesa, buscador global central (input redondeado con lupa), usuario a la derecha (avatar + nombre + menú).
- **Encabezado de página**: `h1` con subtítulo gris debajo; acciones primarias a la derecha (`+ Nuevo …`). Opcional: fecha actual en chip a la derecha en dashboards.
- **Dashboard**: fila de 4 tarjetas KPI; debajo dos tarjetas de tabla (p. ej. próximas acciones / recientes) con enlace "Ver todas".
- **Listado**: fila de filtros (búsqueda + selects) sobre tarjeta con tabla; badges de estado; acciones por fila.
- **Detalle**: enlace "← Volver", título + metadatos con íconos, botones de acción a la derecha, tabs (Resumen, …), tarjetas de información y de estado (timeline), tarjeta lateral de contacto/resumen.
- **Formulario / documento con líneas**: datos generales arriba, tabla editable de líneas, panel de resumen lateral con totales (total en fondo `--nt-accent` suave), barra de acciones al pie (secundarias outline, principal azul, confirmar verde).
- **Responsive**: bajo `lg` el sidebar colapsa tras la hamburguesa (offcanvas); tablas con `table-responsive`; KPIs pasan a 2 columnas y luego 1.
- **Componente de layout**: `Web/src/components/LayoutApp.tsx` (sidebar + topbar + `<Outlet />`) usado como ruta padre en `App.tsx`.

`LayoutApp` implementado (2026-10-11). Las pantallas ya no llevan `container py-4`: el área `.nt-contenido` aporta el padding.

## 5. Patrones vigentes

**Página**
- Sin contenedor externo (lo da `LayoutApp`). Encabezado: `div.nt-encabezado` con `h1.h3.mb-0` + `p.nt-encabezado__subtitulo` (gris) y, a la derecha, la acción primaria (`btn btn-primary` con `+ ` en `span[aria-hidden]`). Las pantallas devuelven un fragmento `<>...</>`.
- Secciones agrupadas en `section.card.mb-3` con `card-header` (opcional) y `card-body`.

**Formulario**
- Grid dentro del `card-body`: `row g-3` con columnas `col-md-N`.
- Cada campo: `label.form-label[htmlFor]` + `input.form-control` / `select.form-select` con `id` coincidente. Checkbox con `form-check`.
- Campos calculados o de solo lectura: `disabled readOnly`.
- Acciones al pie en `div.d-flex.gap-2`: Volver (`btn btn-outline-secondary`, con `←`) y Guardar (`btn btn-success`). Iconos decorativos en `span[aria-hidden="true"]`.
- Salir con cambios sin guardar: `window.confirm` con mensaje estándar.
- Guardar con éxito: `navigate(ruta, { state: { mensaje } })`.

**Listado**
- Tarjeta de filtros (`row g-2`, botón `btn btn-primary`) + tarjeta de resultados.
- `+ Nuevo` en el encabezado de página (`btn-primary`); sobre la tabla, Editar `btn btn-outline-primary` y Nueva Medición `btn btn-accent` (§3.3). Tabla dentro de `table-responsive`.
- Tabla `table table-hover align-middle`; fila seleccionada `table-primary` (tinte azul + borde izquierdo); columna Activo con `BadgeEstado` ("Activo" verde / "Inactivo" gris, siempre con texto); selección con radio con `aria-label`.
- Sin resultados: fila `text-center text-muted` ("Sin resultados.").
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
- Pie: acción secundaria `btn-outline-secondary` a la izquierda y principal a la derecha según función (§3.3: guardar/confirmar `btn-success`, crear `btn-primary`).

**Tabla con encabezado fijo**
- Contenedor `table-responsive nt-tabla-scroll` (altura = 11 × `--nt-fila-alto`: encabezado + 10 filas con `table-sm`, `overflow-y: auto`) y `thead th` con `position: sticky; top: 0`, fondo `--nt-table-head`, texto navy. Con `caption.visually-hidden` y fila vacía "Sin resultados.".

**Tabla de captura en una fila**
- Cabeceras `th[scope=col]`, cada input con `aria-label` igual a su cabecera; campos no editables `disabled readOnly`; asterisco `.campo-obligatorio` en la cabecera.

**Mensajes de acción**: en pantallas con barra de acciones al pie, los avisos/errores de guardado se muestran dentro de la tarjeta Acciones (junto al botón que los origina).

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

### Ratios de contraste calculados (WCAG 2.1, 2026-10-11)

| Par (texto / fondo) | Ratio | AA (4.5:1) |
|---|---|---|
| Blanco / `--nt-primary` #1F5FD1 | 5.81 | sí |
| Blanco / primary-hover #1A4FAF | 7.55 | sí |
| Blanco / `--nt-success` #2E9E4F | 3.43 | **no** (no usar con texto blanco) |
| Blanco / `--nt-success-strong` #237A3C | 5.36 | sí |
| Blanco / success-hover #1E6532 | 7.09 | sí |
| Blanco / `--nt-accent` #F28C28 | 2.45 | **no** (no usar) |
| Navy #0F2A5C / `--nt-accent` | 5.68 | sí |
| Navy / accent-hover #F5A04E | 6.65 | sí |
| Navy / accent-active #F7B26E | 7.67 | sí |
| Navy / `--nt-table-head` #E8F0FC | 12.15 | sí |
| Navy / primary-tint #EEF4FD | 12.61 | sí |
| `--nt-text` / primary-soft #E4EDFB | 12.62 | sí |
| `--nt-primary` / primary-soft (hover outline, fila seleccionada) | 4.92 | sí |
| `--nt-primary` / blanco | 5.81 | sí |
| `--nt-primary` / bg #F1F5FC | 5.31 | sí |
| `--nt-text-muted` #5B6A80 / blanco | 5.50 | sí |
| `--nt-text-muted` / bg #F1F5FC | 5.03 | sí |
| `--nt-danger-strong` #B3302C / blanco | 6.22 | sí |
| Badges texto/fondo: verde 5.63, gris 6.43, naranja 5.05, azul 6.49, rojo 6.16 | >= 5.05 | sí |
| Blanco / navy (sidebar) | 13.94 | sí |

## 9. Deuda y pendientes de estandarización

Resuelto (2026-10-11): tokens `--nt-*` y overrides `--bs-*` creados; plantilla Vite limpiada (`index.css`, `App.css` eliminado); `FormularioCliente` estandarizado; Guardar deshabilitado durante el envío; emoji `💾` retirado del formulario.

- Confirmar hex oficiales. Contraste AA verificado en §8; falta calcular el badge ámbar (`#8A5A00` sobre `#FFF3D6`, aún sin uso) y el texto claro con opacidad sobre navy.
Resuelto (2026-10-11, layout): `LayoutApp` implementado y pantallas de Cliente migradas; filtros ya no usan `flex-nowrap`; estilo inline de filas movido a clase CSS.

Resuelto (2026-10-11, color): `BadgeEstado` creado y usado en `ListadoClientes`; botones por función, tablas y tarjetas con color aplicados.

- Sin tarjeta KPI ni dashboard aún; `LayoutApp` conserva `btn-outline-secondary` en la hamburguesa (ahora outline azul).
- Revisión visual manual pendiente en `npm run dev` (Ctrl+F5): `/clientes`, `/clientes/nuevo`, `/clientes/:id/mediciones/nueva` y modales.
- `ListadoClientes`: fila clicable sin acceso por teclado (solo el radio es operable).
- `LayoutApp`: sin atrapar foco dentro del offcanvas abierto; usuario/buscador/Configuración son placeholders; verificar contraste AA de texto claro sobre navy.
- Emoji restantes en `ListadoClientes`: evaluar librería de iconos solo si se aprueba.
- `FormularioCliente` aún usa `window.confirm`; migrar a `ModalConfirmacion` (ya existe).
- `NuevaMedicion`: errores de bloque solo en alerta global (sin `aria-invalid` en la tabla de captura); validar visualmente que el histórico muestra exactamente 10 filas (altura por `--nt-fila-alto` aproximada); iconos de papelera como emoji; sin aviso al cerrar la pestaña con cambios sin guardar; recargar la página tras guardar y volver a guardar da 409 (diseño actual).
- `ListadoClientes` sin estado de carga (lint: warning `set-state-in-effect` en la línea 28, no trivial: `cargar()` hace `setError(null)` síncrono; requiere refactor a hook de datos).
- `FormularioCliente`: errores de validación solo en alerta global; falta `aria-invalid`/feedback por campo.
