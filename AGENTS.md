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

4. `spec/features/NNN-KAN-XX-feature.md`
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

MonkyForce se desarrolla en un único repositorio GitHub:

```text
MartinPinillos/monkyforce
```

Estructura principal:

```text
monkyforce/
├── backend/
├── frontend/
├── spec/
├── docs/
├── .agents/
├── .github/
├── AGENTS.md
├── KNOWLEDGE.md
├── ARCHITECTURE.md
└── ROADMAP.md
```

Reglas:

- `backend/` y `frontend/` son aplicaciones independientes dentro del mismo monorepo;
- no mezclar responsabilidades entre ambas;
- no duplicar documentación global dentro de las aplicaciones;
- la documentación canónica vive en la raíz;
- una feature puede modificar backend, frontend, base de datos, infraestructura y documentación dentro del mismo branch/PR;
- un único Jira Key identifica la feature completa;
- los antiguos repositorios separados de backend/frontend no son la fuente canónica del proyecto;
- no implementar features directamente sobre `main`.

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

Para declarar una feature finalizada, según corresponda debe cumplir:

```text
[ ] Card Jira real asociada
[ ] SPEC implementada
[ ] criterios de aceptación cumplidos
[ ] branch asociada al Jira Key
[ ] Pull Request asociado al Jira Key
[ ] Unit Tests
[ ] Integration Tests
[ ] Frontend Tests
[ ] E2E crítico
[ ] backend build OK
[ ] frontend build OK
[ ] tests OK
[ ] documentación actualizada
[ ] Jira Development refleja correctamente la actividad de GitHub
[ ] PR mergeado, si la feature se declara cerrada
```

No marcar una feature como terminada si no se verificó lo que corresponda.

---

# 10. SDD

Cada feature usa un único archivo:

```text
spec/features/NNN-KAN-XX-feature.md
```

Ejemplo:

```text
spec/features/003-KAN-25-abm-rollos.md
```

`NNN` representa el orden interno de las SPECs.

`KAN-XX` representa la identidad real de la Card Jira y no debe inventarse ni predecirse.

Estructura mínima:

```text
# NNN — Feature

Estado:
Jira: KAN-XX

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

# 11. Jira + GitHub — flujo obligatorio

El proyecto Jira de MonkyForce usa la clave:

```text
KAN
```

La integración Jira ↔ GitHub está basada en el Jira Key.

## 11.1 Regla Jira-first

Toda feature nueva que se vaya a implementar debe tener primero una Card Jira real.

Orden obligatorio:

```text
Necesidad / Feature
       ↓
Crear Card Jira
       ↓
Jira devuelve KAN-XX
       ↓
Crear branch desde main
       ↓
Crear / actualizar SPEC
       ↓
Implementar
       ↓
Tests + Builds
       ↓
Pull Request
       ↓
Validar Jira Development
       ↓
Merge cuando corresponda
```

Nunca crear una branch de feature usando un Jira Key supuesto.

Nunca predecir un número como `KAN-25`, `KAN-26`, etc.

El Jira Key debe provenir de la respuesta real de Jira.

## 11.2 Automatización Jira → GitHub por el agente

Cuando el usuario indique claramente que quiere **crear, iniciar o implementar una nueva feature**, y el agente disponga de acceso autorizado a Jira y GitHub, el agente debe ejecutar el flujo sin pedir al usuario que haga manualmente pasos que puede realizar:

1. buscar si ya existe una Card Jira que represente la feature;
2. si no existe, crear una Card en el proyecto `KAN`;
3. para una nueva funcionalidad, usar el tipo Jira `Feature`, salvo que el usuario indique otro tipo o la tarea sea claramente un bug/tarea técnica;
4. obtener el Jira Key real devuelto por Jira;
5. crear una branch nueva desde `main` usando ese Jira Key;
6. crear/actualizar la SPEC con el mismo Jira Key;
7. informar al usuario el Jira Key, branch y SPEC creados;
8. continuar con la implementación si esa fue la solicitud del usuario.

Si el agente no tiene acceso o autorización a Jira o GitHub:

- no debe simular la operación;
- no debe inventar el Jira Key;
- debe indicar exactamente qué recurso no pudo crear;
- debe pedir intervención manual únicamente para el paso bloqueado.

Una conversación exploratoria del tipo “analicemos”, “qué conviene”, “cómo lo haríamos” o similar **no debe crear automáticamente Cards ni branches** salvo pedido explícito del usuario.

## 11.3 Convención Jira

Para una feature real:

```text
Jira Key canónico
KAN-25
```

El Jira Key canónico se escribe en mayúsculas en:

- SPEC;
- commits;
- Pull Requests;
- documentación;
- referencias internas.

## 11.4 Convención de branches

Para features:

```text
feat/<descripcion>-kan-XX
```

Reglas:

- usar `kebab-case`;
- usar minúsculas en el nombre de branch;
- incluir siempre el Jira Key convertido a minúsculas;
- crear la branch desde `main`;
- no implementar la feature directamente en `main`.

Ejemplo:

```text
Jira
KAN-25

Branch
feat/abm-rollos-kan-25
```

Esta convención de branch usa `kan-25` en minúsculas; el Jira Key canónico sigue siendo `KAN-25`.

## 11.5 Convención de commits

Los commits relacionados con una Card deben incluir el Jira Key canónico cuando corresponda:

```text
KAN-25 implementar alta de rollos
KAN-25 agregar validaciones de stock
KAN-25 agregar tests de integración
```

No usar `KAN-XX` como placeholder en commits reales.

## 11.6 Convención de Pull Requests

Título:

```text
[KAN-25] ABM Rollos
```

El cuerpo del PR debe reemplazar cualquier placeholder del template por el Jira Key real:

```text
## Jira

- Issue: `KAN-25`
```

Nunca dejar en un PR real:

```text
KAN-XX
```

si ya existe una Card concreta.

## 11.7 Verificación de vinculación

Antes de declarar finalizada una feature, verificar que Jira Development refleje correctamente, según corresponda:

- branch;
- commits;
- Pull Request;
- estado del Pull Request.

La sincronización Jira ↔ GitHub puede no ser instantánea. No inventar una vinculación si todavía no aparece.

Si no aparece después de un tiempo razonable:

1. verificar que la branch/commit/PR contiene el Jira Key correcto;
2. verificar que el repositorio correcto es `MartinPinillos/monkyforce`;
3. verificar la integración GitHub for Atlassian;
4. informar el problema antes de declarar éxito.

## 11.8 Merge

El agente no debe mergear automáticamente un Pull Request salvo que:

- el usuario lo pida explícitamente; o
- exista un workflow previamente acordado que autorice el merge automático.

Antes del merge deben estar verificados los criterios que correspondan de la Definition of Done.

Después del merge, si la feature se declara cerrada, verificar que Jira Development refleje el PR como mergeado.

No inventar ni forzar transiciones de estado Jira no definidas por el workflow del proyecto.

---

# 12. Flujo de trabajo obligatorio

Cuando se inicia una implementación de feature:

```text
1. Crear o identificar Card Jira
2. Obtener Jira Key real
3. Leer documentación relevante
4. Identificar feature activa
5. Crear branch desde main con Jira Key
6. Crear o revisar SPEC
7. Revisar preguntas abiertas
8. Inspeccionar backend/frontend afectados
9. Identificar patrón reutilizable
10. Proponer archivos a modificar
11. Implementar
12. Agregar tests
13. Ejecutar builds
14. Ejecutar tests
15. Comparar contra acceptance criteria
16. Crear/actualizar Pull Request con Jira Key
17. Verificar vinculación en Jira Development
18. Actualizar TASKS, Jira y ROADMAP
19. Mergear solo cuando esté autorizado
20. Verificar estado final de Jira/GitHub si la feature se cierra
```

Para bugs, refactors, infraestructura o documentación, adaptar el flujo sin inventar pasos funcionales innecesarios, manteniendo la trazabilidad Jira cuando exista una Card asociada.

---

# 13. Inspección antes de modificar

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

# 14. Cambios arquitectónicos

Si una feature necesita apartarse de `ARCHITECTURE.md`:

1. explicarlo en el Plan;
2. justificar el motivo;
3. no modificar silenciosamente el patrón;
4. si la decisión es global, actualizar `ARCHITECTURE.md`.

---

# 15. Context7 MCP

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

# 16. Dependencias externas

Antes de agregar una dependencia:

1. verificar si NestJS/Angular ya resuelven el problema;
2. validar mantenimiento;
3. validar compatibilidad;
4. justificar su necesidad;
5. evitar dependencias que solo ahorren pocas líneas de código.

---

# 17. Seguridad

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

# 18. Código generado por IA

Debe ser:

- completo;
- coherente con el proyecto;
- compilable;
- tipado;
- testeable;
- alineado con las convenciones existentes.

No generar fragmentos aislados si la tarea requiere una implementación completa.

---

# 19. Alcance

Implementar solamente lo definido en la feature activa.

No adelantar funcionalidades del roadmap porque parezcan convenientes.

No crear módulos futuros “por las dudas”.

---

# 20. Preguntas abiertas

Toda referencia `OQ-*` en `KNOWLEDGE.md` representa una decisión funcional pendiente.

No implementar una interpretación propia de una `OQ-*`.

Si bloquea una feature, debe quedar explícito en su SPEC.

---

# 21. Finalización de una tarea

Al terminar, informar:

- Jira Key asociado;
- branch utilizada;
- Pull Request, si existe;
- archivos creados;
- archivos modificados;
- tests agregados;
- comandos ejecutados;
- resultado de builds/tests;
- criterios cumplidos;
- estado de vinculación Jira Development cuando corresponda;
- pendientes reales.

No declarar éxito si no se verificó.
