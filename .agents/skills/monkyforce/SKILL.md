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

# 3. Jira-first y creación de branches

Para cualquier trabajo que vaya a implementarse:

```text
Requerimiento
     ↓
Buscar Card Jira existente
     ↓
Crear Card Jira si no existe
     ↓
Obtener KAN-XX real
     ↓
Detectar sprint activo cuando corresponda
     ↓
Clasificar tipo de trabajo
     ↓
Crear branch desde main
     ↓
Posicionar workspace local en la branch si se va a implementar
     ↓
Validar KNOWLEDGE / BR-* / OQ-*
     ↓
Crear/actualizar SPEC cuando corresponda
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

Convención de Jira y branch:

```text
Nueva funcionalidad
Jira: Feature
Branch: feat/<descripcion>-kan-XX

Bug
Jira: Error
Branch: fix/<descripcion>-kan-XX

Refactor
Jira: Tarea
Branch: refactor/<descripcion>-kan-XX

Configuración / infraestructura / mantenimiento / documentación técnica
Jira: Tarea
Branch: chore/<descripcion>-kan-XX
```

Reglas:

- no inventar ni predecir Jira Keys;
- el Jira Key debe provenir de Jira;
- usar `kebab-case` y minúsculas en branches;
- incluir siempre `kan-XX` en la branch;
- crear la branch desde `main`;
- elegir el prefijo por la naturaleza real del trabajo;
- Jira Key canónico en SPEC, commits, PRs y documentación: `KAN-XX`;
- comprobar Jira Development antes de declarar el trabajo cerrado;
- no mergear automáticamente salvo autorización explícita o workflow previamente acordado.

Sprint:

- si el usuario pide iniciar/implementar ahora, detectar el sprint activo;
- asignar la Card al sprint activo cuando exista y la herramienta lo permita;
- si no hay sprint activo, dejarla en Backlog;
- no incorporar automáticamente al sprint tareas creadas solo para planificación futura.

Workspace local:

- una branch creada remotamente no cambia la branch activa local;
- si se va a implementar desde el workspace local, hacer fetch/switch según corresponda;
- verificar la branch activa antes de modificar código;
- no implementar mientras el workspace siga en `main`;
- si la solicitud era solo crear/verificar Jira + branch remota sin código, no hace falta cambiar la branch local.

Para nueva funcionalidad, crear la SPEC con formato:

```text
spec/features/NNN-KAN-XX-<descripcion>.md
```

Si Jira o GitHub no están disponibles/autorizados, informar exactamente qué paso quedó bloqueado y no simular la operación.


# 4. Control de scope y cambios transversales

Antes de implementar y antes de cada commit:

1. revisar qué archivos se prevé modificar;
2. validar que cada cambio pertenece a la Card y a la SPEC;
3. detectar modificaciones globales o transversales;
4. mantener el cambio mínimo necesario;
5. solicitar autorización antes de aplicar cambios transversales restringidos.

Requieren aprobación previa:

- cualquier cambio de versión de Node.js, TypeScript, Angular, NestJS, TypeORM u Oracle;
- upgrades major de otras dependencias;
- cambios globales de `tsconfig`;
- cambios globales de `angular.json`;
- cambios en `docker-compose.yml` no definidos explícitamente en la SPEC;
- cambios de CI/CD;
- cambio de package manager;
- cambios globales de migrations/infraestructura;
- deshabilitar cache, prebundle u optimizaciones globales;
- nuevas librerías arquitectónicas;
- cambios a decisiones aceptadas de `ARCHITECTURE.md`.

Antes de pedir autorización informar:

```text
Archivo
Motivo
Problema que resuelve
Impacto
Alternativa sin el cambio
Qué ocurre si no se autoriza
```

No realizar el cambio hasta recibir autorización.

No aprovechar una feature para:

- refactors no relacionados;
- upgrades preventivos;
- limpiezas generales;
- reformatting masivo;
- correcciones de otras Cards;
- cambios “ya que estamos”.

Si aparece otro problema, reportarlo como pendiente o recomendar una Card separada.

## Testing y configuración global

Si un test requiere un cambio global, intentar en este orden:

1. corregir el test;
2. usar configuración específica de testing;
3. crear configuración aislada para integration/E2E;
4. solicitar autorización para modificar configuración global.

No presentar Playwright con API mockeada como E2E full-stack.

Distinguir siempre:

```text
Unit
HTTP con mocks/in-memory
Persistencia Oracle real
Frontend unit/integration
Playwright con API mock
E2E full-stack real
```

## Antes de commit

Ejecutar:

```text
git status
git diff
```

y verificar:

- todos los archivos pertenecen al scope;
- no hay cambios accidentales;
- no hay upgrades no autorizados;
- no hay secretos;
- no hay artefactos generados innecesarios;
- todo cambio transversal necesario fue autorizado.

---

# 5. SPEC

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

# 6. PLAN

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
Dependencias
Cambios de configuración
Cambios transversales
Riesgos
```

No todas las secciones requieren cambios.

Indicar explícitamente:

```text
No aplica
```

cuando corresponda.

Si el PLAN detecta un cambio sujeto a autorización por `AGENTS.md`, detenerse antes de aplicarlo.

---

# 7. TASKS

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
- [ ] Revisar git diff / alcance
- [ ] Verificar Jira Development
```

---

# 8. Implementación backend

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

# 9. Implementación frontend

Antes de crear código:

1. inspeccionar `frontend/` y revisar routing;
2. revisar components reutilizables;
3. revisar services;
4. revisar guards/permisos;
5. revisar manejo de errores;
6. revisar patrones de formularios.

No crear arquitectura paralela.

---

# 10. Base de datos

Antes de modificar Oracle:

1. revisar modelo existente;
2. revisar migrations;
3. revisar constraints;
4. evaluar índices;
5. evaluar impacto en datos existentes;
6. evaluar transacciones y concurrencia cuando corresponda.

No inventar estructuras basadas únicamente en intuición.

---

# 11. Seguridad

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

Seguir las decisiones vigentes de `ARCHITECTURE.md` y la SPEC activa para refresh token, CSRF y RBAC. No reemplazar una decisión de seguridad ya formalizada sin justificarla y solicitar autorización cuando el cambio sea transversal.

---

# 12. Testing

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

Clasificar correctamente la cobertura como mock/in-memory, infraestructura real o full-stack real.

No afirmar que un build/test está OK si no se ejecutó.

No afirmar que existe validación full-stack si backend, Oracle o API fueron simulados.

---

# 13. Bug

Branch por defecto:

```text
fix/<descripcion>-kan-XX
```

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

# 14. Refactor

Branch por defecto:

```text
refactor/<descripcion>-kan-XX
```

Un refactor:

- no debe cambiar comportamiento funcional;
- debe mantener tests verdes;
- no debe introducir arquitectura nueva sin necesidad;
- debe justificarse por mantenibilidad, deuda o duplicación real;
- debe mantener trazabilidad Jira si forma parte de una Card.

---

# 15. Context7

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

# 16. Pull Request y Jira Development

Antes de cerrar una feature:

1. usar título de PR `[KAN-XX] Título`;
2. reemplazar placeholders `KAN-XX` del template por el Jira Key real;
3. confirmar que branch/commits/PR mantienen trazabilidad;
4. revisar nuevamente `git diff` contra `main`;
5. confirmar que no existen cambios transversales no autorizados;
6. verificar que Jira Development refleje la actividad de GitHub;
7. si la sincronización tarda, no declarar una vinculación inexistente;
8. mergear únicamente si está autorizado;
9. después del merge, verificar el estado final si la feature se declara cerrada.

---

# 17. Finalización

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
[ ] cobertura clasificada correctamente: mock vs real vs full-stack
[ ] backend build OK si aplica
[ ] frontend build OK si aplica
[ ] tests OK
[ ] TASKS actualizadas
[ ] ROADMAP actualizado si corresponde
[ ] git diff revisado
[ ] scope validado
[ ] no existen cambios transversales no autorizados
[ ] PR asociado al Jira Key
[ ] Jira Development verificado
[ ] PR mergeado si la feature se declara cerrada
```

---

# 18. Reporte final

Informar:

```text
Jira Key
Branch
SPEC
Pull Request, si existe
Implementado
Archivos modificados
Dependencias agregadas/actualizadas
Cambios de configuración
Tests
Qué tests usan mocks/in-memory
Qué tests usan infraestructura real
Si existe o no E2E full-stack real
Builds
Estado Jira Development
Cambios transversales autorizados
Pendientes
Decisiones tomadas
```

No afirmar que algo funciona si no se verificó.

No afirmar “no quedan pendientes críticos” sin revisar SPEC, TASKS, `git diff`, tests y alcance real de las validaciones.

---

# 19. Regla final

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

## Comunicación eficiente

Durante la ejecución no emitir reportes intermedios innecesarios.

Al finalizar, responder de forma compacta.

No incluir:

- logs completos;
- diffs completos;
- contenido completo de archivos;
- árboles completos de dependencias;
- explicación repetida de reglas ya presentes en AGENTS.md/SPEC.

Expandir detalles solo cuando:

- exista un bloqueo;
- exista una decisión que requiera autorización;
- falle una validación;
- el usuario solicite más detalle.
