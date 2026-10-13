# MonkyForce — AGENTS.md

> **Propósito:** Instrucciones obligatorias para cualquier agente de IA que trabaje sobre MonkyForce.

---

# 1. Fuentes de verdad

Antes de modificar código, leer según corresponda:

1. `KNOWLEDGE.md`
   - negocio;
   - conceptos;
   - reglas funcionales;
   - preguntas abiertas.

2. `ARCHITECTURE.md`
   - stack;
   - estructura;
   - seguridad;
   - persistencia;
   - testing;
   - decisiones técnicas.

3. `ROADMAP.md`
   - estado actual;
   - feature activa;
   - próximas prioridades.

4. `spec/features/NNN-JIRAKEY-feature.md`
   - especificación;
   - plan;
   - tareas;
   - criterios de aceptación.

Jerarquía:

```text
SPEC activa
   ↓
KNOWLEDGE.md
   ↓
ARCHITECTURE.md
   ↓
ROADMAP.md
   ↓
fuentes originales / reuniones
```

Una fuente histórica no debe sobreescribir silenciosamente una decisión formalizada posteriormente.

---

# 2. Regla principal

**No inventar reglas de negocio.**

Si falta información:

1. buscarla en la SPEC;
2. revisar `KNOWLEDGE.md`;
3. revisar preguntas `OQ-*`;
4. consultar fuentes originales únicamente si aportan contexto;
5. si sigue sin estar definida, marcarla como pendiente.

Nunca asumir fórmulas textiles, estados, cálculos, equivalencias, relaciones o permisos no documentados.

---

# 3. Arquitectura obligatoria

Backend:

```text
NestJS
TypeScript
TypeORM
node-oracledb
Oracle
```

Frontend:

```text
Angular
TypeScript
```

Testing:

```text
Vitest
Supertest
Playwright
```

Autenticación web:

```text
JWT mediante Set-Cookie
HttpOnly
Secure
SameSite=Lax
```

No guardar JWT en:

```text
localStorage
sessionStorage
```

Consultar `ARCHITECTURE.md` antes de introducir una decisión diferente.

---

# 4. Repositorio único

MonkyForce se desarrolla en un único repositorio:

```text
monkyforce/
├── backend/
└── frontend/
```

La raíz contiene la documentación, SPECs y configuración transversal.

Reglas:

- `backend/` y `frontend/` son aplicaciones independientes;
- no mezclar responsabilidades entre ambas;
- no duplicar documentación global dentro de las aplicaciones;
- la documentación canónica vive en la raíz;
- los cambios de una feature pueden afectar una o ambas aplicaciones dentro del mismo branch/PR;
- un único Jira Key identifica la feature completa, aunque modifique backend y frontend.

---

# 5. Backend — reglas

Flujo esperado:

```text
Controller
    ↓
Service / Application
    ↓
Domain
    ↓
Repository
    ↓
TypeORM / Oracle
```

Reglas:

- Controllers sin lógica de negocio compleja.
- Services coordinan casos de uso.
- Repositories encapsulan persistencia.
- No ejecutar SQL en Controllers.
- No ejecutar SQL directo en Services.
- No exponer entities directamente como contratos HTTP.
- DTOs de entrada deben validarse.
- No devolver errores Oracle crudos.
- Mantener acceso Oracle encapsulado.
- Stored procedures solamente cuando exista una necesidad justificada.
- Toda operación crítica debe analizar transacciones.
- Toda modificación de stock debe analizar concurrencia.

---

# 6. Frontend — reglas

- Organizar por features.
- Usar Angular Router.
- Usar Reactive Forms.
- Usar HttpClient mediante services.
- Signals/RxJS como estrategia inicial de estado.
- No incorporar state managers globales sin necesidad concreta.
- No usar `any` como solución habitual.
- Reutilizar componentes existentes antes de crear nuevos.
- Mantener UI responsive.
- La seguridad real siempre pertenece al backend.
- Guards frontend solo controlan experiencia/navegación.

---

# 7. Oracle

Para desarrollo local, Oracle debe ejecutarse mediante Docker.

No asumir versiones específicas de Oracle sin confirmarlas.

No inventar:

- tablas;
- columnas;
- constraints;
- sequences;
- triggers;
- procedures.

Los cambios de esquema deben ser versionados.

---

# 8. Testing obligatorio

Testing forma parte del desarrollo, no es una fase opcional posterior.

## Unit

Backend:

```text
Vitest
```

Frontend:

```text
Vitest
Angular TestBed
```

Priorizar:

- reglas `BR-*`;
- cálculos;
- validaciones;
- estados;
- permisos;
- casos límite.

## Integration

Backend:

```text
Vitest
Supertest
Nest Testing Module
Oracle de testing cuando corresponda
```

Cubrir:

- endpoints;
- repositories;
- transacciones;
- autenticación;
- autorización;
- persistencia.

## E2E

```text
Playwright
```

Cubrir flujos críticos, no cada detalle visual.

---

# 9. Definition of Done

Una feature no debe declararse terminada únicamente porque compile.

Según corresponda debe cumplir:

```text
[ ] SPEC implementada
[ ] criterios de aceptación cumplidos
[ ] Unit Tests
[ ] Integration Tests
[ ] Frontend Tests
[ ] E2E crítico
[ ] backend build OK
[ ] frontend build OK
[ ] tests OK
[ ] documentación actualizada
```

---

# 10. SDD

Cada feature usa un único archivo:

```text
spec/features/NNN-JIRAKEY-feature.md
```

Estructura mínima:

```text
# NNN — Feature

Estado:

## 1. SPEC
### Objetivo
### Problema
### Actores
### Casos funcionales
### Reglas relacionadas
### Dependencias
### Criterios de aceptación
### Casos de error
### Fuera de alcance
### Preguntas abiertas

## 2. PLAN
### Backend
### Frontend
### Base de datos
### Seguridad
### Testing
### Riesgos

## 3. TASKS
- [ ] ...
```

No implementar una feature importante directamente desde una conversación informal sin formalizar primero su SPEC.

---


## Jira-first

Toda feature nueva debe tener una Card Jira antes de crear su SPEC.

Convención:

```text
Jira
KAN-XX

SPEC
spec/features/NNN-KAN-XX-feature.md

Branch
feature/KAN-XX-feature

Commits
KAN-XX descripción

Pull Request
[KAN-XX] Título
```

Flujo:

1. buscar si la Card Jira ya existe;
2. si no existe, crearla en el proyecto KAN;
3. obtener el Jira Key;
4. crear/actualizar la SPEC usando ese Key;
5. crear un único branch del monorepo para la feature;
6. implementar backend/frontend según la SPEC;
7. incluir el Key en commits y Pull Request;
8. ejecutar tests/build;
9. validar aceptación;
10. actualizar Jira y ROADMAP.

No crear una SPEC de feature nueva sin Jira Key salvo trabajo puramente exploratorio/documental expresamente indicado.

---

# 11. Flujo de trabajo obligatorio

Antes de programar:

```text
1. Crear/identificar Card Jira
2. Leer documentación relevante
3. Identificar feature activa
4. Revisar SPEC
5. Revisar preguntas abiertas
6. Inspeccionar backend/frontend afectados
7. Identificar patrón reutilizable
8. Proponer archivos a modificar
9. Implementar
10. Agregar tests
11. Ejecutar builds
12. Ejecutar tests
13. Comparar contra acceptance criteria
14. Actualizar tareas, Jira y ROADMAP
```

---

# 12. Inspección antes de modificar

Antes de crear:

- módulo;
- service;
- repository;
- DTO;
- guard;
- interceptor;
- componente;
- formulario;
- test;

buscar primero si existe un patrón equivalente en el proyecto.

No crear arquitecturas paralelas.

---

# 13. Cambios arquitectónicos

Si una feature necesita apartarse de `ARCHITECTURE.md`:

1. explicarlo en el Plan;
2. justificar el motivo;
3. no modificar silenciosamente el patrón;
4. si la decisión es global, actualizar `ARCHITECTURE.md`.

---

# 14. Context7 MCP

Usar Context7 para documentación técnica actual de:

- NestJS;
- TypeORM;
- Angular;
- Vitest;
- Playwright;
- librerías externas.

No usar Context7 para definir reglas funcionales de MonkyForce.

```text
KNOWLEDGE / SPEC
→ qué debe hacer el sistema

Context7
→ cómo usar correctamente la tecnología
```

---

# 15. Dependencias externas

Antes de agregar una dependencia:

1. verificar si NestJS/Angular ya resuelven el problema;
2. validar mantenimiento;
3. validar compatibilidad;
4. justificar su necesidad;
5. evitar dependencias que solo ahorren pocas líneas de código.

---

# 16. Seguridad

Obligatorio:

- no hardcodear secrets;
- no versionar `.env`;
- no loguear JWT;
- no loguear passwords;
- no exponer stack traces;
- validar permisos en backend;
- CORS restringido;
- cookies seguras;
- protección CSRF según arquitectura definida.

---

# 17. Código generado por IA

Debe ser:

- completo;
- coherente con el proyecto;
- compilable;
- tipado;
- testeable;
- alineado con las convenciones existentes.

No generar fragmentos aislados si la tarea requiere una implementación completa.

---

# 18. Alcance

Implementar solamente lo definido en la feature activa.

No adelantar funcionalidades del roadmap porque parezcan convenientes.

No crear módulos futuros “por las dudas”.

---

# 19. Preguntas abiertas

Toda referencia `OQ-*` en `KNOWLEDGE.md` representa una decisión funcional pendiente.

No implementar una interpretación propia de una `OQ-*`.

Si bloquea una feature, debe quedar explícito en su SPEC.

---

# 20. Finalización de una tarea

Al terminar, informar:

- archivos creados;
- archivos modificados;
- tests agregados;
- comandos ejecutados;
- resultado de builds/tests;
- criterios cumplidos;
- pendientes reales.

No declarar éxito si no se verificó.
