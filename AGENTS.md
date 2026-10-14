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

Distinguir explícitamente entre:

- tests unitarios;
- tests HTTP con mocks/in-memory;
- tests de persistencia real Oracle;
- Playwright con API mockeada;
- E2E full-stack real.

No presentar un test mockeado como validación full-stack.

---

# 9. Definition of Done

Una feature no debe declararse terminada únicamente porque compile.

Para declarar una feature finalizada, según corresponda debe cumplir:

```text
[ ] Card Jira real asociada
[ ] SPEC implementada
[ ] criterios de aceptación cumplidos
[ ] branch asociada al Jira Key
[ ] workspace local en la branch correcta durante la implementación
[ ] Pull Request asociado al Jira Key
[ ] Unit Tests
[ ] Integration Tests
[ ] Frontend Tests
[ ] E2E crítico
[ ] backend build OK
[ ] frontend build OK
[ ] tests OK
[ ] documentación actualizada
[ ] TASKS actualizadas
[ ] revisión de alcance / git diff realizada
[ ] no existen cambios transversales no autorizados
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

Todo trabajo que vaya a implementarse y requiera trazabilidad debe utilizar una Card Jira real antes de comenzar el desarrollo.

Para una nueva funcionalidad, el orden esperado es:

```text
Necesidad / Feature
       ↓
Crear o identificar Card Jira
       ↓
Jira devuelve KAN-XX
       ↓
Detectar sprint activo cuando corresponda
       ↓
Clasificar tipo de trabajo
       ↓
Crear branch desde main
       ↓
Posicionar workspace local en la branch si se va a implementar
       ↓
Crear / actualizar SPEC
       ↓
Revisar alcance y cambios transversales
       ↓
Implementar
       ↓
Tests + Builds
       ↓
Revisar git diff / scope
       ↓
Pull Request
       ↓
Validar Jira Development
       ↓
Merge cuando corresponda
```

Nunca crear una branch usando un Jira Key supuesto.

Nunca predecir un número como `KAN-25`, `KAN-26`, etc.

El Jira Key debe provenir de la respuesta real de Jira.

## 11.2 Tipo de Card Jira

Clasificar primero el trabajo.

Convención por defecto:

```text
Nueva funcionalidad
→ Jira: Feature
→ Git: feat/

Bug
→ Jira: Error
→ Git: fix/

Refactor
→ Jira: Tarea
→ Git: refactor/

Configuración / infraestructura / mantenimiento / documentación técnica
→ Jira: Tarea
→ Git: chore/
```

El usuario puede indicar explícitamente otro tipo.

No transformar una tarea técnica en Feature solo para cumplir una convención.

## 11.3 Sprint

Cuando el usuario indique que una Card debe **iniciarse o implementarse ahora**:

1. consultar si existe un sprint activo del proyecto `KAN`;
2. si existe y el entorno permite modificar el campo Sprint, asignar la Card al sprint activo;
3. si no existe sprint activo, dejar la Card en Backlog;
4. si la Card es solo planificación futura, no incorporarla automáticamente al sprint activo;
5. no inventar nombres o IDs de sprint.

Si el agente no puede modificar el Sprint por limitaciones de acceso o herramienta, debe informarlo y continuar únicamente con los pasos que sí pueda ejecutar.

## 11.4 Automatización Jira → GitHub por el agente

Cuando el usuario indique claramente que quiere **crear, iniciar o implementar** un trabajo, y el agente disponga de acceso autorizado a Jira y GitHub:

1. buscar si ya existe una Card Jira que represente el trabajo;
2. si no existe, crearla en el proyecto `KAN` usando el tipo correspondiente;
3. si se va a trabajar ahora, asignarla al sprint activo cuando corresponda;
4. obtener el Jira Key real devuelto por Jira;
5. seleccionar el prefijo de branch según el tipo de trabajo;
6. crear una branch nueva desde `main`;
7. si el agente opera dentro de un workspace Git local y va a implementar, posicionar el workspace local en esa branch;
8. crear/actualizar la SPEC cuando corresponda;
9. revisar si el PLAN requiere cambios transversales sujetos a autorización;
10. informar al usuario el Jira Key, branch y SPEC creada;
11. continuar con la implementación si esa fue la solicitud.

Si el agente no tiene acceso o autorización a Jira o GitHub:

- no debe simular la operación;
- no debe inventar el Jira Key;
- debe indicar exactamente qué recurso no pudo crear;
- debe pedir intervención manual únicamente para el paso bloqueado.

Una conversación exploratoria del tipo “analicemos”, “qué conviene”, “cómo lo haríamos” o similar **no debe crear automáticamente Cards ni branches** salvo pedido explícito del usuario.

## 11.5 Convención Jira

El Jira Key canónico se escribe en mayúsculas:

```text
KAN-25
```

Usarlo en:

- SPEC;
- commits;
- Pull Requests;
- documentación;
- referencias internas.

## 11.6 Convención de branches

Formato general:

```text
<prefijo>/<descripcion>-kan-XX
```

Prefijos:

```text
feat/       nueva funcionalidad
fix/        corrección de bug
refactor/   refactor sin cambio funcional
chore/      configuración, infraestructura, mantenimiento o documentación técnica
```

Ejemplos:

```text
feat/abm-rollos-kan-25
fix/error-entrega-parcial-kan-31
refactor/repositorio-rollos-kan-32
chore/configurar-ci-kan-33
```

Reglas:

- usar `kebab-case`;
- usar minúsculas en el nombre de branch;
- incluir siempre el Jira Key convertido a minúsculas;
- crear la branch desde `main`;
- no implementar directamente en `main`;
- elegir el prefijo por la naturaleza real del trabajo, no por el tipo de Card únicamente.

El Jira Key canónico sigue siendo `KAN-XX` en mayúsculas fuera del nombre de branch.

## 11.7 Branch local / workspace

Crear una branch remota en GitHub **no cambia automáticamente** la branch activa del clon local.

Si el agente va a modificar código desde un workspace local:

1. comprobar el estado Git actual;
2. crear o recuperar la branch correspondiente;
3. si fue creada remotamente, ejecutar el equivalente a `git fetch`;
4. posicionar el workspace en la branch correcta;
5. verificar la branch activa antes de modificar archivos.

Verificación esperada:

```bash
git branch --show-current
```

Debe devolver la branch asociada al Jira Key.

Nunca comenzar una implementación mientras el workspace continúe en `main`.

Excepción: si el usuario pidió únicamente crear/verificar una Card o branch remota y explícitamente indicó que no se implemente código, no es obligatorio cambiar la branch local.

## 11.8 Convención de commits

Los commits relacionados con una Card deben incluir el Jira Key canónico:

```text
KAN-25 implementar alta de rollos
KAN-25 agregar validaciones de stock
KAN-25 agregar tests de integración
```

No usar `KAN-XX` como placeholder en commits reales.

## 11.9 Convención de Pull Requests

Título:

```text
[KAN-25] ABM Rollos
```

El cuerpo del PR debe reemplazar cualquier placeholder del template por el Jira Key real:

```text
## Jira

- Issue: `KAN-25`
```

Nunca dejar `KAN-XX` en un PR real si ya existe una Card concreta.

## 11.10 Verificación de vinculación

Antes de declarar finalizado un trabajo, verificar que Jira Development refleje correctamente, según corresponda:

- branch;
- commits;
- Pull Request;
- estado del Pull Request.

La sincronización Jira ↔ GitHub puede no ser instantánea.

Si no aparece después de un tiempo razonable:

1. verificar que branch/commit/PR contiene el Jira Key correcto;
2. verificar el repositorio `MartinPinillos/monkyforce`;
3. verificar GitHub for Atlassian;
4. informar el problema antes de declarar éxito.

## 11.11 Merge

El agente no debe mergear automáticamente un Pull Request salvo que:

- el usuario lo pida explícitamente; o
- exista un workflow previamente acordado que autorice el merge automático.

Antes del merge deben estar verificados los criterios que correspondan de la Definition of Done.

Después del merge, si el trabajo se declara cerrado, verificar que Jira Development refleje el PR como mergeado.

No inventar ni forzar transiciones de estado Jira no definidas por el workflow del proyecto.

---

# 12. Flujo de trabajo obligatorio

Cuando se inicia una implementación:

```text
1. Crear o identificar Card Jira
2. Obtener Jira Key real
3. Detectar sprint activo cuando corresponda
4. Clasificar tipo de trabajo
5. Leer documentación relevante
6. Identificar feature/tarea activa
7. Crear branch desde main usando el prefijo correcto
8. Posicionar el workspace local en la branch si se va a implementar
9. Crear o revisar SPEC cuando corresponda
10. Revisar preguntas abiertas
11. Revisar alcance y cambios transversales previstos
12. Inspeccionar backend/frontend afectados
13. Identificar patrón reutilizable
14. Proponer archivos a modificar
15. Implementar
16. Agregar tests
17. Ejecutar builds
18. Ejecutar tests
19. Comparar contra acceptance criteria
20. Revisar git diff y validar scope
21. Crear/actualizar Pull Request con Jira Key
22. Verificar vinculación en Jira Development
23. Actualizar TASKS, Jira y ROADMAP
24. Mergear solo cuando esté autorizado
25. Verificar estado final de Jira/GitHub si el trabajo se cierra
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

1. explicarlo en el PLAN;
2. justificar el motivo;
3. identificar si el cambio es local o transversal;
4. no modificar silenciosamente el patrón;
5. si requiere un cambio transversal, solicitar autorización antes de aplicarlo;
6. si la decisión autorizada es global, actualizar `ARCHITECTURE.md`.

---

# 15. Control de alcance y cambios transversales

Una feature no autoriza cambios globales o transversales únicamente porque faciliten la implementación o permitan pasar tests.

El agente debe mantener el cambio mínimo necesario para cumplir la SPEC.

## 15.1 Cambios que requieren autorización explícita

Antes de realizar cualquiera de los siguientes cambios, detenerse e informar al usuario:

- actualizar cualquier versión de Node.js, TypeScript, Angular, NestJS, TypeORM u Oracle;
- realizar upgrades major de otras dependencias;
- cambiar package manager;
- cambiar configuración global de TypeScript;
- cambiar configuración global de Angular;
- deshabilitar caches, prebundling u optimizaciones globales;
- modificar `docker-compose.yml` por razones no definidas explícitamente en la SPEC;
- modificar configuración de CI/CD;
- cambiar estrategia de migrations;
- cambiar infraestructura global del monorepo;
- introducir una nueva librería arquitectónica;
- cambiar decisiones aceptadas de `ARCHITECTURE.md`;
- realizar cambios de configuración global únicamente para hacer pasar tests.

Para solicitar autorización, informar:

1. archivo que se necesita modificar;
2. motivo concreto;
3. problema que resuelve;
4. impacto sobre backend/frontend/testing/infraestructura;
5. alternativa sin realizar el cambio;
6. qué ocurriría si no se autoriza.

No realizar el cambio hasta recibir autorización.

## 15.2 Dependencias

Agregar una dependencia solamente cuando sea necesaria para la feature y esté justificada en el PLAN.

No actualizar otras dependencias aprovechando la instalación.

Una nueva dependencia runtime debe quedar explícitamente informada en la SPEC/PLAN.

Un cambio en `package-lock.json` es aceptable cuando deriva de una dependencia autorizada, pero no debe utilizarse para introducir upgrades no relacionados.

## 15.3 Configuración de testing

No modificar configuración global de desarrollo o producción únicamente para hacer pasar un test.

Preferir, en este orden:

1. corregir el test;
2. utilizar configuración específica de testing;
3. crear configuración aislada para integration/E2E;
4. solicitar autorización para un cambio global.

Los tests mockeados deben identificarse como tales.

No afirmar “E2E full-stack” si alguna parte crítica del flujo está interceptada o simulada.

## 15.4 Cambios oportunistas

No realizar durante una feature:

- refactors no relacionados;
- limpiezas generales;
- reformatting masivo;
- upgrades preventivos;
- correcciones ajenas a la Card Jira;
- modificaciones “ya que estamos”;
- cambios de infraestructura no requeridos por los criterios de aceptación.

Si se detecta otro problema, reportarlo y crear/recomendar una Card separada.

## 15.5 Verificación antes de commit

Antes de crear cada commit:

1. revisar `git status`;
2. revisar `git diff`;
3. comprobar que cada archivo modificado pertenece al alcance de la Card;
4. identificar cambios transversales;
5. revertir cambios accidentales;
6. verificar que no haya secretos, artefactos o archivos generados innecesarios;
7. solicitar autorización para cambios transversales necesarios.

Nunca ocultar un cambio transversal dentro de una feature funcional.

---

# 16. Context7 MCP

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

# 17. Dependencias externas

Antes de agregar una dependencia:

1. verificar si NestJS/Angular/Node ya resuelven el problema;
2. validar mantenimiento;
3. validar compatibilidad;
4. justificar su necesidad en el PLAN;
5. evitar dependencias que solo ahorren pocas líneas de código;
6. revisar si su incorporación implica cambios transversales sujetos a autorización.

---

# 18. Seguridad

Obligatorio:

- no hardcodear secrets;
- no versionar `.env`;
- no loguear JWT;
- no loguear passwords;
- no exponer stack traces;
- validar permisos en backend;
- CORS restringido;
- cookies seguras;
- protección CSRF según `ARCHITECTURE.md` y la SPEC activa;
- no reabrir o reemplazar decisiones de seguridad ya formalizadas sin una razón documentada y autorización si el cambio es transversal.

---

# 19. Código generado por IA

Debe ser:

- completo;
- coherente con el proyecto;
- compilable;
- tipado;
- testeable;
- alineado con las convenciones existentes;
- limitado al alcance autorizado.

No generar fragmentos aislados si la tarea requiere una implementación completa.

---

# 20. Alcance

Implementar solamente lo definido en la feature activa.

No adelantar funcionalidades del roadmap porque parezcan convenientes.

No crear módulos futuros “por las dudas”.

No ampliar silenciosamente el alcance para resolver problemas secundarios.

Si aparece una necesidad fuera de alcance:

1. reportarla;
2. indicar si bloquea o no;
3. recomendar una Card separada cuando corresponda;
4. no implementarla sin autorización.

---

# 21. Preguntas abiertas

Toda referencia `OQ-*` en `KNOWLEDGE.md` representa una decisión funcional pendiente.

No implementar una interpretación propia de una `OQ-*`.

Si bloquea una feature, debe quedar explícito en su SPEC.

---

# 22. Finalización de una tarea

Al terminar, informar:

- Jira Key asociado;
- branch utilizada;
- Pull Request, si existe;
- archivos creados;
- archivos modificados;
- dependencias agregadas o actualizadas;
- cambios de configuración;
- tests agregados;
- qué tests usan mocks/in-memory y cuáles usan infraestructura real;
- comandos ejecutados;
- resultado de builds/tests;
- criterios cumplidos;
- revisión de alcance realizada;
- cambios transversales autorizados, si hubo;
- estado de vinculación Jira Development cuando corresponda;
- pendientes reales.

No declarar éxito si no se verificó.

No declarar “sin pendientes críticos” sin revisar explícitamente SPEC, TASKS, `git diff`, tests y alcance real de las validaciones.


# Eficiencia de comunicación

El agente debe responder de forma breve, precisa y orientada a resultado.

Por defecto:

- no repetir el pedido del usuario;
- no narrar paso a paso acciones ya ejecutadas;
- no pegar logs completos;
- no pegar archivos completos;
- no enumerar dependencias transitivas salvo que sean relevantes;
- no repetir información presente en Jira, SPEC o PR;
- no explicar decisiones obvias si no existe un problema;
- agrupar resultados similares;
- informar únicamente cambios, verificaciones, bloqueos y decisiones relevantes.

Reporte final por defecto:

1. Jira / branch / PR.
2. Qué se hizo.
3. Tests/builds ejecutados y resultado.
4. Pendientes o bloqueos.

Máximo recomendado: 10-15 líneas salvo que el usuario pida detalle o exista
un problema que requiera explicación.

Si el usuario pide una revisión, priorizar hallazgos accionables:

BLOQUEA
RECOMENDADO
SIN PROBLEMA

No generar análisis extenso de elementos que no requieren acción.
