# US-008 — Registro de Medición de la Composición Corporal

## Resumen Ejecutivo
Como nutricionista, quiero registrar una nueva medición de composición corporal para un cliente en cualquier momento, para hacer seguimiento de su progreso físico entre consultas.

## Campos del Catálogo de Medición

| # | Campo | Tipo | Obligatorio | Reglas |
|---|-------|------|:---:|--------|
| 1 | Id | Varchar(15) | Sí | PK compuesta (junto a FechaMedicion). FK a Cliente. |
| 2 | FechaMedicion | Fecha | Sí | PK compuesta (junto a Id). Se autocompleta con la fecha actual, sin hora, formato `dd/MM/yyyy`. No editable. |
| 3 | Peso | Decimal(10,2) | Sí | Valor positivo. |
| 4 | Grasa | Decimal(10,2) | Sí | Porcentaje de grasa corporal. Valor positivo. |
| 5 | MasaMuscular | Decimal(10,2) | Sí | Valor positivo. |
| 6 | Agua | Decimal(10,2) | Sí | Porcentaje de agua corporal. Valor positivo. |
| 7 | GrasaVisceral | Decimal(10,2) | Sí | Valor positivo. |
| 8 | IMC | Decimal(10,2) | Sí | Índice de Masa Corporal. Valor positivo. |

## Campos del Catálogo de Tratamiento

| # | Campo | Tipo | Obligatorio | Reglas |
|---|-------|------|:---:|--------|
| 1 | Id | Varchar(15) | Sí | FK a Medición (una medición puede tener varias filas de tratamiento). |
| 2 | Secuencia | Entero | Sí | PK compuesta junto a Id. Autoincremental por medición; identifica cada fila de tratamiento. |
| 3 | Producto | Varchar(50) | Sí | — |
| 4 | Dosis | Varchar(150) | Sí | — |

> **Corrección:** el catálogo original definía Id como PK y FK a la vez, lo que impide guardar más de una fila de tratamiento por medición aunque la UI permite varias filas ("Nuevo Producto"). Se agrega `Secuencia` para soportar múltiples tratamientos por medición sin perder registros.

## Campos del Catálogo de Plan Nutricional

| # | Campo | Tipo | Obligatorio | Reglas |
|---|-------|------|:---:|--------|
| 1 | Id | Varchar(15) | Sí | PK y FK a Medición (una fila de plan nutricional por medición). |
| 2 | Fecha | Fecha | Sí | Corresponde a la FechaMedicion de la medición asociada; no se captura por separado en la UI. |
| 3 | Lacteo | Entero | Sí | Valor por defecto 0. |
| 4 | Fruta | Entero | Sí | Valor por defecto 0. |
| 5 | Vegetales | Entero | Sí | Valor por defecto 0. |
| 6 | Harinas | Entero | Sí | Valor por defecto 0. |
| 7 | Proteina | Entero | Sí | Valor por defecto 0. |
| 8 | Grasa | Entero | Sí | Valor por defecto 0. |
| 9 | Agua | Entero | Sí | Valor por defecto 0. |

> **Corrección:** el catálogo original no incluía un campo para "Proteínas", aunque la pantalla de Plan de Nutrición sí captura ese valor (fila 5 de la tabla). Se agrega `Proteina` para no perder ese dato al guardar.

## CRUD
Solo permite **crear**: cada medición nueva genera un registro y constituye el histórico de seguimiento del cliente. No hay eliminación de mediciones. Mientras el usuario permanezca en la misma sesión de captura (sin salir de la pantalla), el botón "Guardar" puede volver a presionarse para actualizar la medición del día que aún no se cierra; una vez que el usuario sale de la pantalla, la medición pasa a formar parte del histórico y no es editable desde este US.

## Interfaz de Usuario
La pantalla se accede desde el listado de clientes, agregando a esa pantalla un botón "Nueva Medición" que abre la pantalla "Nueva Medición".

### Pantalla de Nueva Medición
Muestra 3 secciones: Datos Generales, Nueva Medición y Acciones.

**Sección de Datos Generales**
1. Nombre del cliente — no editable.
2. Edad — no editable.
3. Género — no editable.
4. Altura — no editable.

**Sección Nueva Medición**
1. Tabla de captura con los campos: Fecha (fecha actual, sin hora, formato `dd/MM/yyyy`, no editable), Peso, % Grasa, M. Muscular, % Agua, G. Visceral, IMC. Todos los campos excepto Fecha son editables y obligatorios.
2. Debajo, una tabla de histórico con los mismos encabezados, ordenada por fecha de la más reciente a la más antigua. Carga todos los registros del cliente pero muestra solo los primeros 10; el resto se accede con scroll, manteniendo el encabezado fijo (no se pierde al hacer scroll).

**Sección de Acciones**
1. **Botón Volver**: regresa al listado de clientes sin guardar. Si el usuario ya ingresó datos sin guardar, antes de salir muestra confirmación "No se han guardado los cambios. ¿Desea guardarlos?" con botones "Guardar" y "Omitir". "Guardar" almacena los datos en base de datos antes de salir; "Omitir" descarta los datos y sale.
2. **Botón Guardar**: almacena en base de datos la información de la tabla de nueva medición y permanece en la misma pantalla. Si el usuario modifica datos y vuelve a presionar Guardar, actualiza el mismo registro (se mantiene una bandera interna que indica si la medición actual ya fue guardada, para decidir entre insertar o actualizar).
3. **Botón Tratamiento**: abre una ventana modal titulada "Tratamiento":
   - Tabla con encabezados Producto y Dosis. Por defecto muestra una fila editable, con un ícono de basurero en cada fila para eliminarla.
   - Debajo de la tabla: botón "Cerrar" y botón "Nuevo Producto".
   - "Nuevo Producto" agrega una nueva fila editable a la tabla de tratamiento.
   - "Cerrar" oculta la modal, pero no se permite cerrar si hay filas incompletas: se muestra el mensaje "Hay tratamientos sin asignar. Debe asegurarse de que todo esté completo."
   - Al presionar el ícono de eliminar de una fila, se muestra confirmación "¿Está seguro de eliminar éste tratamiento?" con botones "Sí" y "No"; si se confirma, se elimina la fila, de lo contrario se conserva.
4. **Botón Plan de Nutrición**: abre una tabla sin encabezados, de 7 filas fijas y 2 columnas (categoría no editable, valor editable):
   1. Lácteos
   2. Frutas
   3. Vegetales
   4. Harinas
   5. Proteínas
   6. Grasas
   7. Agua

Al presionar Guardar (general) se valida que estén completos los tres bloques: datos de la medición, tratamiento y plan de nutrición. Si falta algún dato en cualquiera de los tres, se informa al usuario y no se guarda. Si todo está completo, se guardan en conjunto los datos del plan de nutrición, el tratamiento y la medición.

## Criterios de Aceptación

### Acceso y datos generales
- **GIVEN** el usuario está en el listado de clientes **WHEN** presiona "Nueva Medición" para un cliente **THEN** se abre la pantalla de Nueva Medición con Nombre, Edad, Género y Altura del cliente precargados y no editables.

### Registro de medición
- **GIVEN** el usuario completó Peso, % Grasa, M. Muscular, % Agua, G. Visceral e IMC **WHEN** presiona "Guardar" **THEN** se crea el registro de medición con la Fecha actual, permanece en la misma pantalla y la bandera de "ya guardado" queda activa para ese registro.
- **GIVEN** falta algún campo obligatorio de la tabla de nueva medición **WHEN** el usuario presiona "Guardar" **THEN** se muestra un mensaje indicando los datos faltantes y no se guarda el registro.
- **GIVEN** la medición actual ya fue guardada en esta sesión (bandera activa) **WHEN** el usuario modifica algún valor y vuelve a presionar "Guardar" **THEN** se actualiza el mismo registro en lugar de crear uno nuevo.
- **GIVEN** existen mediciones previas del cliente **WHEN** se abre la pantalla **THEN** la tabla de histórico las muestra ordenadas de la fecha más reciente a la más antigua, con los primeros 10 registros visibles, scroll para ver el resto y encabezado fijo durante el scroll.

### Botón Volver
- **GIVEN** el usuario no ingresó ni modificó ningún dato **WHEN** presiona "Volver" **THEN** regresa al listado de clientes sin mostrar confirmación.
- **GIVEN** el usuario ingresó o modificó datos sin guardar **WHEN** presiona "Volver" **THEN** se muestra la confirmación "No se han guardado los cambios. ¿Desea guardarlos?" con opciones "Guardar" y "Omitir".
- **GIVEN** se muestra la confirmación de salida **WHEN** el usuario elige "Guardar" **THEN** se almacenan los datos y luego se navega al listado de clientes.
- **GIVEN** se muestra la confirmación de salida **WHEN** el usuario elige "Omitir" **THEN** se descartan los datos ingresados y se navega al listado de clientes.

### Tratamiento (modal)
- **GIVEN** el modal de Tratamiento está abierto **WHEN** el usuario presiona "Nuevo Producto" **THEN** se agrega una nueva fila editable a la tabla de tratamiento.
- **GIVEN** hay filas de tratamiento con Producto o Dosis incompletos **WHEN** el usuario presiona "Cerrar" **THEN** se muestra el mensaje "Hay tratamientos sin asignar. Debe asegurarse de que todo esté completo." y la modal permanece abierta.
- **GIVEN** todas las filas de tratamiento están completas **WHEN** el usuario presiona "Cerrar" **THEN** la modal se oculta.
- **GIVEN** el usuario presiona el ícono de eliminar en una fila de tratamiento **WHEN** confirma con "Sí" en el mensaje "¿Está seguro de eliminar éste tratamiento?" **THEN** la fila se elimina de la tabla.
- **GIVEN** el usuario presiona el ícono de eliminar en una fila de tratamiento **WHEN** confirma con "No" **THEN** la fila se conserva sin cambios.
- **GIVEN** el usuario agregó más de un producto en el tratamiento **WHEN** se guarda la medición **THEN** cada fila se almacena con su propia Secuencia asociada al mismo Id de medición, sin sobrescribir las demás filas.

### Plan de Nutrición
- **GIVEN** el usuario abre la sección de Plan de Nutrición **WHEN** se muestra la tabla **THEN** aparecen las 7 categorías fijas (Lácteos, Frutas, Vegetales, Harinas, Proteínas, Grasas, Agua) con su valor editable correspondiente.
- **GIVEN** el usuario completó las 7 categorías del Plan de Nutrición **WHEN** se guarda la medición **THEN** se almacenan los 9 campos del catálogo (Id, Fecha, Lacteo, Fruta, Vegetales, Harinas, Proteina, Grasa, Agua), incluyendo Proteina.

### Guardado general
- **GIVEN** los datos de medición, tratamiento y plan de nutrición están completos **WHEN** el usuario presiona "Guardar" (general) **THEN** se guardan en conjunto los tres bloques de información.
- **GIVEN** falta algún dato en la medición, el tratamiento o el plan de nutrición **WHEN** el usuario presiona "Guardar" (general) **THEN** se informa al usuario qué bloque está incompleto y no se guarda ninguno de los tres bloques.

## Fuera de Alcance
- Edición o eliminación de mediciones históricas ya cerradas (fuera de la sesión de captura actual).
- Eliminación de registros de medición.
