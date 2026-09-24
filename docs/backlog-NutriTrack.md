# Backlog NutriTrack — Listo para Linear

> **Nota de alcance (heredada del PRD §1.5):** Epic 1 completo (US-001, US-002, US-003) está documentado en el PRD pero **excluido del MVP actual** según `README.md` §2.3 (autenticación JWT y autorización por roles se sacan de esta entrega). Se incluye abajo tal como el PRD lo mantiene, marcado `post-MVP`, para no perder trazabilidad — el humano decide si crear estos issues ahora o en backlog futuro.
>
> No se generan stories para: apps móviles nativas, integración con labs/wearables, generación de planes por IA, módulo de pago, i18n — todas explícitamente fuera de alcance en README §2.3 y ausentes del PRD.

## EPICS

| Epic | Hipótesis de producto |
|---|---|
| **1. Autenticación y gestión de usuarios** *(post-MVP)* | Controlar acceso seguro reduce riesgo de datos de clientes expuestos y da al admin control de cuentas sin tocar la BD directamente. |
| **2. Gestión de clientes** | Centralizar datos de clientes reemplaza hojas de cálculo/papel, reduciendo tiempo de búsqueda y error de datos dispersos. |
| **3. Registro de composición corporal** | Historial estructurado de mediciones permite decisiones clínicas basadas en evidencia en vez de memoria/notas sueltas. |
| **4. Gestión de planes nutricionales** | Versionado de planes da trazabilidad del tratamiento dietético y evita perder el histórico al editar. |
| **5. Panel de control e informes** | Vista agregada + filtros dan al nutricionista priorización rápida de qué clientes atender. |

---

## Epic 1 — Autenticación y gestión de usuarios *(post-MVP — no crear issues de sprint actual)*

### US-001 — Inicio de sesión del nutricionista
> Como nutricionista, quiero iniciar sesión en el sistema con mis credenciales, para acceder de forma segura a los datos de mis clientes.

**Acceptance Criteria**
- Given usuario no autenticado en pantalla de login, When carga la página, Then ve formulario con campos correo y contraseña.
- Given credenciales inválidas, When envía el formulario, Then el sistema muestra error claro y específico sin iniciar sesión. *(error case)*
- Given credenciales válidas, When envía el formulario, Then es redirigido al panel principal.
- Given sesión iniciada, When transcurren 8 horas de inactividad, Then el token caduca y exige reautenticación.
- Given formulario visible, When el usuario acciona el interruptor mostrar/ocultar, Then el campo contraseña alterna enmascarado/texto plano.

**Technical Context:** —

**Labels:** `module:auth`, `type:feature`, `size:S`

**Estimation Hint:** S (PRD: 3 pts)
Formulario + validación + manejo de sesión son patrones estándar bien acotados. Sin dependencias de otros módulos aún no construidos.

---

### US-002 — Restablecimiento de contraseña por correo electrónico
> Como nutricionista, quiero restablecer mi contraseña mediante un enlace enviado a mi correo registrado, para recuperar el acceso sin contactar a un administrador.

**Acceptance Criteria**
- Given pantalla de login, When se visualiza, Then muestra enlace "Olvidé mi contraseña".
- Given solicitud de restablecimiento con correo registrado, When se envía, Then el correo llega en máximo 60 segundos.
- Given enlace con más de 24 horas de antigüedad, When se intenta usar, Then el sistema lo rechaza como expirado. *(edge case)*
- Given nueva contraseña que no cumple 8+ caracteres, 1 mayúscula y 1 número, When se intenta guardar, Then se rechaza mostrando las reglas.
- Given restablecimiento exitoso, When se completa, Then redirige a la página de login.

**Technical Context:** —

**Labels:** `module:auth`, `type:feature`, `size:S`

**Estimation Hint:** S (PRD: 3 pts)
Depende de servicio SMTP externo (integración simple) más validación de complejidad de contraseña. Riesgo bajo, alcance cerrado.

---

### US-003 — El administrador gestiona las cuentas de los nutricionistas
> Como administrador, quiero crear, editar y desactivar cuentas de usuario de nutricionistas, para controlar quién tiene acceso al sistema.

**Acceptance Criteria**
- Given panel de administración, When se accede, Then muestra todas las cuentas con nombre, correo, rol y estado.
- Given nombre completo, correo y rol completados, When el admin guarda, Then se crea la cuenta.
- Given cuenta activa con datos asociados, When el admin la desactiva, Then queda inactiva sin borrar datos asociados.
- Given cuenta desactivada, When ese usuario intenta iniciar sesión, Then recibe error 401. *(edge case)*
- Given cualquier cambio sobre una cuenta, When se guarda, Then el log de auditoría registra fecha, hora e identidad del admin.

**Technical Context:** —

**Labels:** `module:auth`, `type:feature`, `size:M`

**Estimation Hint:** M (PRD: 5 pts)
CRUD + soft-delete + auditoría son tres piezas distintas coordinadas en un solo flujo; más superficie que un CRUD simple.

---

## Epic 2 — Gestión de clientes

### US-004 — Registrar un nuevo cliente
> Como nutricionista, quiero registrar un nuevo cliente con sus datos personales y de contacto completos, para tener un perfil de cliente completo y consultable desde la primera visita.

**Acceptance Criteria**
- Given el formulario de alta, When el nutricionista completa nombre, documento, fecha de nacimiento, sexo, altura, teléfono, correo, dirección, ocupación, contacto de emergencia y notas, Then la edad se calcula automáticamente desde la fecha de nacimiento.
- Given un documento o correo ya registrado, When intenta guardar, Then el sistema muestra error claro de duplicado y no crea el registro. *(edge case)*
- Given campos obligatorios vacíos, When intenta guardar, Then la validación en cliente y servidor bloquea el guardado.
- Given creación exitosa, When se confirma, Then el cliente recibe un ID de sistema interno.
- Given guardado exitoso, When se completa, Then se redirige al perfil del cliente recién creado.

**Technical Context:** —

**Labels:** `module:clients`, `type:feature`, `size:M`

**Estimation Hint:** M (PRD: 5 pts)
Formulario largo (11+ campos) + doble validación de unicidad (documento y correo) + validación cliente/servidor duplicada.

---

### US-005 — Ver y buscar en la lista de clientes
> Como nutricionista, quiero consultar una lista paginada, con búsqueda y ordenación, de todos los clientes, para localizar rápidamente a cualquier cliente desde cualquier dispositivo.

**Acceptance Criteria**
- Given la lista de clientes, When se carga, Then muestra nombre, documento, edad, teléfono, correo y última visita, paginada a 20 filas por defecto.
- Given la barra de búsqueda, When el nutricionista escribe nombre o documento, Then la lista filtra en tiempo real.
- Given columnas ordenables (nombre, edad, última visita), When se hace clic en el encabezado, Then ordena ascendente/descendente.
- Given la paginación, When el nutricionista la cambia, Then puede elegir 50 o 100 filas.
- Given una fila sin resultados de búsqueda, When no hay coincidencias, Then la lista se muestra vacía sin error. *(edge case, asumido — el PRD no especifica el estado vacío explícitamente)*

**Technical Context:** —

**Labels:** `module:clients`, `type:feature`, `size:S`

**Estimation Hint:** S (PRD: 3 pts)
Tabla con paginación, búsqueda y orden son patrones de UI estándar; sin lógica de negocio compleja.

---

### US-006 — Editar datos personales del cliente
> Como nutricionista, quiero editar cualquier campo del registro personal de un cliente existente, para mantener los datos de los clientes precisos y actualizados.

**Acceptance Criteria**
- Given un cliente existente, When se abre el formulario de edición, Then se precarga con los datos actuales.
- Given el formulario de edición, When se visualiza, Then todos los campos son editables excepto el ID de sistema interno.
- Given un documento o correo modificado que ya pertenece a otro cliente, When se guarda, Then el sistema rechaza el cambio por duplicado. *(edge case)*
- Given cambios válidos, When se guardan, Then se muestra mensaje de éxito y los cambios son visibles de inmediato.
- Given un cambio guardado, When se registra, Then el log de auditoría indica autor y valores antes/después.

**Technical Context:** —

**Labels:** `module:clients`, `type:feature`, `size:S`

**Estimation Hint:** S (PRD: 3 pts)
Reutiliza el formulario de alta (US-004) con precarga; la validación de unicidad ya existe como concepto del módulo.

---

### US-007 — Ver perfil completo del cliente
> Como nutricionista, quiero consultar el perfil completo del cliente, con datos personales, historial de medidas corporales y plan nutricional, para tener todo el contexto clínico antes o durante una consulta.

**Acceptance Criteria**
- Given un cliente, When el nutricionista abre su perfil, Then ve secciones de datos personales, medidas corporales y plan nutricional.
- Given medidas registradas, When se carga el perfil, Then la medición más reciente se destaca arriba.
- Given historial de composición corporal, When se visualiza, Then se muestra en tabla y en gráfico de líneas de tendencia.
- Given un plan activo, When se visualiza el perfil, Then se muestran nombre y objetivo del plan con enlace al detalle.
- Given un cliente sin mediciones ni plan aún, When se abre su perfil, Then las secciones correspondientes se muestran vacías sin error. *(edge case, asumido)*
- Given banda ancha estándar, When se abre el perfil, Then carga en menos de 2 segundos.

**Technical Context:** —

**Labels:** `module:clients`, `type:feature`, `size:M`

**Estimation Hint:** M (PRD: 5 pts)
Agrega datos de tres módulos (cliente, mediciones, planes) en una sola vista; depende de que US-008/US-011 existan para no quedar vacía en la práctica.

---

## Epic 3 — Registro de composición corporal

### US-008 — Registro de medición de la composición corporal
> Como nutricionista, quiero registrar una nueva medición de composición corporal para un cliente en cualquier momento, para hacer seguimiento de su progreso físico entre consultas.

**Acceptance Criteria**
- Given el formulario de nueva medición, When se abre, Then la fecha por defecto es hoy y pide peso, % músculo, % grasa, % agua y notas opcionales.
- Given peso ingresado y altura almacenada del cliente, When se completa el peso, Then el IMC se calcula y muestra automáticamente.
- Given un valor fuera de rango (porcentaje fuera de 0–100 o peso fuera de 10–500 kg), When se intenta guardar, Then el sistema rechaza el valor con mensaje de validación. *(edge case)*
- Given datos válidos, When se guarda, Then la medición se añade al historial del cliente.
- Given guardado exitoso, When se completa, Then se muestra notificación de éxito y el perfil refleja el nuevo registro.

**Technical Context:** —

**Labels:** `module:measurements`, `type:feature`, `size:M`

**Estimation Hint:** M (PRD: 5 pts)
Cálculo derivado (IMC) + validación de rangos numéricos + dependencia de altura almacenada del cliente (US-004).

---

### US-009 — Ver historial de progreso y gráficos
> Como nutricionista, quiero consultar el historial cronológico completo de las mediciones de composición corporal de un cliente, para evaluar su progreso físico y ajustar el plan con base en evidencia.

**Acceptance Criteria**
- Given un cliente con mediciones, When se abre el historial, Then lista todos los registros del más reciente al más antiguo por defecto.
- Given la tabla de historial, When se visualiza, Then muestra fecha, peso, % músculo, % grasa, % agua, IMC y notas.
- Given los registros históricos, When se visualizan, Then un gráfico de líneas múltiples muestra tendencia de peso, % músculo y % grasa.
- Given el historial, When se aplica un rango de fechas personalizado, Then tabla y gráfico se filtran a ese rango.
- Given un registro existente, When se edita o elimina, Then se pide confirmación y la eliminación es lógica, no física. *(edge case)*

**Technical Context:** —

**Labels:** `module:measurements`, `type:feature`, `size:M`

**Estimation Hint:** M (PRD: 5 pts)
Gráfico multi-línea + filtro de rango de fechas + soft-delete con confirmación son tres piezas de complejidad media combinadas.

---

### US-010 — Exportar informe de progreso del cliente como PDF
> Como nutricionista, quiero exportar un informe PDF con formato del progreso de un cliente, para entregar un resumen profesional al cliente o al médico remitente.

**Acceptance Criteria**
- Given el perfil de un cliente, When se visualiza, Then existe un botón "Exportar".
- Given el botón Exportar activado, When se genera el PDF, Then contiene encabezado con datos personales, tabla de mediciones recientes, imagen del gráfico de progreso y resumen del plan activo.
- Given el PDF generado, When se nombra, Then sigue el formato `NombreCliente_NutriTrack_AAAAMMDD.pdf`.
- Given un cliente sin mediciones o sin plan activo, When se exporta, Then el PDF se genera igual, mostrando esas secciones vacías o con aviso. *(edge case, asumido)*
- Given la solicitud de exportación, When se procesa, Then termina en 5 segundos o menos.
- Given el PDF listo, When se completa, Then se descarga directamente en el navegador sin cargar otra página.

**Technical Context:** —

**Labels:** `module:measurements`, `type:feature`, `size:M`

**Estimation Hint:** M (PRD: 5 pts)
Generación de PDF con gráfico embebido + restricción de performance (5s) + dependencia de datos de mediciones y planes ya existentes.

---

## Epic 4 — Gestión de planes nutricionales

### US-011 — Crear y asignar un plan nutricional
> Como nutricionista, quiero crear un plan nutricional estructurado y asignarlo como plan activo de un cliente, para que el cliente reciba orientación dietética personalizada y documentada.

**Acceptance Criteria**
- Given un cliente sin plan activo, When el nutricionista completa título, objetivo, fechas, objetivo calórico, macros (proteínas/carbohidratos/grasas), horario de comidas, restricciones/alergias y notas, Then puede guardar el plan.
- Given un cliente con un plan activo existente, When se crea un nuevo plan, Then el plan anterior se archiva automáticamente. *(edge case)*
- Given el formulario completo, When el nutricionista solicita previsualización, Then puede ver el plan antes de guardarlo.
- Given un plan guardado, When se confirma, Then es visible en el perfil del cliente de inmediato.

**Technical Context:** —

**Labels:** `module:plans`, `type:feature`, `size:L`

**Estimation Hint:** L (PRD: 8 pts) — no requiere `needs-splitting`: 8 pts está bajo el umbral de 13+ que el propio PRD define para descomposición obligatoria.
Formulario más grande del sistema (10+ campos incl. sub-entidad horario de comidas) + regla de archivado automático del plan previo + previsualización antes de persistir.

---

### US-012 — Editar un plan nutricional activo
> Como nutricionista, quiero modificar los campos del plan nutricional activo de un cliente, para ajustar la orientación dietética según el progreso más reciente del cliente.

**Acceptance Criteria**
- Given un plan activo, When se abre el formulario de edición, Then se precarga con todos los datos actuales.
- Given cambios guardados, When se confirma la edición, Then se crea una nueva versión y se archiva el estado anterior.
- Given versiones anteriores, When se consulta el detalle del plan, Then el historial de versiones es visible.
- Given cualquier modificación, When se guarda, Then el registro de auditoría guarda autor y marca de tiempo. *(edge case — trazabilidad de cambios)*

**Technical Context:** —

**Labels:** `module:plans`, `type:feature`, `size:S`

**Estimation Hint:** S (PRD: 3 pts)
Reutiliza el formulario de US-011 con precarga; la lógica de versionado ya se construyó en US-011 (archivar plan previo).

---

### US-013 — Ver historial del plan
> Como nutricionista, quiero consultar todos los planes nutricionales anteriores de un cliente en orden cronológico inverso, para comprender el historial completo del tratamiento dietético.

**Acceptance Criteria**
- Given un cliente con planes archivados, When se abre la sección de historial, Then lista todos en orden cronológico inverso con título, objetivo, rango de fechas y fecha de archivo.
- Given una entrada del historial, When se expande, Then muestra el detalle completo del plan en línea.
- Given planes activos y archivados, When se visualizan, Then se distinguen visualmente (insignia verde vs. gris).
- Given un cliente sin planes archivados aún, When se abre el historial, Then se muestra vacío sin error. *(edge case, asumido)*
- Given una cantidad grande de planes archivados, When se visualiza el historial, Then no hay límite de cantidad mostrada.

**Technical Context:** —

**Labels:** `module:plans`, `type:feature`, `size:S`

**Estimation Hint:** S (PRD: 3 pts)
Solo lectura sobre datos ya versionados por US-012; la complejidad principal (versionado) ya está resuelta aguas arriba.

---

## Epic 5 — Panel de control e informes

### US-014 — Descripción general del panel de control del nutricionista
> Como nutricionista, quiero ver al iniciar sesión un panel de resumen con las métricas clave de mi cartera de clientes, para identificar de inmediato a los clientes que necesitan atención.

**Acceptance Criteria**
- Given el nutricionista inicia sesión, When accede al panel, Then ve tarjetas de clientes totales, consultas de esta semana, clientes sin mediciones en 30 días y clientes nuevos este mes.
- Given una tarjeta de resumen, When se hace clic, Then navega a la lista de clientes filtrada correspondiente.
- Given el panel, When se carga, Then muestra los 5 clientes registrados más recientemente.
- Given una cartera sin datos aún (0 clientes), When se carga el panel, Then las tarjetas muestran 0 sin error. *(edge case, asumido)*
- Given banda ancha estándar, When se carga el panel, Then los datos cargan en menos de 2 segundos.

**Technical Context:** —

**Labels:** `module:dashboard`, `type:feature`, `size:M`

**Estimation Hint:** M (PRD: 5 pts)
Agrega 4 métricas calculadas sobre datos de clientes/mediciones ya existentes + navegación cruzada a listas filtradas + restricción de performance.

---

### US-015 — Filtrado avanzado de clientes
> Como nutricionista, quiero aplicar filtros avanzados a la lista de clientes, más allá de la búsqueda de texto, para segmentar mi cartera según criterios clínicos o demográficos.

> **Nota de trazabilidad (del PRD §1.5):** clasificada en Epic 5 pero se entrega junto a la lista de clientes en Sprint 2 (Epic 2).

**Acceptance Criteria**
- Given la lista de clientes, When se abren filtros avanzados, Then puede filtrar por rango de edad, sexo biológico, objetivo del plan activo y rango de fechas de última visita.
- Given varios filtros disponibles, When se aplican, Then pueden combinarse simultáneamente.
- Given filtros activos, When se aplican, Then se muestran como chips/etiquetas extraíbles encima de la lista.
- Given filtros aplicados, When el nutricionista navega dentro de la misma sesión del navegador, Then el estado persiste.
- Given filtros activos, When se pulsa "Borrar todos los filtros", Then la vista vuelve al estado sin filtros. *(edge case)*

**Technical Context:** —

**Labels:** `module:dashboard`, `type:feature`, `size:S`

**Estimation Hint:** S (PRD: 3 pts)
Extiende la lista de US-005 con filtros combinables + persistencia en sesión; sin nueva entidad de datos.

---

## Resumen

- 5 epics, 15 stories, 64 puntos totales (PRD §1.5).
- 0 stories marcadas `needs-splitting` (máximo 8 pts, bajo el umbral 13+ del PRD).
- Epic 1 (3 stories, 11 pts) flageado post-MVP — humano decide si crear esos issues ahora o diferirlos.
- Listo para pasar a Linear MCP tras revisión humana.
