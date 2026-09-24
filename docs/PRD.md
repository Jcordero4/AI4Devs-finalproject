# NutriTrack — Documento de Requisitos del Producto (PRD)

> Fuente: `docs/NutriTrack_Project_Plan_ESP.docx` (v1.0) — §3 Personas de usuario, §4 Historias de usuario y §7 Plan de sprint.

## Índice

1. [Definición del producto](#1-definición-del-producto)
   - [1.1 Visión](#11-visión)
   - [1.2 Problema](#12-problema)
   - [1.3 Personas de usuario](#13-personas-de-usuario)
   - [1.4 Convenciones](#14-convenciones)
   - [1.5 Resumen de Epics](#15-resumen-de-epics)
2. [Epic 1 — Autenticación y gestión de usuarios](#2-epic-1--autenticación-y-gestión-de-usuarios)
3. [Epic 2 — Gestión de clientes](#3-epic-2--gestión-de-clientes)
4. [Epic 3 — Registro de composición corporal](#4-epic-3--registro-de-composición-corporal)
5. [Epic 4 — Gestión de planes nutricionales](#5-epic-4--gestión-de-planes-nutricionales)
6. [Epic 5 — Panel de control e informes](#6-epic-5--panel-de-control-e-informes)
7. [Trazabilidad US → Sprint](#7-trazabilidad-us--sprint)

---

## 1. Definición del producto

### 1.1 Visión

NutriTrack es un sistema web de gestión de registros nutricionales para que nutricionistas y dietistas administren su cartera de clientes. Centraliza en una plataforma única, segura y fácil de usar:

- Datos demográficos y de contacto de los clientes.
- Métricas de composición corporal y su evolución en el tiempo.
- Planes nutricionales versionados y su historial.
- Informes de progreso exportables a PDF.

### 1.2 Problema

Los nutricionistas trabajan hoy con hojas de cálculo y formularios en papel: los datos están dispersos, son difíciles de rastrear en el tiempo y no existe un panel centralizado para administrar usuarios del sistema.

### 1.3 Personas de usuario

| Persona | Rol | Meta | Punto doloroso | Necesidades |
|---|---|---|---|---|
| **Dra. María Campos** — Nutricionista / Dietista (usuario principal) | Nutricionista certificada | Gestionar de forma eficiente los datos de los clientes y los planes nutricionales desde una única plataforma. | Usa hojas de cálculo y papel; datos dispersos y difíciles de rastrear. | Acceso rápido al historial del cliente, fácil introducción de medidas, creación de planes intuitiva. |
| **Carlos Vargas** — Administrador de sistemas | Administrador de TI | Mantener el sistema, administrar cuentas de usuario y garantizar copias de seguridad fiables. | Sin panel de administración; la gestión de usuarios se hace manualmente en la base de datos. | Panel de administración, CRUD de usuarios, registros de actividad, indicadores de estado del sistema. |

### 1.4 Convenciones

- **Formato de historia:** *Como* [persona] *quiero* [objetivo] *para* [beneficio].
- **Prioridad:** Crítico > Alto > Medio > Bajo.
- **Puntos de historia:** escala Fibonacci (1 trivial · 2 pequeño · 3 medio · 5 grande · 8 extra grande · 13+ épico, debe descomponerse).

### 1.5 Resumen de Epics

| Epic | Nombre | Historias | Puntos | Sprint(s) |
|---|---|---|---|---|
| 1 | Autenticación y gestión de usuarios | US-001, US-002, US-003 | 11 | 1 |
| 2 | Gestión de clientes | US-004, US-005, US-006, US-007 | 16 | 2 |
| 3 | Registro de composición corporal | US-008, US-009, US-010 | 15 | 3, 4 |
| 4 | Gestión de planes nutricionales | US-011, US-012, US-013 | 14 | 3 |
| 5 | Panel de control e informes | US-014, US-015 | 8 | 2, 4 |
| | **Total** | **15 historias** | **64** | |

> **Nota:** US-015 (Filtrado avanzado de clientes) pertenece al Epic 5 en el plan, pero se entrega en el Sprint 2 junto a la lista de clientes. El plan estima "~65 puntos"; la suma exacta de las historias es 64.
>
> **Nota de alcance:** el `README.md` (§2.3) excluye del MVP la autenticación JWT y la autorización por roles. Las historias del Epic 1 se mantienen documentadas para versiones posteriores.

---

## 2. Epic 1 — Autenticación y gestión de usuarios

**Objetivo:** controlar el acceso seguro al sistema y la administración de cuentas de nutricionistas.

| US | Título | Persona | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|
| US-001 | Inicio de sesión del nutricionista | Nutricionista | Crítico | 3 | 1 |
| US-002 | Restablecimiento de contraseña por correo electrónico | Nutricionista | Alto | 3 | 1 |
| US-003 | El administrador gestiona las cuentas de los nutricionistas | Administrador | Alto | 5 | 1 |

### US-001 — Inicio de sesión del nutricionista

- **Como** nutricionista
- **quiero** iniciar sesión en el sistema con mis credenciales
- **para** acceder de forma segura a los datos de mis clientes.

**Prioridad:** Crítico · **Puntos:** 3 · **Sprint:** 1

**Criterios de aceptación**
- [ ] Se muestra un formulario de inicio de sesión con campos de correo electrónico y contraseña.
- [ ] Las credenciales no válidas muestran un mensaje de error claro y específico.
- [ ] El inicio de sesión exitoso redirige al panel principal.
- [ ] El token de sesión caduca después de 8 horas de inactividad.
- [ ] El campo de contraseña está enmascarado, con un interruptor para mostrarlo u ocultarlo.

### US-002 — Restablecimiento de contraseña por correo electrónico

- **Como** nutricionista
- **quiero** restablecer mi contraseña mediante un enlace enviado a mi correo registrado
- **para** recuperar el acceso sin contactar a un administrador.

**Prioridad:** Alto · **Puntos:** 3 · **Sprint:** 1

**Criterios de aceptación**
- [ ] La pantalla de inicio de sesión muestra un enlace "Olvidé mi contraseña".
- [ ] El sistema envía el correo de restablecimiento en un plazo máximo de 60 segundos.
- [ ] El enlace de restablecimiento es válido solo durante 24 horas.
- [ ] La nueva contraseña cumple las reglas de complejidad: 8 o más caracteres, 1 mayúscula y 1 número.
- [ ] Tras el restablecimiento, el usuario es redirigido a la página de inicio de sesión.

### US-003 — El administrador gestiona las cuentas de los nutricionistas

- **Como** administrador
- **quiero** crear, editar y desactivar cuentas de usuario de nutricionistas
- **para** controlar quién tiene acceso al sistema.

**Prioridad:** Alto · **Puntos:** 5 · **Sprint:** 1

**Criterios de aceptación**
- [ ] El panel de administración muestra todas las cuentas con nombre, correo electrónico, rol y estado.
- [ ] El administrador puede crear una cuenta indicando nombre completo, correo electrónico y rol.
- [ ] El administrador puede desactivar una cuenta sin eliminar los datos asociados.
- [ ] Las cuentas desactivadas reciben un error 401 al intentar iniciar sesión.
- [ ] Todos los cambios quedan en el registro de auditoría con fecha, hora e identidad del administrador.

---

## 3. Epic 2 — Gestión de clientes

**Objetivo:** mantener un registro de clientes completo, consultable y actualizado.

| US | Título | Persona | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|
| US-004 | Registrar un nuevo cliente | Nutricionista | Crítico | 5 | 2 |
| US-005 | Ver y buscar en la lista de clientes | Nutricionista | Crítico | 3 | 2 |
| US-006 | Editar datos personales del cliente | Nutricionista | Alto | 3 | 2 |
| US-007 | Ver perfil completo del cliente | Nutricionista | Crítico | 5 | 2 |

### US-004 — Registrar un nuevo cliente

- **Como** nutricionista
- **quiero** registrar un nuevo cliente con sus datos personales y de contacto completos
- **para** tener un perfil de cliente completo y consultable desde la primera visita.

**Prioridad:** Crítico · **Puntos:** 5 · **Sprint:** 2

**Criterios de aceptación**
- [ ] El formulario recopila: nombre completo, documento de identidad, fecha de nacimiento, edad (calculada automáticamente), sexo biológico, altura (cm), teléfono, correo electrónico, dirección, ocupación, contacto de emergencia y notas clínicas.
- [ ] El documento de identidad y el correo electrónico son únicos; se muestra un error claro en caso de duplicado.
- [ ] Los campos obligatorios se validan en el cliente y en el servidor antes de guardar.
- [ ] Al crearse, el cliente recibe un ID de sistema interno.
- [ ] Al guardar correctamente, se redirige a la página de perfil del cliente recién creado.

### US-005 — Ver y buscar en la lista de clientes

- **Como** nutricionista
- **quiero** consultar una lista paginada, con búsqueda y ordenación, de todos los clientes
- **para** localizar rápidamente a cualquier cliente desde cualquier dispositivo.

**Prioridad:** Crítico · **Puntos:** 3 · **Sprint:** 2

**Criterios de aceptación**
- [ ] Columnas de la lista: nombre completo, documento de identidad, edad, teléfono, correo electrónico y fecha de la última visita.
- [ ] La barra de búsqueda filtra la lista en tiempo real por nombre o documento de identidad.
- [ ] Las columnas nombre, edad y última visita se pueden ordenar (ascendente/descendente).
- [ ] La paginación por defecto es de 20 filas; el usuario puede cambiarla a 50 o 100.
- [ ] Al hacer clic en una fila se abre el perfil del cliente.

### US-006 — Editar datos personales del cliente

- **Como** nutricionista
- **quiero** editar cualquier campo del registro personal de un cliente existente
- **para** mantener los datos de los clientes precisos y actualizados.

**Prioridad:** Alto · **Puntos:** 3 · **Sprint:** 2

**Criterios de aceptación**
- [ ] El formulario de edición se precarga con los datos actuales del cliente.
- [ ] Todos los campos son editables excepto el ID de sistema interno.
- [ ] Al guardar se valida la unicidad del documento de identidad y del correo electrónico.
- [ ] Un mensaje de éxito confirma la actualización y los cambios son visibles de inmediato.
- [ ] El registro de auditoría indica quién realizó el cambio y los valores antes y después.

### US-007 — Ver perfil completo del cliente

- **Como** nutricionista
- **quiero** consultar el perfil completo del cliente, con datos personales, historial de medidas corporales y plan nutricional
- **para** tener todo el contexto clínico antes o durante una consulta.

**Prioridad:** Crítico · **Puntos:** 5 · **Sprint:** 2

**Criterios de aceptación**
- [ ] El perfil se organiza en secciones: datos personales, medidas corporales y plan nutricional.
- [ ] La medición de composición corporal más reciente se destaca en la parte superior.
- [ ] El historial de composición corporal se muestra en tabla y en gráfico de líneas de tendencia.
- [ ] Se muestran el nombre y el objetivo del plan nutricional activo, con enlace al detalle.
- [ ] Botones de acción rápida: Agregar medición, Editar plan, Exportar informe.
- [ ] La página carga en menos de 2 segundos con banda ancha estándar.

---

## 4. Epic 3 — Registro de composición corporal

**Objetivo:** registrar y visualizar la evolución física de cada cliente a lo largo de las consultas.

| US | Título | Persona | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|
| US-008 | Registro de medición de la composición corporal | Nutricionista | Crítico | 5 | 3 |
| US-009 | Ver historial de progreso y gráficos | Nutricionista | Alto | 5 | 3 |
| US-010 | Exportar informe de progreso del cliente como PDF | Nutricionista | Medio | 5 | 4 |

### US-008 — Registro de medición de la composición corporal

- **Como** nutricionista
- **quiero** registrar una nueva medición de composición corporal para un cliente en cualquier momento
- **para** hacer seguimiento de su progreso físico entre consultas.

**Prioridad:** Crítico · **Puntos:** 5 · **Sprint:** 3

**Criterios de aceptación**
- [ ] El formulario registra: fecha de medición (por defecto hoy), peso (kg), masa muscular (%), masa grasa (%), nivel de agua (%) y notas opcionales.
- [ ] El IMC se calcula automáticamente con el peso y la altura almacenada del cliente, y se muestra en el formulario.
- [ ] Los campos numéricos validan rangos aceptables (porcentajes 0–100, peso 10–500 kg).
- [ ] La medición se guarda y se añade al historial del cliente.
- [ ] Se muestra una notificación emergente de éxito y el perfil del cliente refleja el nuevo registro.

### US-009 — Ver historial de progreso y gráficos

- **Como** nutricionista
- **quiero** consultar el historial cronológico completo de las mediciones de composición corporal de un cliente
- **para** evaluar su progreso físico y ajustar el plan con base en evidencia.

**Prioridad:** Alto · **Puntos:** 5 · **Sprint:** 3

**Criterios de aceptación**
- [ ] La tabla de historial muestra todos los registros, del más reciente al más antiguo por defecto.
- [ ] Columnas: fecha, peso (kg), % músculo, % grasa, % agua, IMC y notas.
- [ ] Un gráfico de líneas múltiples muestra la tendencia de peso, % músculo y % grasa en el tiempo.
- [ ] El nutricionista puede filtrar por un rango de fechas personalizado.
- [ ] Los registros individuales se pueden editar o eliminar de forma lógica, con cuadro de diálogo de confirmación.

### US-010 — Exportar informe de progreso del cliente como PDF

- **Como** nutricionista
- **quiero** exportar un informe PDF con formato del progreso de un cliente
- **para** entregar un resumen profesional al cliente o al médico remitente.

**Prioridad:** Medio · **Puntos:** 5 · **Sprint:** 4

**Criterios de aceptación**
- [ ] La página de perfil del cliente tiene un botón Exportar.
- [ ] El PDF contiene: encabezado con datos personales, tabla de mediciones más recientes, imagen del gráfico de progreso y resumen del plan nutricional activo.
- [ ] El archivo se nombra `NombreCliente_NutriTrack_AAAAMMDD.pdf`.
- [ ] La generación del PDF termina en 5 segundos o menos.
- [ ] El informe se descarga directamente en el navegador sin cargar otra página.

> En el plan, US-010 aparece dentro del Epic 3 aunque se entrega en el Sprint 4 junto al panel de control.

---

## 5. Epic 4 — Gestión de planes nutricionales

**Objetivo:** crear, versionar y consultar planes nutricionales personalizados por cliente.

| US | Título | Persona | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|
| US-011 | Crear y asignar un plan nutricional | Nutricionista | Crítico | 8 | 3 |
| US-012 | Editar un plan nutricional activo | Nutricionista | Alto | 3 | 3 |
| US-013 | Ver historial del plan | Nutricionista | Medio | 3 | 3 |

### US-011 — Crear y asignar un plan nutricional

- **Como** nutricionista
- **quiero** crear un plan nutricional estructurado y asignarlo como plan activo de un cliente
- **para** que el cliente reciba orientación dietética personalizada y documentada.

**Prioridad:** Crítico · **Puntos:** 8 · **Sprint:** 3

**Criterios de aceptación**
- [ ] El formulario incluye: título, objetivo del tratamiento (pérdida de peso / aumento de masa muscular / mantenimiento / otro), fecha de inicio, fecha de finalización opcional, objetivo calórico diario (kcal), objetivos de macronutrientes (proteínas g / carbohidratos g / grasas g), horario de comidas (desayuno, merienda de la mañana, almuerzo, merienda de la tarde, cena), restricciones dietéticas/alergias y notas generales.
- [ ] Un cliente solo puede tener un plan activo; al crear uno nuevo, el anterior se archiva automáticamente.
- [ ] El nutricionista puede previsualizar el plan antes de guardarlo.
- [ ] El plan es visible en el perfil del cliente inmediatamente después de guardarlo.

### US-012 — Editar un plan nutricional activo

- **Como** nutricionista
- **quiero** modificar los campos del plan nutricional activo de un cliente
- **para** ajustar la orientación dietética según el progreso más reciente del cliente.

**Prioridad:** Alto · **Puntos:** 3 · **Sprint:** 3

**Criterios de aceptación**
- [ ] El formulario de edición se precarga con todos los datos del plan actual.
- [ ] Al guardar se crea una nueva versión y se archiva el estado anterior.
- [ ] El historial de versiones se puede consultar desde la página de detalle del plan.
- [ ] El registro de auditoría guarda autor y marca de tiempo de cada modificación.

### US-013 — Ver historial del plan

- **Como** nutricionista
- **quiero** consultar todos los planes nutricionales anteriores de un cliente en orden cronológico inverso
- **para** comprender el historial completo del tratamiento dietético.

**Prioridad:** Medio · **Puntos:** 3 · **Sprint:** 3

**Criterios de aceptación**
- [ ] La sección de historial lista todos los planes archivados con título, objetivo, rango de fechas y fecha de archivo.
- [ ] Cada entrada se puede expandir en línea para ver el detalle completo del plan.
- [ ] Los planes activos se distinguen visualmente de los archivados (insignia verde frente a gris).
- [ ] No hay límite en la cantidad de planes archivados mostrados.

---

## 6. Epic 5 — Panel de control e informes

**Objetivo:** dar al nutricionista una vista rápida de su cartera y herramientas para segmentarla.

| US | Título | Persona | Prioridad | Puntos | Sprint |
|---|---|---|---|---|---|
| US-014 | Descripción general del panel de control del nutricionista | Nutricionista | Alto | 5 | 4 |
| US-015 | Filtrado avanzado de clientes | Nutricionista | Medio | 3 | 2 |

### US-014 — Descripción general del panel de control del nutricionista

- **Como** nutricionista
- **quiero** ver al iniciar sesión un panel de resumen con las métricas clave de mi cartera de clientes
- **para** identificar de inmediato a los clientes que necesitan atención.

**Prioridad:** Alto · **Puntos:** 5 · **Sprint:** 4

**Criterios de aceptación**
- [ ] Tarjetas de resumen: clientes totales, consultas de esta semana, clientes sin mediciones en los últimos 30 días y clientes nuevos este mes.
- [ ] Cada tarjeta es clicable y enlaza con la lista de clientes filtrada correspondiente.
- [ ] Una sección muestra los 5 clientes registrados más recientemente.
- [ ] Los datos del panel cargan en menos de 2 segundos.

### US-015 — Filtrado avanzado de clientes

- **Como** nutricionista
- **quiero** aplicar filtros avanzados a la lista de clientes, más allá de la búsqueda de texto
- **para** segmentar mi cartera según criterios clínicos o demográficos.

**Prioridad:** Medio · **Puntos:** 3 · **Sprint:** 2

**Criterios de aceptación**
- [ ] Filtros disponibles: rango de edad (mín.–máx.), sexo biológico, objetivo del plan activo y rango de fechas de la última visita.
- [ ] Se pueden combinar varios filtros simultáneamente.
- [ ] Los filtros activos se muestran como chips/etiquetas extraíbles encima de la lista.
- [ ] El estado de los filtros persiste durante la sesión del navegador.
- [ ] Un botón "Borrar todos los filtros" restablece la vista sin filtros.

---

## 7. Trazabilidad US → Sprint

| Sprint | Semanas | Meta | Historias | Epics | Entregables clave |
|---|---|---|---|---|---|
| 1 | 1–2 | Fundación y autenticación | US-001, US-002, US-003 | 1 | Solución .NET con EF Core + MySQL; autenticación JWT de extremo a extremo; CRUD de usuarios (administrador); pipeline de CI; migraciones de base de datos. |
| 2 | 3–4 | Registro de clientes e interfaz de usuario | US-004, US-005, US-006, US-007, US-015 | 2, 5 | Lista, perfil y pantallas de alta/edición de clientes; búsqueda en tiempo real; filtrado avanzado; diseño adaptable. |
| 3 | 5–6 | Composición corporal y planes nutricionales | US-008, US-009, US-011, US-012, US-013 | 3, 4 | Formulario de mediciones; gráfico de tendencias; creación, edición y versionado de planes; historial de planes. |
| 4 | 7–8 | Panel de control, informes y lanzamiento | US-010, US-014 | 3, 5 | Panel con tarjetas KPI; exportación a PDF; manejo de casos excepcionales; 70 % de cobertura de pruebas unitarias; guía de implementación; aprobación UAT. |
