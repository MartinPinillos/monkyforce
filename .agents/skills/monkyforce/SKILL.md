---
name: monkyforce
description: Workflow de desarrollo para Proyecto MonkyForce usando Jira-first, SDD, NestJS, Angular, Oracle, testing y Context7.
---

# MonkyForce Skill

## Objetivo

Aplicar un workflow consistente al analizar, crear, diseñar, implementar, probar y revisar funcionalidades de MonkyForce, manteniendo trazabilidad entre Jira, GitHub y las SPECs.

---

# 1. Antes de comenzar

Leer:

```text
AGENTS.md
KNOWLEDGE.md
ARCHITECTURE.md
ROADMAP.md
```

Si existe una feature activa, leer:

```text
spec/features/NNN-KAN-XX-feature.md
```

`AGENTS.md` es la fuente canónica para las reglas obligatorias del agente. Este Skill describe el workflow operativo y no debe contradecirlo.

No comenzar una implementación importante sin Jira Key real y SPEC, salvo trabajo exploratorio expresamente indicado.

---

# 2. Identificar el tipo de tarea

Clasificar la tarea como:

```text
A. Análisis funcional
B. Nueva feature
C. Modificación de feature
D. Bug
E. Refactor
F. Base de datos
G. Seguridad
H. Testing
I. Infraestructura
J. Revisión
```

Aplicar las mismas reglas arquitectónicas independientemente del tipo.

Una conversación exploratoria no crea automáticamente Cards ni branches. Para una nueva feature, crearlos cuando el usuario haya pedido crear, iniciar o implementar y existan accesos autorizados.

---

# 3. Nueva feature — Jira-first

Workflow:

```text
Requerimiento
     ↓
Buscar Card Jira existente
     ↓
Crear Feature Jira si no existe
     ↓
Obtener KAN-XX real
     ↓
Crear branch desde main
feat/<descripcion>-kan-XX
     ↓
Validar contra KNOWLEDGE
     ↓
Identificar BR-* / OQ-*
     ↓
Crear/actualizar SPEC
spec/features/NNN-KAN-XX-<descripcion>.md
     ↓
PLAN + TASKS
     ↓
Implementar
     ↓
Tests + Builds
     ↓
Pull Request [KAN-XX]
     ↓
Verificar Jira Development
     ↓
Actualizar ROADMAP / Jira
     ↓
Merge solo cuando esté autorizado
```

Reglas:

- no inventar ni predecir Jira Keys;
- el Jira Key debe provenir de Jira;
- para nueva funcionalidad usar tipo Jira `Feature`, salvo que el usuario indique otra cosa o corresponda bug/tarea técnica;
- crear la branch desde `main`;
- branch de feature: `feat/<descripcion>-kan-XX`;
- Jira Key canónico en SPEC, commits, PRs y documentación: `KAN-XX`;
- comprobar Jira Development antes de declarar la feature cerrada;
- no mergear automáticamente salvo autorización explícita o workflow previamente acordado.

Si Jira o GitHub no están disponibles/autorizados, informar exactamente qué paso quedó bloqueado y no simular la operación.

---

# 4. SPEC

La sección SPEC debe definir:

- objetivo;
- problema;
- actores;
- casos funcionales;
- reglas aplicables;
- dependencias;
- criterios de aceptación;
- casos de error;
- fuera de alcance;
- preguntas abiertas.

Formato de archivo:

```text
spec/features/NNN-KAN-XX-<descripcion>.md
```

No incluir detalles técnicos innecesarios en la parte funcional.

---

# 5. PLAN

El Plan debe analizar:

```text
Backend
Frontend
Oracle
Seguridad
Permisos
Transacciones
Concurrencia
Auditoría
Testing
Migraciones
Riesgos
```

No todas las secciones requieren cambios.

Indicar explícitamente:

```text
No aplica
```

cuando corresponda.

---

# 6. TASKS

Las tareas deben ser concretas y verificables.

Ejemplo:

```text
- [ ] Crear migration
- [ ] Crear entity
- [ ] Crear repository
- [ ] Crear service
- [ ] Crear controller
- [ ] Crear DTOs
- [ ] Agregar permisos
- [ ] Crear pantalla Angular
- [ ] Crear service frontend
- [ ] Crear Unit Tests
- [ ] Crear Integration Tests
- [ ] Crear E2E crítico
- [ ] Ejecutar backend build
- [ ] Ejecutar frontend build
- [ ] Ejecutar tests
- [ ] Verificar Jira Development
```

---

# 7. Implementación backend

Antes de crear código:

1. inspeccionar `backend/` y la estructura existente;
2. buscar módulo similar;
3. reutilizar patrón;
4. respetar `ARCHITECTURE.md`.

Flujo esperado:

```text
Controller
↓
Service / Application
↓
Domain cuando aporte valor
↓
Repository
↓
TypeORM / Oracle
```

No saltar capas sin justificación.

---

# 8. Implementación frontend

Antes de crear código:

1. inspeccionar `frontend/` y revisar routing;
2. revisar components reutilizables;
3. revisar services;
4. revisar guards/permisos;
5. revisar manejo de errores;
6. revisar patrones de formularios.

No crear arquitectura paralela.

---

# 9. Base de datos

Antes de modificar Oracle:

1. revisar modelo existente;
2. revisar migrations;
3. revisar constraints;
4. evaluar índices;
5. evaluar impacto en datos existentes;
6. evaluar transacciones y concurrencia cuando corresponda.

No inventar estructuras basadas únicamente en intuición.

---

# 10. Seguridad

Para cualquier endpoint privado evaluar:

- autenticación;
- permisos;
- validación backend;
- errores 401/403 correctos.

Web auth base:

```text
JWT
Set-Cookie
HttpOnly
Secure
SameSite=Lax
```

No almacenar tokens de autenticación en `localStorage` ni `sessionStorage`.

Las decisiones todavía abiertas de refresh token y CSRF deben resolverse en la SPEC correspondiente, no por suposición.

---

# 11. Testing

Por cada feature evaluar:

## Unit

```text
¿Hay reglas?
¿Hay cálculos?
¿Hay estados?
¿Hay validaciones?
¿Hay permisos?
```

Si sí, crear tests.

## Integration

```text
¿Hay endpoint?
¿Hay repository?
¿Hay transacción?
¿Hay seguridad?
¿Hay persistencia Oracle relevante?
```

Si sí, crear tests.

## E2E

```text
¿Es un flujo crítico para usuario?
```

Si sí, agregar Playwright.

No afirmar que un build/test está OK si no se ejecutó.

---

# 12. Bug

Para corregir un bug:

```text
1. identificar/reutilizar Card Jira cuando corresponda
2. reproducir
3. identificar causa
4. agregar test que falle cuando sea viable
5. corregir
6. verificar test
7. ejecutar regresión relevante
8. mantener trazabilidad Jira/GitHub si existe Card asociada
```

Evitar corregir únicamente el síntoma.

---

# 13. Refactor

Un refactor:

- no debe cambiar comportamiento funcional;
- debe mantener tests verdes;
- no debe introducir arquitectura nueva sin necesidad;
- debe justificarse por mantenibilidad, deuda o duplicación real;
- debe mantener trazabilidad Jira si forma parte de una Card.

---

# 14. Context7

Usar Context7 si se necesita verificar:

- APIs de NestJS;
- TypeORM;
- Angular;
- Vitest;
- Playwright;
- versiones;
- comportamiento de librerías.

No usarlo para inventar reglas del negocio.

---

# 15. Pull Request y Jira Development

Antes de cerrar una feature:

1. usar título de PR `[KAN-XX] Título`;
2. reemplazar placeholders `KAN-XX` del template por el Jira Key real;
3. confirmar que branch/commits/PR mantienen trazabilidad;
4. verificar que Jira Development refleje la actividad de GitHub;
5. si la sincronización tarda, no declarar una vinculación inexistente;
6. mergear únicamente si está autorizado;
7. después del merge, verificar el estado final si la feature se declara cerrada.

---

# 16. Finalización

Antes de considerar una feature terminada:

```text
[ ] Card Jira real asociada
[ ] SPEC implementada
[ ] código implementado
[ ] criterios de aceptación cumplidos
[ ] Unit Tests si aplican
[ ] Integration Tests si aplican
[ ] Frontend Tests si aplican
[ ] E2E crítico si aplica
[ ] backend build OK si aplica
[ ] frontend build OK si aplica
[ ] tests OK
[ ] TASKS actualizadas
[ ] ROADMAP actualizado si corresponde
[ ] PR asociado al Jira Key
[ ] Jira Development verificado
[ ] PR mergeado si la feature se declara cerrada
```

---

# 17. Reporte final

Informar:

```text
Jira Key
Branch
SPEC
Pull Request, si existe
Implementado
Archivos modificados
Tests
Builds
Estado Jira Development
Pendientes
Decisiones tomadas
```

No afirmar que algo funciona si no se verificó.

---

# 18. Regla final

La prioridad es:

```text
correctitud
    ↓
trazabilidad
    ↓
claridad
    ↓
mantenibilidad
    ↓
simplicidad
    ↓
optimización
```

No agregar complejidad preventiva.
