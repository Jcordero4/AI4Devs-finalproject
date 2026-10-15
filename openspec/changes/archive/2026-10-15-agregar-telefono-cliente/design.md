## Context

`Cliente` tiene hoy Id, Nombre, FechaNacimiento, Genero, Altura, Email, FechaIngreso y Activo (`Domain/Entities/Cliente.cs`). El US-004 pide una columna "Teléfono" en el listado, pero el change archivado `2026-10-03-crud-cliente` (design.md, decisión 9 y Open Questions) la omitió por no existir el campo en el modelo. Esta change cierra esa pregunta agregando el campo, siguiendo el patrón ya usado por `Email` (opcional, validado con FluentValidation, normalizado en `ServicioCliente`).

Restricciones: Domain sin referencias a EF Core; validación solo en `Application/Validators`; EF Core 8 + Pomelo MySQL 8.x; sin SQL crudo; nombres en español.

## Goals / Non-Goals

**Goals:**
- Guardar y devolver un teléfono opcional por cliente, de forma simple y predecible.
- Rechazar entradas con letras, guiones, espacios u otros símbolos, sin dependencias externas.
- Mostrar el teléfono en el listado y en el formulario de alta/edición.
- Eliminar la discrepancia entre la documentación (US-004, readme) y el código.

**Non-Goals:**
- Normalización E.164, región por defecto o selector de país.
- Extensiones, múltiples teléfonos, búsqueda o filtro por teléfono.
- Hacer el campo obligatorio.

## Decisions

1. **Columna `Telefono` `varchar(15)` nullable.** Igual que `Email` (propiedad `string?`, sin `IsRequired`). Alternativa descartada: guardar en E.164 con `varchar(16)`/`(20)`; el usuario eligió el modelo simple de 15 caracteres.

2. **Formato `^\+?\d{7,15}$` más `MaximumLength(15)`.** Solo dígitos y un `+` inicial opcional; mínimo 7 dígitos. El largo total no puede superar 15, de modo que con `+` caben 14 dígitos y sin `+` hasta 15. El mínimo de 7 dígitos evita entradas claramente incompletas y acepta números locales cortos y líneas gratuitas (800). Alternativas descartadas: libphonenumber (rechazado por el usuario: sin librería externa) y texto libre (no permite validar).

3. **Regex en `ReglasCliente.PatronTelefono`**, junto a `PatronEmail`, usada por `CrearClienteDtoValidator` y `EditarClienteDtoValidator` con la misma forma que la regla de Email (`.When(no vacío)`). Un solo lugar de verdad para el patrón; mensaje: "El teléfono solo admite dígitos y un '+' inicial (7 a 15 caracteres)."

4. **Normalización en `ServicioCliente`.** Se generaliza `LimpiarEmail` a un helper `LimpiarTexto` (trim; vacío o solo espacios → `null`) y se usa para Email y Telefono. Se valida antes de normalizar solo cuando hay contenido, así que un valor con solo espacios no falla y se guarda como `null`.

5. **DTOs.** `Telefono` (`string?`) se agrega a `CrearClienteDto`, `EditarClienteDto`, `ClienteDto` y `ClienteListadoDto`, ubicado junto a Email. Cambio aditivo en el contrato JSON (`telefono`), no breaking para clientes existentes.

6. **Migración aditiva `AgregarTelefonoCliente`.** `AddColumn varchar(15) NULL` en `Clientes`. Las filas existentes quedan con `NULL`. Sin cambios en `RepositorioCliente` (no se filtra por teléfono).

7. **Frontend.** `FormularioCliente` agrega el input junto a Email (`type="tel"`, `inputMode="tel"`, `maxLength=15`), filtra el tecleo para aceptar solo dígitos y `+` únicamente en la primera posición, y valida con el mismo patrón antes de enviar; los errores del API siguen mostrándose en el alert existente. `ListadoClientes` agrega la columna Teléfono (colSpan 5→6). `aCuerpo` en `clienteService.ts` envía `null` si el campo está vacío. La UI se implementa con el subagente `frontend-designer` y el estándar `docs/estandarUI-UX.md`.

## Risks / Trade-offs

- [Límite de 15 caracteres con `+` deja 14 dígitos; un número E.164 de 15 dígitos con `+` no cabe] → aceptado por decisión del usuario; documentado en la spec.
- [Sin normalización, el mismo número puede escribirse con o sin código de país y no se pueden detectar duplicados ni formatear de forma uniforme] → aceptado; fuera de alcance.
- [Regex duplicada en frontend y backend] → el backend manda; el frontend es solo ayuda de usabilidad y se mantiene el mismo patrón.
- [Migración sobre la base de desarrollo con cambios locales sin commitear en snapshot/DbContext] → revisar que la migración generada contenga únicamente `AddColumn` de `Telefono`.

## Migration Plan

1. Generar la migración con `dotnet ef migrations add AgregarTelefonoCliente -p Infrastructure -s API`.
2. Aplicar con `ASPNETCORE_ENVIRONMENT=Development dotnet ef database update` (sin esa variable EF usa Production y lee los placeholders `CHANGE_ME`); las filas existentes quedan con `Telefono = NULL`.
3. MySQL agrega la columna al final de la tabla. Para respetar el orden de la definición de tabla (Altura, Telefono, Email), la migración ejecuta además `ALTER TABLE Clientes MODIFY COLUMN Telefono varchar(15) NULL AFTER Altura` mediante `migrationBuilder.Sql`. Es DDL sin datos de usuario y específico de MySQL; el snapshot de EF no cambia porque no modela el orden físico.
4. Rollback: `dotnet ef database update <migración anterior>` y `dotnet ef migrations remove`; solo se pierde la columna nueva.

## Open Questions

- Ninguna pendiente. El mínimo de 7 dígitos es una decisión de diseño que se puede ajustar en `ReglasCliente.PatronTelefono` si el negocio lo requiere.
