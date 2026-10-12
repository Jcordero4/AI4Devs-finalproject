# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

NutriTrack: sistema web de gestión de registros nutricionales. Solución: `NutriTrack.slnx`.

## Fuentes de verdad

- **Comportamiento / requisitos vigentes**: `openspec/specs/*/spec.md`. Leer la spec de la capacidad antes de tocar código. Si código y spec difieren, manda la spec.
- **Stack y arquitectura**: `README.md` (§1.4, §4).
- **Origen de requisitos** (contexto, no contrato): `docs/PRD.md`, `docs/backlog-NutriTrack.md`, `docs/US-004-CRUD-Cliente.md`, `docs/US-008-Medicion-Composicion-Corporal.md`, `docs/US-009-Historial-Progreso-Graficos.md`, `docs/API-Controllers.md`. Si chocan con una spec, manda la spec.
- **Cambios de comportamiento**: pasar por OpenSpec (`/opsx:propose` → `/opsx:apply` → `/opsx:archive`); no editar `openspec/specs/` a mano, se actualiza al archivar/sincronizar el change.

## Comandos

- Build/test .NET: `dotnet build NutriTrack.slnx` / `dotnet test NutriTrack.slnx`
- Un test: `dotnet test Test --filter "FullyQualifiedName~NombreTest"`
- API: `dotnet run --project API` (https://localhost:7054, http://localhost:5167); Swagger UI solo en Development: https://localhost:7054/swagger; health check en `/health`
- Web (en `Web/`): `npm install`, `npm run dev` (:5173), `npm run build`, `npm run lint` (oxlint)

## Arquitectura (N-tier, dependencias en un solo sentido)

`API` → `Application` → `Domain`; `Infrastructure` → `Application`; `API` también referencia `Infrastructure` (solo para DI). `Domain` no referencia nada (cero EF Core). `Web/` es React + TypeScript + Vite, fuera de la solución .NET. Tests en `Test/` (xUnit, `Microsoft.AspNetCore.Mvc.Testing`; `Program` es `public partial` para tests de integración).

- Cada capa registra su DI en `DependencyInjection.cs` (`AddApplication`, `AddInfrastructure(config)`).
- Validación de DTOs con FluentValidation en `Application/Validators`.
- Acceso a datos: EF Core 8 + Pomelo MySQL 8.x (versiones 8.x a propósito aunque el target sea `net10.0`). Solo consultas parametrizadas, sin SQL crudo.
- `API/NutriTrackAPI.csproj` conserva ese nombre aunque el README diga `NutriTrack.Api`.

## Convenciones

- Código, identificadores, docs y commits en **español** (`Cliente`, `Medicion`, `Plan`, `ServicioCliente`, …), como en README §4.8 y las US.
- Rama por entrega: `feature/entrega-N-JJCM`, PR hacia `main`.
- UI/UX en `Web/`: delegar al subagente `frontend-designer` (`.claude/agents/frontend-designer.md`). Estándar y decisiones de diseño en `docs/estandarUI-UX.md` (leer antes, actualizar después).
- Frontend: TypeScript (no JS); llamadas a la API vía `Web/src/services/apiClient.ts` (`credentials: 'include'`, base `VITE_API_URL`).

## Gotchas

- Autenticación JWT/roles está **fuera del MVP** (README §2.3): no agregar JwtBearer salvo que se pida.
- `appsettings.json` solo lleva placeholders (`CHANGE_ME`) en la cadena de conexión; credenciales reales en `API/appsettings.Development.json` (gitignored).
- CORS permite solo `Cors:AllowedOrigins` (por defecto `http://localhost:5173`).
- `docs/NutriTrack_Project_Plan_ESP.docx` está desalineado con el código (JS puro, .NET 8); manda el README.
- Al cambiar stack/estructura, actualizar también `README.md` (git lo rastrea como `readme.md`).