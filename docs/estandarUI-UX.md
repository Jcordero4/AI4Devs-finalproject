# Estándar UI/UX de NutriTrack

Memoria de diseño del frontend (`Web/`). La mantiene el agente `frontend-designer` (`.claude/agents/frontend-designer.md`): lo **lee antes** de implementar y lo **actualiza después** con patrones y decisiones nuevas. Los humanos también pueden editarlo.

Precedencia: `openspec/specs/` define comportamiento; `README.md` define stack; este documento define cómo se ve y se construye la UI.

## 1. Stack UI

- React 19 + TypeScript + Vite + `react-router-dom`.
- Bootstrap **5.3.8** solo vía CSS: `import 'bootstrap/dist/css/bootstrap.min.css'` en `Web/src/main.tsx`. Sin React-Bootstrap ni otras librerías UI.
- Idioma de UI y código: español.

## 2. Estructura y convenciones

- `Web/src/components/`: componentes y pantallas (`PascalCase.tsx`, export default). Hoy: `LayoutApp.tsx` (sidebar + topbar + `<Outlet />`, ruta padre), `ListadoClientes.tsx`, `FormularioCliente.tsx`.
- `Web/src/hooks/`: hooks reutilizables (vacío por ahora).
- `Web/src/services/`: acceso a API. `apiClient.ts` (base `VITE_API_URL`, `credentials: 'include'`, `ApiError` con `status` y `errores`) y un servicio por entidad (`clienteService.ts`).
- Rutas en `Web/src/App.tsx` (`/clientes`, `/clientes/nuevo`, `/clientes/:id/editar`).
- Tipos de DTO exportados desde el servicio de su entidad.

## 3. Identidad visual y paleta

Referencia: `docs/DisenoSistemasUI-UX.jpeg`. Se toma **solo el estilo visual** (colores, forma de componentes, layout); no la marca, logo ni módulos del mockup. Los hex son **estimados** a partir de la imagen: confirmar valores oficiales y ajustar aquí.

Estilo general: limpio y corporativo, fondo claro, tarjetas blancas con borde fino y esquinas redondeadas (~8px), sombra muy suave, sidebar azul oscuro, acento naranja puntual, tipografía sans-serif legible (la de Bootstrap por defecto).

### 3.1 Tokens de color

| Token | Hex (aprox.) | Uso |
|---|---|---|
| `--nt-navy` | `#0F2A5C` | Fondo del sidebar |
| `--nt-primary` | `#1F5FD1` | Botón primario, ítem activo del menú, enlaces, tabs activas |
| `--nt-accent` | `#F28C28` | Acción destacada secundaria, paso activo de timeline, total resaltado |
| `--nt-success` | `#2E9E4F` | Estados positivos, botón de confirmación, delta positivo |
| `--nt-danger` | `#D9534F` | Eliminar, errores |
| `--nt-warning` | `#E0A100` | Estados pendientes |
| `--nt-bg` | `#F5F7FB` | Fondo de la aplicación |
| `--nt-surface` | `#FFFFFF` | Tarjetas, topbar, tablas |
| `--nt-border` | `#E3E8F0` | Bordes de tarjetas, tablas e inputs |
| `--nt-text` | `#1B2740` | Texto principal |
| `--nt-text-muted` | `#6B7A90` | Subtítulos, placeholders, texto secundario |

Definirlos en `Web/src/index.css` y enlazarlos con Bootstrap sobrescribiendo sus variables (no usar colores sueltos en componentes):

```css
:root {
  --nt-navy: #0F2A5C;
  --nt-primary: #1F5FD1;
  --nt-accent: #F28C28;
  --nt-success: #2E9E4F;
  --nt-danger: #D9534F;
  --nt-warning: #E0A100;
  --nt-bg: #F5F7FB;
  --nt-surface: #FFFFFF;
  --nt-border: #E3E8F0;
  --nt-text: #1B2740;
  --nt-text-muted: #6B7A90;

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

Nota: `.btn-primary` en Bootstrap 5.3 usa variables propias (`--bs-btn-bg`, etc.); definir una clase `.btn-primary` con esas variables en `index.css` para que el azul aplique a botones.

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

- **Botón primario**: relleno `--nt-primary`, texto blanco, esquinas ~6px. Con `+` para crear (`+ Nuevo …`).
- **Botón destacado**: relleno `--nt-accent` (acción clave secundaria, p. ej. generar/crear derivado).
- **Botón confirmar/éxito**: relleno `--nt-success`.
- **Botón secundario**: `btn-outline-secondary` con borde `--nt-border` y texto `--nt-text`.
- **Eliminar**: ícono o botón en `--nt-danger`.
- **Tarjetas**: fondo `--nt-surface`, borde `--nt-border`, radio ~8px, título en negrita, sombra mínima.
- **Inputs**: borde `--nt-border`, radio ~6px, foco con anillo `--nt-primary`; buscador con ícono de lupa a la izquierda.
- **Tablas**: encabezado con fondo `--nt-bg` y texto `--nt-text-muted` en peso medio; filas separadas por línea fina; primera columna identificadora como enlace `--nt-primary`; acciones por fila (ver, editar, ⋯) alineadas a la derecha.
- **Tarjeta KPI**: ícono en cuadro pastel redondeado (tono según métrica), título, cifra grande, subtítulo en `--nt-text-muted`, variación porcentual en verde con flecha.
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
- **Topbar**: fondo `--nt-surface`, botón hamburguesa, buscador global central (input redondeado con lupa), usuario a la derecha (avatar + nombre + menú).
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
- Acciones al pie en `div.d-flex.gap-2`: Volver (`btn btn-outline-secondary`, con `←`) y Guardar (`btn btn-primary`). Iconos decorativos en `span[aria-hidden="true"]`.
- Salir con cambios sin guardar: `window.confirm` con mensaje estándar.
- Guardar con éxito: `navigate(ruta, { state: { mensaje } })`.

**Listado**
- Tarjeta de filtros (`row g-2`, botón `btn btn-primary`) + tarjeta de resultados.
- `+ Nuevo` en el encabezado de página (`btn-primary`); sobre la tabla queda la acción de selección Editar `btn btn-secondary`. Tabla dentro de `table-responsive`.
- Tabla `table table-hover align-middle`; fila seleccionada `table-primary`; selección con radio con `aria-label`.
- Sin resultados: fila `text-center text-muted` ("Sin resultados.").
- Paginación: texto "Página X de Y (N clientes)" + `btn-group` Anterior/Siguiente `btn-outline-secondary`, deshabilitados en los extremos.

**Mensajes**
- Error: `div.alert.alert-danger[role="alert"]`; varios errores, un `div` por mensaje.
- Aviso/éxito: `div.alert.alert-info[role="alert"]` (llega por `location.state.mensaje`).
- Carga: texto "Cargando..." con `role="status"` y spinner.

**Colores de botón**: primario = acción principal (`btn-primary`); crear = `btn-success`; secundaria = `btn-secondary` / `btn-outline-secondary`. Los colores concretos salen de los tokens de §3.1 (primario = azul `--nt-primary`, éxito = verde `--nt-success`); el diseño objetivo usa primario también para `+ Nuevo …` (ver §3.3).

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

## 9. Deuda y pendientes de estandarización

Resuelto (2026-10-11): tokens `--nt-*` y overrides `--bs-*` creados; plantilla Vite limpiada (`index.css`, `App.css` eliminado); `FormularioCliente` estandarizado; Guardar deshabilitado durante el envío; emoji `💾` retirado del formulario.

- Confirmar hex oficiales y verificar contraste AA (texto claro sobre navy, ámbar sobre claro; asterisco `--nt-danger` sobre blanco).
Resuelto (2026-10-11, layout): `LayoutApp` implementado y pantallas de Cliente migradas; filtros ya no usan `flex-nowrap`; estilo inline de filas movido a clase CSS.

- Crear componente `BadgeEstado` con el mapa estado → tono (§3.2).
- `ListadoClientes`: fila clicable sin acceso por teclado (solo el radio es operable).
- `LayoutApp`: sin atrapar foco dentro del offcanvas abierto; usuario/buscador/Configuración son placeholders; verificar contraste AA de texto claro sobre navy.
- Emoji restantes en `ListadoClientes`: evaluar librería de iconos solo si se aprueba.
- `window.confirm` no es accesible/estilizable; evaluar modal Bootstrap.
- `ListadoClientes` sin estado de carga (lint: warning `set-state-in-effect` en la línea 28, no trivial: `cargar()` hace `setError(null)` síncrono; requiere refactor a hook de datos).
- `FormularioCliente`: errores de validación solo en alerta global; falta `aria-invalid`/feedback por campo.
