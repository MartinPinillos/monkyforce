# MonkyForce — ROADMAP

> **Estado:** Roadmap actualizado — monorepo + Jira/GitHub  
> **Objetivo:** Mantener visible qué está listo, qué está configurado, qué falta validar y qué viene después.

---

# 1. Estado general

```text
Análisis funcional             ✅
Knowledge base                 ✅
Arquitectura técnica           ✅
Instrucciones de agentes       ✅
Workflow Skill                 ✅
Roadmap                        ✅
Monorepo                       ✅
Integración Jira ↔ GitHub      ✅ validada con KAN-6 / PR #1
Foundation configurada         🟡 pendiente validación runtime completa
Primera SPEC funcional         ⬜
Primera feature funcional      ⬜
```

---

# 2. Documentación base

## Completado

- [x] `KNOWLEDGE.md`
- [x] `ARCHITECTURE.md`
- [x] `AGENTS.md`
- [x] `.agents/skills/monkyforce/SKILL.md`
- [x] `ROADMAP.md`
- [x] `README.md`
- [x] Convención Jira-first
- [x] Convención de branch `feat/<descripcion>-kan-XX`
- [x] Integración GitHub for Atlassian validada

---

# 3. Foundation — estado actual

Ya existe en el starter:

- [x] Repositorio único `MartinPinillos/monkyforce`
- [x] Estructura `backend/` + `frontend/`
- [x] Documentación/configuración global en la raíz
- [x] npm workspaces
- [x] NestJS inicializado
- [x] Angular inicializado
- [x] Versiones base fijadas (`.nvmrc` y `package.json`)
- [x] TypeScript estricto backend/frontend
- [x] Prettier global
- [x] Lint backend con Oxlint
- [ ] Definir/configurar lint frontend si se considera necesario
- [x] `.env.example` raíz y backend
- [x] Docker Compose para Oracle
- [x] TypeORM configurado
- [x] Swagger/OpenAPI configurado
- [x] ValidationPipe global
- [x] Manejo global de errores base
- [x] Correlation ID base
- [ ] Completar estrategia de logging estructurado
- [x] Vitest backend
- [x] Vitest frontend
- [x] Supertest
- [x] Playwright

Pendiente de validación real en entorno local:

- [ ] Ejecutar `npm install`
- [ ] Levantar Oracle con `npm run db:up`
- [ ] Validar creación/configuración del usuario Oracle de aplicación
- [ ] Validar conexión NestJS → Oracle
- [ ] Ejecutar build backend
- [ ] Ejecutar build frontend
- [ ] Ejecutar unit tests
- [ ] Ejecutar integration tests aplicables
- [ ] Ejecutar smoke/E2E base

No marcar estos puntos como completos únicamente porque exista la configuración en el repositorio.

---

# 4. Primera feature recomendada — Auth / RBAC

La primera feature funcional propuesta sigue siendo Auth / RBAC, pero el orden obligatorio es Jira-first.

```text
Crear Feature Jira: Auth / RBAC
        ↓
Jira devuelve KAN-XX real
        ↓
Crear branch desde main
feat/auth-rbac-kan-xx
        ↓
Crear SPEC
spec/features/001-KAN-XX-auth-rbac.md
        ↓
Implementar
```

Alcance esperado:

- usuarios;
- login;
- JWT;
- `Set-Cookie`;
- `HttpOnly`;
- `Secure`;
- `SameSite=Lax`;
- roles;
- permisos;
- guards;
- autorización backend;
- logout;
- estrategia de refresh token;
- protección CSRF;
- tests.

Esta feature deberá cerrar varias decisiones pendientes de arquitectura antes de implementarse.

---

# 5. Features funcionales preliminares

El orden es preliminar y puede cambiar después del relevamiento.

```text
001 Auth / RBAC
002 Telas
003 Rollos y stock de tela
004 Prendas y composición
005 Tizadas
006 Programación y cortes
007 Talleres
008 Producción y entregas parciales
009 Control de calidad y fallas
010 Estampado
011 Avíos e insumos
012 Mermas
013 Proveedores
014 Remitos / movimientos
015 Logística / cadetería
016 Costos
017 Métricas y estadísticas
018 Integraciones
```

El número interno `NNN` no reemplaza al Jira Key. Cada feature real deberá utilizar su `KAN-XX` asignado por Jira.

---

# 6. MVP preliminar

El MVP deberá priorizar:

- autenticación y permisos;
- telas;
- rollos;
- prendas;
- tizadas;
- cortes;
- talleres;
- producción;
- entregas parciales;
- control de calidad básico;
- historial/trazabilidad mínima.

El alcance definitivo debe ajustarse con nueva información del negocio.

---

# 7. Información pendiente del cliente

Todavía se espera obtener:

- acceso de lectura al sistema actual;
- Excel de control de cortes;
- Excel de producción;
- Excel de stock de rollos;
- Excel maestro de envíos;
- calculadores de avíos;
- fórmulas;
- ejemplos de remitos;
- ejemplos de controles;
- reglas de mermas;
- mayor definición de roles;
- métricas necesarias.

Consultar `KNOWLEDGE.md` para `OQ-*`.

---

# 8. Decisiones técnicas todavía pendientes

- [ ] Versión exacta/objetivo de Oracle para ambientes del proyecto
- [ ] UI Library
- [ ] Estrategia completa de refresh token
- [ ] Implementación CSRF
- [ ] Estrategia de migrations en ambientes superiores
- [ ] Hosting
- [ ] Reverse proxy
- [ ] Modelo físico de auditoría
- [ ] Estrategia completa de logging estructurado

Las versiones base de Node/NestJS/Angular ya quedaron fijadas en el starter; si cambian, `.nvmrc` y `package.json` son la fuente técnica canónica.

---

# 9. Criterio de avance

No iniciar varias features funcionales en paralelo sin necesidad.

Preferencia:

```text
Validar foundation local
    ↓
Auth/RBAC
    ↓
Primer flujo productivo
    ↓
Iteraciones verticales completas
```

Cada iteración debe intentar incluir:

```text
Jira + SPEC
DB
Backend
Frontend
Tests
E2E crítico
PR + Jira Development
```

en lugar de construir todas las tablas primero, luego todo el backend y finalmente todo el frontend.

---

# 10. Estado activo

**Próxima tarea recomendada:**

> Validar el foundation del starter en entorno local ejecutando instalación, Oracle, conexión, builds y tests base.

Una vez validado el foundation:

> Crear la Feature Jira de Auth / RBAC, obtener el `KAN-XX` real, crear la branch `feat/auth-rbac-kan-xx` y recién entonces crear `spec/features/001-KAN-XX-auth-rbac.md`.
