# MonkyForce — ROADMAP

> **Estado:** Roadmap inicial  
> **Objetivo:** Mantener visible qué está listo, qué estamos definiendo y qué viene después.

---

# 1. Estado general

```text
Análisis funcional             ✅
Knowledge base                 ✅
Arquitectura técnica           ✅
Instrucciones de agentes       ✅
Workflow Skill                 ✅
Roadmap                        ✅

Monorepo                      ✅
Primera SPEC                   ⬜
Backend foundation             🟡
Frontend foundation            🟡
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

---

# 3. Foundation — siguiente etapa

Antes de desarrollar procesos productivos:

- [x] Crear repositorio único `monkyforce`
- [x] Definir estructura `backend/` + `frontend/`
- [x] Centralizar documentación/configuración global en la raíz
- [x] Configurar npm workspaces
- [ ] Inicializar NestJS
- [ ] Inicializar Angular
- [ ] Fijar versiones Node / NestJS / Angular
- [ ] Configurar TypeScript estricto
- [ ] Configurar lint/format
- [ ] Crear `.env.example`
- [ ] Configurar Docker Compose
- [ ] Levantar Oracle local
- [ ] Configurar TypeORM
- [ ] Validar conexión Oracle
- [ ] Configurar Swagger/OpenAPI
- [ ] Configurar manejo global de errores
- [ ] Configurar logging/correlation ID
- [ ] Configurar Vitest backend
- [ ] Configurar Vitest frontend
- [ ] Configurar Supertest
- [ ] Configurar Playwright
- [ ] Configurar builds iniciales

---

# 4. Primera SPEC recomendada

```text
001-KAN-XX-auth-rbac.md
```

Alcance esperado:

- usuarios;
- login;
- JWT;
- Set-Cookie;
- HttpOnly;
- Secure;
- SameSite=Lax;
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

- [ ] Versión exacta de Oracle
- [ ] UI Library
- [ ] Estrategia completa de refresh token
- [ ] Implementación CSRF
- [ ] Estrategia migrations ambientes superiores
- [ ] Hosting
- [ ] Reverse proxy
- [ ] Modelo físico de auditoría

Estas decisiones deben resolverse cuando la feature o infraestructura correspondiente las necesite.

---

# 9. Criterio de avance

No iniciar varias features funcionales en paralelo sin necesidad.

Preferencia:

```text
Foundation
    ↓
Auth/RBAC
    ↓
Primer flujo productivo
    ↓
Iteraciones verticales completas
```

Cada iteración debe intentar incluir:

```text
DB
Backend
Frontend
Tests
E2E
```

en lugar de construir todas las tablas primero, luego todo el backend y finalmente todo el frontend.

---

# 10. Estado activo

**Próxima tarea recomendada:**

> Crear `spec/features/001-KAN-XX-auth-rbac.md`.

Después:

> crear primero la Feature correspondiente en Jira, obtener `KAN-XX` y continuar la implementación dentro del monorepo.
