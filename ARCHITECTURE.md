# MonkyForce — ARCHITECTURE

> **Estado:** Base v4 — monorepo + Jira/GitHub  
> **Objetivo:** Definir la arquitectura técnica base de MonkyForce.  
> **Fuente funcional:** `KNOWLEDGE.md`  
> Este documento define **cómo se construirá técnicamente MonkyForce**.  
> Las reglas de negocio pertenecen a `KNOWLEDGE.md` y a las especificaciones SDD de cada feature.

---

# 1. Visión arquitectónica

MonkyForce será una aplicación web responsive de gestión de producción textil.

La solución estará compuesta por **un único repositorio GitHub** que contendrá dos aplicaciones independientes:

```text
monkyforce/
├── backend/
└── frontend/
```

El repositorio funcionará como **monorepo liviano**: backend y frontend compartirán documentación, especificaciones, configuración transversal y workflow de desarrollo, pero mantendrán sus propios `package.json`, build y tests.

El backend será responsable de:

- reglas de aplicación;
- persistencia;
- seguridad;
- autorización;
- auditoría;
- integraciones;
- exposición de API REST.

El frontend será responsable de:

- interfaz web responsive;
- navegación;
- formularios;
- experiencia de usuario;
- visualización de datos;
- interacción con la API.

La base de datos será Oracle.

Arquitectura general:

```text
┌───────────────────────────────┐
│       Angular Frontend        │
│       Web Responsive          │
└───────────────┬───────────────┘
                │
                │ HTTPS / REST
                ▼
┌───────────────────────────────┐
│        NestJS Backend         │
│                               │
│ Controller                    │
│ Service / Application         │
│ Domain                        │
│ Repository                    │
└───────────────┬───────────────┘
                │
                │ TypeORM / node-oracledb
                ▼
┌───────────────────────────────┐
│            Oracle             │
└───────────────────────────────┘
```

---

# 2. Principios

La arquitectura debe priorizar:

- simplicidad;
- mantenibilidad;
- modularidad;
- separación de responsabilidades;
- trazabilidad;
- seguridad;
- testabilidad;
- rendimiento;
- facilidad de desarrollo local;
- reproducibilidad de ambientes;
- evolución incremental;
- consistencia para trabajo con agentes de IA.

Se evitará incorporar complejidad sin una necesidad concreta.

Inicialmente **no se utilizarán microservicios**.

El backend será un **monolito modular**.

---

# 3. Stack tecnológico

## 3.1 Backend

```text
NestJS
TypeScript
Node.js
TypeORM
node-oracledb
Oracle
JWT
Swagger / OpenAPI
Vitest
Supertest
```

NestJS será el framework principal del backend.

Versiones base actualmente fijadas por el starter:

```text
Node.js 24.21.0
NestJS 12.1.2
Angular 22.2.2
```

La fuente canónica de las versiones ejecutables es `.nvmrc` y los `package.json` del monorepo. Si se actualizan dependencias, estos archivos prevalecen y la documentación debe mantenerse alineada.

---

## 3.2 Frontend

```text
Angular
TypeScript
Angular Router
Reactive Forms
HttpClient
Signals
RxJS
Vitest
```

La aplicación será responsive y deberá funcionar correctamente en:

- PC;
- notebook;
- tablet;
- navegador móvil.

---

## 3.3 Base de datos

```text
Oracle Database
```

La versión exacta utilizada por los ambientes del proyecto deberá confirmarse antes de utilizar funcionalidades específicas de una versión.

---

## 3.4 End-to-End

```text
Playwright
```

Playwright será utilizado para los flujos E2E críticos del sistema.

---

# 4. Repositorio y estructura del monorepo

MonkyForce se desarrollará en **un único repositorio GitHub**.

```text
monkyforce/
│
├── AGENTS.md
├── KNOWLEDGE.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── README.md
│
├── .agents/
│   └── skills/
│       └── monkyforce/
│           └── SKILL.md
│
├── .github/
│   └── pull_request_template.md
│
├── spec/
│   └── features/
│
├── docs/
│   └── sources/
│
├── backend/
│   ├── src/
│   ├── test/
│   ├── database/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── e2e/
│   └── package.json
│
├── docker/
│   └── oracle/
│
├── docker-compose.yml
├── package.json
├── .nvmrc
├── .editorconfig
├── .prettierrc
└── .gitignore
```

El repositorio raíz contendrá la configuración y documentación compartida.

Responsabilidades de la raíz:

- documentación funcional y técnica canónica;
- especificaciones SDD;
- instrucciones para agentes;
- Skill del proyecto;
- convenciones de Git/Jira;
- configuración común de Node y formato;
- Docker Compose del ambiente local;
- scripts para operar ambas aplicaciones;
- templates de GitHub.

Las aplicaciones mantienen separación técnica:

```text
backend/
→ NestJS + Oracle + persistencia + API

frontend/
→ Angular + experiencia web
```

El monorepo **no implica mezclar las capas de frontend y backend**.

Cada aplicación mantiene:

- dependencias específicas;
- `package.json` propio;
- build propio;
- tests propios;
- configuración específica cuando corresponda.

La raíz utilizará npm workspaces para simplificar instalación y ejecución conjunta, sin obligar a compartir dependencias de aplicación.

Un único clone deberá ser suficiente para obtener:

```text
documentación + backend + frontend + infraestructura local
```

---

# 5. Backend — estructura general

Estructura inicial conceptual:

```text
monkyforce/
└── backend/
    ├── src/
    │   ├── main.ts
    │   ├── app.module.ts
    │   ├── config/
    │   ├── common/
    │   ├── database/
    │   └── features/
    │
    ├── test/
    ├── database/
    │   ├── migrations/
    │   ├── seeds/
    │   └── scripts/
    │
    ├── .env.example
    ├── package.json
    └── README.md
```

La estructura concreta podrá adaptarse conforme crezcan las features.

---

# 6. Arquitectura de módulos backend

Cada módulo funcional deberá respetar separación de responsabilidades.

Flujo esperado:

```text
Controller
    ↓
Service / Application
    ↓
Domain
    ↓
Repository Interface
    ↓
Repository Implementation
    ↓
TypeORM / Oracle
```

No todas las features necesitarán todas las capas o carpetas.

La estructura debe acompañar la complejidad real.

---

# 7. Controller

Responsabilidades:

- recibir requests HTTP;
- leer parámetros;
- recibir body;
- aplicar validaciones de contrato;
- delegar al service;
- devolver respuestas HTTP.

No debe:

- contener lógica de negocio;
- ejecutar SQL;
- utilizar directamente repositories TypeORM;
- conocer detalles de Oracle;
- resolver transacciones complejas.

Ejemplo conceptual:

```text
POST /api/cuts
        ↓
CutsController
        ↓
CutsService.create(...)
```

---

# 8. Service / Application

Responsabilidades:

- implementar casos de uso;
- aplicar reglas de aplicación;
- coordinar repositories;
- coordinar transacciones;
- validar estados;
- resolver conflictos funcionales;
- disparar auditoría cuando corresponda.

Ejemplos:

```text
CreateCut
RegisterPartialDelivery
RegisterFailure
ResolveFailure
AssignRole
AdjustFabricRoll
```

No debe:

- ejecutar SQL directo;
- conocer configuración Oracle;
- contener lógica HTTP;
- utilizar directamente detalles internos de TypeORM fuera de patrones definidos.

---

# 9. Domain

Representará conceptos importantes del negocio.

Ejemplos futuros:

```text
Fabric
FabricRoll
Garment
Marker
Cut
Production
Delivery
QualityControl
Failure
Waste
```

El dominio podrá contener:

- entidades;
- enums;
- value objects;
- reglas invariantes;
- comportamiento funcional.

No se implementará Domain-Driven Design complejo de forma artificial.

Solo se crearán abstracciones cuando aporten valor real.

---

# 10. Repository

Los repositories propios encapsularán la persistencia.

Conceptualmente:

```text
Service
   ↓
ICutsRepository
   ↓
CutsRepository
   ↓
TypeORM
   ↓
Oracle
```

Responsabilidades:

- acceso a datos;
- filtros;
- paginación;
- ordenamiento;
- joins;
- persistencia;
- queries específicas;
- operaciones Oracle.

No deben contener reglas de negocio complejas.

---

# 11. TypeORM y Oracle

TypeORM será el mecanismo principal de persistencia.

Reglas:

- acceso a TypeORM únicamente desde la capa de persistencia;
- no utilizar repositories TypeORM directamente desde controllers;
- evitar SQL directo en services;
- utilizar QueryBuilder dentro de repositories cuando corresponda;
- utilizar transacciones para operaciones compuestas;
- controlar consultas N+1;
- paginar listados grandes;
- evitar cargar relaciones innecesarias.

---

# 12. SQL y Stored Procedures

Los stored procedures no serán la estrategia principal.

Sin embargo, podrán utilizarse cuando exista una necesidad concreta.

Casos posibles:

- procedure existente;
- procesamiento masivo;
- consulta Oracle compleja;
- necesidad de rendimiento;
- integración específica;
- funcionalidad que TypeORM no resuelva correctamente.

Flujo obligatorio:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
SQL / QueryBuilder / Procedure
   ↓
Oracle
```

Nunca:

```text
Controller → SQL
Service → Procedure
```

---

# 13. Docker — Base de datos local

Oracle deberá poder levantarse localmente mediante Docker.

Objetivo:

> cualquier desarrollador con acceso al repositorio debe poder levantar el ambiente sin instalar Oracle manualmente.

El archivo principal estará en la raíz del monorepo:

```text
monkyforce/
├── docker-compose.yml
└── docker/
    └── oracle/
```

Esto permite administrar la infraestructura local desde el mismo punto en el que viven ambas aplicaciones.

Arquitectura local:

```text
Angular
localhost:4200
        │
        ▼
NestJS
localhost:3000
        │
        ▼
Oracle Docker
localhost:1521
```

El backend deberá contener:

```text
database/
├── migrations/
├── seeds/
└── scripts/
```

El estado inicial de la base deberá poder reconstruirse mediante código versionado.

No se dependerá de bases de datos locales configuradas manualmente.

---

# 14. Scripts de entorno local

La raíz del monorepo deberá ofrecer comandos comunes para operar el workspace:

```text
npm install

npm run dev:backend
npm run dev:frontend

npm run build
npm run test

npm run db:up
npm run db:down
npm run db:reset
```

El backend podrá mantener además comandos específicos:

```text
npm --workspace backend run migration:run
npm --workspace backend run migration:revert
```

Los nombres exactos podrán adaptarse.

El objetivo es facilitar onboarding y recuperación del entorno.

---

# 15. Migrations

Los cambios de esquema deberán estar versionados.

La estrategia concreta de migrations deberá validarse cuando se confirme:

- versión Oracle;
- permisos disponibles;
- estrategia de despliegue;
- administración del esquema en ambientes superiores.

No se deberá modificar manualmente una base compartida sin dejar registro del cambio.

---

# 16. Seeds

Los seeds deberán permitir disponer de datos mínimos requeridos por el sistema.

Ejemplos:

- roles;
- permisos;
- usuario administrador inicial de desarrollo;
- catálogos obligatorios cuando corresponda.

No deben contener información sensible real.

---

# 17. Autenticación

MonkyForce utilizará JWT.

Para el cliente web, el JWT **no será almacenado en `localStorage` ni `sessionStorage`**.

NestJS enviará el token mediante:

```http
Set-Cookie
```

Configuración objetivo:

```text
HttpOnly
Secure
SameSite=Lax
Path=/
```

Flujo:

```text
Usuario
   ↓
POST /auth/login
   ↓
NestJS valida credenciales
   ↓
NestJS genera JWT
   ↓
Set-Cookie
   ↓
Browser almacena Cookie
   ↓
Requests siguientes
   ↓
Browser envía Cookie automáticamente
   ↓
NestJS valida JWT
```

Angular no debe leer ni manipular directamente el JWT.

---

# 18. Cookies

La cookie de autenticación deberá ser:

```text
HttpOnly = true
Secure = true
SameSite = Lax
```

En producción:

```text
HTTPS obligatorio
```

La configuración de desarrollo deberá permitir trabajar correctamente sobre localhost.

---

# 19. Frontend y API bajo el mismo site

La arquitectura de producción preferida será:

```text
https://monkyforce.example/
        │
        ├── /        → Angular
        │
        └── /api/*   → NestJS
```

Mediante reverse proxy.

Ventajas:

- cookies más simples;
- menor complejidad CORS;
- menor complejidad CSRF;
- configuración más sencilla;
- un único origen lógico para el usuario.

La infraestructura definitiva se definirá más adelante.

---

# 20. Desarrollo local y cookies

Durante desarrollo:

```text
Angular
http://localhost:4200

NestJS
http://localhost:3000
```

Angular deberá utilizar credenciales en requests cuando corresponda.

Conceptualmente:

```typescript
withCredentials: true;
```

NestJS deberá habilitar CORS de forma explícita:

```text
origin = http://localhost:4200
credentials = true
```

No utilizar:

```text
origin = *
```

junto con credenciales.

---

# 21. CSRF

Al utilizar autenticación mediante cookies, la arquitectura debe contemplar protección CSRF.

Medidas base:

- `SameSite=Lax`;
- validación de origen cuando corresponda;
- protección CSRF explícita para operaciones sensibles si resulta necesaria;
- no aceptar CORS abierto;
- métodos HTTP correctos para operaciones mutables.

La feature `KAN-10` adopta la protección CSRF nativa de NestJS 12.1 con
`FRONTEND_ORIGIN` como origen confiable explícito. La defensa combina:

- validación de Fetch Metadata y `Origin` para requests mutables;
- `SameSite=Lax`;
- CORS restringido con `credentials=true`;
- métodos HTTP correctos para mutaciones.

No se utiliza un token double-submit en esta foundation. Si en el futuro se
incorporan clientes u orígenes nuevos, deberán evaluarse y configurarse de
forma explícita.

---

# 22. Refresh Token

La feature `KAN-10` define el siguiente modelo:

```text
Access Token
duración corta
        +
Refresh Token
duración mayor
```

Ambos utilizan cookies HttpOnly separadas (`mf_access` y `mf_refresh`). El
access token dura 15 minutos y el refresh token 7 días por defecto; ambos
valores son configurables por ambiente.

Cada login crea una sesión revocable en Oracle. Solo se persiste el hash
SHA-256 del refresh token. Cada refresh rota el token mediante una actualización
atómica condicionada al hash anterior. El JWT contiene identidad y sesión, pero
no roles ni permisos: la autorización efectiva se carga desde Oracle.

---

# 23. Autorización — RBAC

Se utilizará Role-Based Access Control.

Modelo:

```text
User
  N
  │
  N
Role
  N
  │
  N
Permission
```

Un usuario podrá tener múltiples roles.

Los permisos serán acumulativos.

La seguridad efectiva se validará siempre en NestJS.

Angular puede:

- ocultar acciones;
- deshabilitar botones;
- proteger rutas;

pero no debe ser la fuente real de autorización.

---

# 24. Permisos

Los permisos representarán acciones.

Ejemplos conceptuales:

```text
CUTS_VIEW
CUTS_CREATE
CUTS_UPDATE

ROLLS_VIEW
ROLLS_CREATE
ROLLS_ADJUST

PRODUCTION_VIEW
PRODUCTION_REGISTER_DELIVERY

QUALITY_REGISTER
QUALITY_RESOLVE_FAILURE

USERS_MANAGE
```

Los códigos reales se definirán dentro de las SPEC.

No inventar permisos directamente en código.

---

# 25. ADMIN

No se implementará una regla especial:

```text
if role === ADMIN
    allowEverything()
```

ADMIN podrá realizar acciones porque tendrá los permisos correspondientes.

Esto evita lógica especial dispersa.

---

# 26. Contraseñas

Nunca se almacenarán contraseñas en texto plano.

Se utilizará un algoritmo de hash seguro.

La estrategia concreta se definirá en la feature Auth.

---

# 27. API REST

La API utilizará JSON sobre HTTPS.

Base conceptual:

```text
/api
```

CRUD cuando corresponda:

```text
GET    /api/fabrics
POST   /api/fabrics
GET    /api/fabrics/:id
PATCH  /api/fabrics/:id
DELETE /api/fabrics/:id
```

Operaciones de negocio explícitas:

```text
POST /api/productions/:id/partial-deliveries
POST /api/quality-controls/:id/failures
POST /api/failures/:id/resolve
```

No se forzará CRUD cuando la operación represente una acción de negocio.

---

# 28. DTOs

Los DTO deben estar separados de las entidades de persistencia.

Tipos conceptuales:

```text
CreateCutDto
UpdateCutDto
CutResponseDto
CutFilterDto
```

Reglas:

- no devolver entities directamente;
- no utilizar `any`;
- validar input;
- separar request/response cuando aporte claridad;
- no exponer datos sensibles.

---

# 29. Validación

Se utilizará ValidationPipe global.

Configuración base esperada:

```text
whitelist = true
forbidNonWhitelisted = true
transform = true
```

Se diferenciará:

### Validación de contrato

Ejemplos:

- requerido;
- longitud;
- formato;
- tipo.

### Validación de negocio

Ejemplos:

- stock disponible;
- estado válido;
- cantidad permitida;
- transición permitida.

La validación de negocio pertenece a backend.

---

# 30. Manejo de errores

Se utilizará manejo centralizado.

No se devolverán:

- errores Oracle crudos;
- stack traces;
- SQL;
- credenciales;
- detalles internos.

Códigos habituales:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

La API deberá mantener una estructura consistente de error.

---

# 31. Swagger / OpenAPI

La API deberá documentarse mediante Swagger/OpenAPI.

Debe permitir:

- visualizar endpoints;
- requests;
- responses;
- seguridad;
- DTOs;
- códigos de respuesta.

Su disponibilidad en producción deberá ser configurable.

---

# 32. Auditoría

MonkyForce necesita trazabilidad funcional.

Se contemplarán dos niveles.

## Auditoría básica

Cuando corresponda:

```text
createdAt
createdBy
updatedAt
updatedBy
deletedAt
deletedBy
```

La convención física definitiva podrá adaptarse a Oracle.

## Auditoría de operaciones críticas

Ejemplos:

- ajuste de stock;
- modificación administrativa de entrega confirmada;
- merma;
- resolución de falla;
- cambio de permisos;
- cambio importante de producción.

Los logs técnicos no reemplazan la auditoría funcional.

---

# 33. Baja lógica

Se utilizará cuando tenga sentido funcional.

No todas las entidades deberán implementar automáticamente:

```text
active
deletedAt
```

Los historiales productivos no deben desaparecer por una eliminación común.

---

# 34. Transacciones

Las operaciones compuestas deberán ser atómicas.

Ejemplos:

- confirmar corte y afectar rollos;
- registrar entrega y actualizar pendiente;
- registrar merma y stock;
- consumir avíos;
- modificar relaciones de roles/permisos.

Las transacciones se coordinarán desde Service/Application y se ejecutarán en Repository/Infrastructure.

---

# 35. Concurrencia

Las operaciones relacionadas con stock deberán considerar concurrencia.

Especialmente:

- rollos;
- avíos;
- entregas;
- cantidades pendientes;
- ajustes.

La estrategia exacta se definirá por feature.

No debe asumirse que:

```text
READ
then
WRITE
```

es seguro ante concurrencia.

---

# 36. Paginación

Los listados grandes deberán paginarse desde backend.

Contrato conceptual:

```text
page
pageSize
search
filters
sort
```

Respuesta:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

No descargar tablas completas para paginar solo en Angular.

---

# 37. Performance

Principios:

- paginación server-side;
- evitar N+1;
- índices Oracle según consultas reales;
- no cargar relaciones innecesarias;
- seleccionar columnas necesarias;
- medir antes de optimizar;
- revisar queries críticas;
- evitar cálculos costosos repetitivos;
- analizar operaciones masivas por separado.

No incorporar cache distribuida inicialmente salvo necesidad concreta.

---

# 38. Frontend — estructura

Estructura conceptual:

```text
src/app/
│
├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   └── layout/
│
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── models/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── fabrics/
│   ├── rolls/
│   ├── cuts/
│   ├── production/
│   └── ...
│
└── app.routes.ts
```

Las features se crearán conforme las SPEC las requieran.

---

# 39. Frontend — componentes

Los componentes deben concentrarse en:

- UI;
- interacción;
- formularios;
- presentación;
- eventos.

Evitar:

- HTTP directo cuando exista service;
- reglas complejas de negocio;
- acceso a tokens;
- duplicación innecesaria de estado.

---

# 40. Frontend — Services

Responsabilidades:

- acceso a API;
- operaciones por feature;
- coordinación de estado cuando corresponda;
- abstracción HTTP.

No crear un service global gigantesco para toda la aplicación.

---

# 41. Estado frontend

Estrategia inicial:

```text
Signals
+
RxJS
```

No se incorporará inicialmente:

```text
NgRx
NGXS
Akita
```

salvo necesidad demostrada.

---

# 42. Reactive Forms

Se utilizarán formularios reactivos.

Deben contemplar:

- validación;
- mensajes claros;
- loading;
- disabled states;
- errores backend;
- evitar doble submit;
- comportamiento responsive.

El backend siempre volverá a validar.

---

# 43. UI Library

La librería visual queda pendiente de definición.

Opciones a evaluar:

- Angular Material;
- otra librería mantenida;
- componentes propios.

Criterios:

- compatibilidad;
- accesibilidad;
- tablas;
- dialogs;
- formularios;
- responsive;
- mantenimiento.

Evitar mezclar múltiples librerías que resuelvan lo mismo.

---

# 44. Responsive

MonkyForce debe ser usable desde:

```text
Desktop
Notebook
Tablet
Mobile browser
```

El acceso móvil seguirá siendo acceso web mediante navegador.

No implica una aplicación móvil nativa.

Las cookies de autenticación funcionan igualmente en navegador móvil.

---

# 45. Testing Strategy

Los tests forman parte de la arquitectura.

No se consideran una tarea posterior al desarrollo.

Pirámide objetivo:

```text
                E2E
             Playwright
                ▲
               / \
              /   \
       Integration Tests
        API + Oracle
             ▲
            / \
           /   \
         Unit Tests
      Backend + Frontend
```

---

# 46. Backend Unit Tests

Framework:

```text
Vitest
```

Deben cubrir principalmente:

- reglas de negocio;
- services;
- validaciones;
- estados;
- cálculos;
- permisos;
- casos límite.

Ejemplos:

```text
cantidad pendiente
entregas parciales
resolución de fallas
stock
mermas
transiciones de estado
```

Las reglas `BR-*` críticas deberían tener cobertura automatizada.

---

# 47. Backend Integration Tests

Stack:

```text
Vitest
Supertest
Nest Testing Module
```

Deben probar:

```text
HTTP
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Oracle
```

Casos:

- endpoints;
- validaciones;
- autenticación;
- permisos;
- transacciones;
- repositories;
- queries Oracle.

---

# 48. Oracle en Integration Tests

Los tests importantes de persistencia deberán ejecutarse contra Oracle.

No se asumirá que una base alternativa representa correctamente el comportamiento Oracle.

El entorno de integración podrá utilizar:

```text
Oracle Docker
```

con un esquema/base aislada para pruebas.

---

# 49. Frontend Unit Tests

Framework:

```text
Vitest
Angular TestBed
```

Cubrir:

- componentes;
- services;
- guards;
- formularios;
- pipes;
- estado;
- validaciones;
- lógica visual relevante.

---

# 50. E2E

Framework:

```text
Playwright
```

Los tests E2E deben cubrir flujos críticos.

Ejemplos futuros:

```text
Login
Crear tela
Registrar rollo
Crear corte
Registrar entrega parcial
Registrar entrega final
Registrar falla
Resolver falla
Registrar merma
```

No todos los casos necesitan E2E.

Los detalles menores deben probarse principalmente mediante Unit/Integration Tests.

---

# 51. Feature Definition of Done

Una feature importante no estará terminada únicamente porque compile.

Debe cumplir, según corresponda:

```text
Card Jira real asociada
SPEC implementada
Implementación
Unit Tests
Integration Tests
Frontend Tests
E2E crítico
Backend build
Frontend build
Acceptance Criteria
Documentación
Branch / commits / PR trazables por Jira Key
Jira Development refleja la actividad de GitHub
PR mergeado si la feature se declara cerrada
```

La SPEC indicará qué niveles de test aplican.

La trazabilidad Jira/GitHub se rige por `AGENTS.md`. El agente no debe declarar una feature cerrada si la vinculación o el estado final no fueron verificados cuando correspondan.

---

# 52. Coverage

Se generarán reportes de cobertura.

No se exigirá inicialmente:

```text
100% coverage
```

La prioridad será:

> cubrir reglas de negocio y procesos críticos.

---

# 53. CI

Cuando se configure CI, como mínimo deberá ejecutar:

## Backend

```text
npm ci
lint
build
unit tests
integration tests
```

## Frontend

```text
npm ci
lint
build
unit tests
```

## E2E

```text
Playwright
```

Los E2E podrán ejecutarse en pipelines específicos si su tiempo lo justifica.

---

# 54. Logging

NestJS deberá utilizar logging estructurado.

Registrar:

- errores;
- operaciones técnicas relevantes;
- identificadores de request;
- eventos necesarios para diagnóstico.

No registrar:

- passwords;
- JWT;
- refresh tokens;
- secrets;
- datos sensibles innecesarios.

---

# 55. Correlation / Trace ID

Cada request deberá poder identificarse mediante un identificador de correlación.

Esto ayudará a relacionar:

```text
Frontend error
        ↓
API request
        ↓
Backend logs
```

La implementación exacta podrá definirse durante foundation.

---

# 56. Configuración

Se utilizarán variables de entorno.

Ejemplo conceptual:

```text
NODE_ENV
PORT

DB_HOST
DB_PORT
DB_SERVICE_NAME
DB_USERNAME
DB_PASSWORD

JWT_SECRET

FRONTEND_ORIGIN
```

El repositorio contendrá:

```text
.env.example
```

pero nunca secrets reales.

---

# 57. Integraciones externas

Las integraciones deberán estar encapsuladas.

Ejemplo:

```text
Service
   ↓
ISalesIntegration
   ↓
TiendaNubeIntegration
```

No acoplar Domain directamente a SDKs externos.

---

# 58. Context7 MCP

Context7 se utilizará como fuente técnica para documentación actual de:

- NestJS;
- TypeORM;
- Angular;
- Vitest;
- Playwright;
- librerías utilizadas.

No será fuente de reglas de negocio.

Separación:

```text
KNOWLEDGE / SPEC
→ qué debe hacer MonkyForce

Context7
→ cómo utilizar correctamente la tecnología
```

---

# 59. SDD

El desarrollo seguirá Specification-Driven Development con trazabilidad Jira-first.

Cada feature tendrá un único archivo:

```text
spec/features/NNN-KAN-XX-feature.md
```

Ejemplo:

```text
spec/features/003-KAN-25-abm-rollos.md
```

Donde:

- `NNN` representa el orden interno de las SPECs;
- `KAN-XX` es el Jira Key real de la feature y no debe inventarse ni predecirse.

Cada archivo contiene:

```text
1. SPEC
2. PLAN
3. TASKS
```

Flujo general:

```text
Requerimiento / necesidad
     ↓
Crear o identificar Card Jira
     ↓
Obtener KAN-XX real
     ↓
Crear branch desde main
feat/<descripcion>-kan-XX
     ↓
Validar KNOWLEDGE / BR-* / OQ-*
     ↓
Crear o actualizar Feature SPEC
     ↓
PLAN + TASKS
     ↓
Implementación
     ↓
Tests + Builds
     ↓
Pull Request [KAN-XX]
     ↓
Verificar Jira Development
     ↓
Merge cuando esté autorizado
```

`AGENTS.md` es la fuente canónica para el workflow operativo Jira/GitHub de los agentes.

---

# 60. Agents

La estructura documental del proyecto será:

```text
AGENTS.md
KNOWLEDGE.md
ARCHITECTURE.md
ROADMAP.md

.agents/
└── skills/
    └── monkyforce/
        └── SKILL.md

spec/
└── features/

backend/
frontend/
```

Responsabilidades:

```text
KNOWLEDGE.md
→ negocio

ARCHITECTURE.md
→ tecnología

AGENTS.md
→ comportamiento de agentes

SKILL.md
→ workflow

feature.md
→ requerimiento + plan + tareas
```

---

# 61. Reglas para agentes

Antes de implementar una feature:

1. leer `AGENTS.md`;
2. consultar `KNOWLEDGE.md`;
3. consultar `ARCHITECTURE.md`;
4. crear o identificar la Card Jira real;
5. obtener el Jira Key real;
6. crear la branch desde `main` con la convención definida en `AGENTS.md`;
7. crear o revisar la SPEC asociada al mismo Jira Key;
8. inspeccionar el código existente en `backend/` y/o `frontend/`;
9. revisar reglas `BR-*` y preguntas abiertas `OQ-*`;
10. no inventar reglas funcionales ni identificadores Jira;
11. implementar;
12. agregar tests;
13. ejecutar builds y tests aplicables;
14. validar criterios de aceptación;
15. crear o actualizar el Pull Request con el Jira Key;
16. verificar la vinculación en Jira Development;
17. actualizar TASKS, Jira y ROADMAP cuando corresponda;
18. mergear únicamente cuando exista autorización según `AGENTS.md`.

Las conversaciones exploratorias no deben crear Cards ni branches salvo pedido explícito del usuario.

---

# 62. Qué no incorporar inicialmente

No utilizar sin una necesidad concreta:

- microservicios;
- Kubernetes;
- event sourcing;
- CQRS obligatorio;
- buses de eventos;
- state manager global frontend;
- cache distribuida;
- múltiples bases de datos;
- abstracciones excesivas;
- paquetes nuevos sin justificación.

---

# 63. Decisiones aceptadas

| ID     | Decisión                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| AD-001 | MonkyForce será una aplicación web responsive                                                                                               |
| AD-002 | Backend y frontend vivirán en un único repositorio GitHub, como aplicaciones separadas dentro de un monorepo                                |
| AD-003 | Backend en NestJS + TypeScript                                                                                                              |
| AD-004 | Frontend en Angular + TypeScript                                                                                                            |
| AD-005 | Oracle como base de datos                                                                                                                   |
| AD-006 | Oracle local mediante Docker                                                                                                                |
| AD-007 | TypeORM como persistencia principal                                                                                                         |
| AD-008 | `node-oracledb` como driver Oracle                                                                                                          |
| AD-009 | Arquitectura backend modular                                                                                                                |
| AD-010 | Controller → Service → Repository                                                                                                           |
| AD-011 | SQL/procedures solo mediante Repository                                                                                                     |
| AD-012 | JWT para autenticación                                                                                                                      |
| AD-013 | JWT web emitido mediante `Set-Cookie`                                                                                                       |
| AD-014 | Cookie `HttpOnly`                                                                                                                           |
| AD-015 | Cookie `Secure`                                                                                                                             |
| AD-016 | Cookie `SameSite=Lax`                                                                                                                       |
| AD-017 | No almacenar JWT en localStorage/sessionStorage                                                                                             |
| AD-018 | RBAC User–Role–Permission                                                                                                                   |
| AD-019 | Usuarios pueden tener múltiples roles                                                                                                       |
| AD-020 | Permisos acumulativos                                                                                                                       |
| AD-021 | Autorización efectiva en backend                                                                                                            |
| AD-022 | Swagger/OpenAPI                                                                                                                             |
| AD-023 | Vitest para Unit Tests                                                                                                                      |
| AD-024 | Supertest para Integration/API Tests                                                                                                        |
| AD-025 | Playwright para E2E                                                                                                                         |
| AD-026 | Testing forma parte del Definition of Done                                                                                                  |
| AD-027 | SDD con un archivo por feature                                                                                                              |
| AD-028 | Context7 como documentación técnica para agentes                                                                                            |
| AD-029 | Configuración y documentación compartida vivirán en la raíz del monorepo                                                                    |
| AD-030 | La raíz utilizará npm workspaces para operar backend y frontend                                                                             |
| AD-031 | El workflow de features será Jira-first: Card real → Jira Key → branch → SPEC → implementación → PR                                         |
| AD-032 | Las branches de features usarán `feat/<descripcion>-kan-XX`; el Jira Key canónico se mantiene como `KAN-XX` en documentación, commits y PRs |
| AD-033 | Jira Development + GitHub for Atlassian se utilizarán para trazabilidad de branch/PR                                                        |
| AD-034 | Las versiones base del starter quedaron fijadas en `.nvmrc` y `package.json`; actualmente Node.js 24.21.0, NestJS 12.1.2 y Angular 22.2.2   |
| AD-035 | Access y refresh tokens usan cookies HttpOnly separadas, secretos independientes y TTL configurables; valores base 15 minutos y 7 días      |
| AD-036 | Los refresh tokens rotan y solo su hash se persiste en una sesión revocable de Oracle                                                       |
| AD-037 | Los JWT no contienen roles ni permisos; el backend resuelve autorización vigente desde Oracle para cada request protegido                   |
| AD-038 | La protección CSRF usa la implementación nativa de NestJS con orígenes confiables explícitos, SameSite=Lax y CORS restringido               |
| AD-039 | Passwords usan scrypt asíncrono de Node.js con formato versionado y parámetros OWASP N=2^17, r=8, p=1                                       |
| AD-040 | La foundation RBAC no crea roles ni permisos funcionales hasta cerrar OQ-008 y no implementa bypass por nombre de rol                       |

---

# 64. Decisiones pendientes

## AP-001 — Versión exacta de Oracle

Confirmar versión de producción/desarrollo objetivo.

## AP-003 — UI Library

Definir librería visual del frontend.

## AP-006 — Migrations

Confirmar estrategia final para ambientes.

## AP-007 — Hosting

Definir:

- infraestructura;
- reverse proxy;
- dominios;
- TLS;
- ambientes;
- despliegue.

## AP-008 — Auditoría física

Definir modelo de tablas/historial.

---

# 65. Resumen final

La arquitectura objetivo es:

```text
┌──────────────────────────────────┐
│             Angular              │
│      Responsive Web Client       │
│                                  │
│ Signals / RxJS                   │
│ Reactive Forms                   │
│ Vitest                           │
└────────────────┬─────────────────┘
                 │
                 │ REST / HTTPS
                 │ Cookies HttpOnly
                 ▼
┌──────────────────────────────────┐
│             NestJS               │
│                                  │
│ Controllers                      │
│ Services / Application           │
│ Domain                           │
│ Repositories                     │
│ JWT + RBAC                       │
│ Swagger                          │
│ Vitest + Supertest               │
└────────────────┬─────────────────┘
                 │
                 │ TypeORM
                 │ node-oracledb
                 ▼
┌──────────────────────────────────┐
│              Oracle              │
│                                  │
│ Local Development: Docker        │
└──────────────────────────────────┘

                 ▲
                 │
        Playwright E2E
```

El objetivo de esta arquitectura es permitir que MonkyForce crezca de forma ordenada sin introducir complejidad antes de que sea necesaria.
