---
name: monkyforce
description: Workflow de desarrollo para Proyecto MonkyForce usando SDD, NestJS, Angular, Oracle, testing y Context7.
---

# MonkyForce Skill

## Objetivo

Aplicar un workflow consistente al analizar, diseñar, implementar, probar y revisar funcionalidades de MonkyForce.

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
spec/features/NNN-JIRAKEY-feature.md
```

No comenzar implementación importante sin SPEC.

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

---

# 3. Nueva feature

Workflow:

```text
Requerimiento
     ↓
Crear / identificar Feature Jira
     ↓
Obtener KAN-XX
     ↓
Validar contra KNOWLEDGE
     ↓
Identificar reglas BR-*
     ↓
Identificar preguntas OQ-*
     ↓
Crear/actualizar SPEC
     ↓
Crear PLAN
     ↓
Crear TASKS
     ↓
Implementar
     ↓
Tests
     ↓
Build
     ↓
Acceptance Criteria
     ↓
Actualizar ROADMAP
```

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

No incluir detalles técnicos innecesarios.

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
```

---

# 7. Implementación backend

Antes de crear código:

1. inspeccionar `backend/` y la estructura existente;
2. buscar módulo similar;
3. reutilizar patrón;
4. respetar `ARCHITECTURE.md`.

Flujo:

```text
Controller
↓
Service
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
5. evaluar impacto en datos existentes.

No inventar estructuras basadas únicamente en intuición.

---

# 10. Seguridad

Para cualquier endpoint privado:

- autenticación;
- permisos;
- validación backend;
- errores 401/403 correctos.

Web auth:

```text
JWT
Set-Cookie
HttpOnly
Secure
SameSite=Lax
```

No almacenar token en localStorage.

---

# 11. Testing

Por cada feature evaluar:

## Unit

```text
¿Hay reglas?
¿Hay cálculos?
¿Hay estados?
¿Hay validaciones?
```

Si sí, crear tests.

## Integration

```text
¿Hay endpoint?
¿Hay repository?
¿Hay transacción?
¿Hay seguridad?
```

Si sí, crear tests.

## E2E

```text
¿Es un flujo crítico para usuario?
```

Si sí, agregar Playwright.

---

# 12. Bug

Para corregir un bug:

```text
1. reproducir
2. identificar causa
3. agregar test que falle
4. corregir
5. verificar test
6. ejecutar regresión relevante
```

Evitar corregir únicamente el síntoma.

---

# 13. Refactor

Un refactor:

- no debe cambiar comportamiento funcional;
- debe mantener tests verdes;
- no debe introducir arquitectura nueva sin necesidad;
- debe justificarse por mantenibilidad, deuda o duplicación real.

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

# 15. Finalización

Antes de considerar una tarea terminada:

```text
[ ] código implementado
[ ] Unit Tests
[ ] Integration Tests
[ ] E2E si aplica
[ ] backend build OK
[ ] frontend build OK
[ ] tests OK
[ ] acceptance criteria cumplidos
[ ] TASKS actualizadas
[ ] ROADMAP actualizado si corresponde
```

---

# 16. Reporte final

Informar:

```text
Implementado
Archivos modificados
Tests
Build
Pendientes
Decisiones tomadas
```

No afirmar que algo funciona si no se verificó.

---

# 17. Regla final

La prioridad es:

```text
correctitud
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
