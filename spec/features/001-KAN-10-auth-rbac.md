# 001 — Auth / RBAC

Estado: En revisión
Jira: KAN-10
Branch: `feat/auth-rbac-kan-10`
Pull Request: [#4](https://github.com/MartinPinillos/monkyforce/pull/4)

## 1. SPEC

### 1.1 Objetivo

Implementar la foundation de autenticación y autorización de MonkyForce para que la aplicación web pueda:

- autenticar usuarios internos mediante credenciales;
- mantener una sesión web sin exponer tokens a Angular;
- conocer el usuario autenticado y sus permisos efectivos;
- cerrar y renovar sesiones de manera segura;
- proteger endpoints en backend mediante permisos acumulados desde múltiples roles;
- soportar navegación y experiencia autenticada en Angular sin convertir al frontend en fuente de seguridad.

Esta feature crea infraestructura de seguridad. No define el catálogo funcional definitivo de roles y permisos textiles.

### 1.2 Problema

El starter dispone de configuración base de NestJS, Angular, TypeORM y Oracle, pero todavía no tiene usuarios, sesiones, autenticación ni autorización. Las siguientes features necesitan una identidad autenticada y una forma uniforme de validar permisos en backend.

### 1.3 Clasificación

Nueva funcionalidad.

### 1.4 Actores

- **Usuario interno:** persona habilitada para ingresar a MonkyForce.
- **Usuario autenticado:** usuario con una sesión vigente.
- **Administrador futuro:** usuario al que se le asignarán permisos administrativos mediante datos RBAC. No existe bypass hardcodeado por nombre de rol.
- **Cliente Angular:** aplicación web que consume la API usando cookies HttpOnly.

Los roles operativos definitivos continúan pendientes en `OQ-008`.

### 1.5 Casos funcionales

#### CF-001 — Iniciar sesión

1. El usuario ingresa un identificador de acceso y contraseña.
2. La API normaliza el identificador, busca un usuario activo y verifica el hash de la contraseña.
3. Ante credenciales válidas, la API crea una sesión revocable, emite access y refresh tokens en cookies HttpOnly y responde con información segura del usuario.
4. Ante cualquier credencial inválida o usuario inactivo, la API responde `401` con un mensaje genérico.

#### CF-002 — Consultar sesión actual

1. El navegador envía automáticamente la cookie de access token.
2. La API verifica firma, expiración, tipo de token, sesión activa y usuario activo.
3. La API responde la identidad segura, roles activos y permisos activos acumulados.

#### CF-003 — Renovar sesión

1. El navegador envía la cookie de refresh token.
2. La API verifica el JWT, la sesión persistida, expiración y coincidencia del hash del refresh token.
3. La API rota el refresh token de forma atómica y emite un nuevo par de cookies.
4. Un refresh token anterior deja de ser válido después de la rotación.

#### CF-004 — Cerrar sesión

1. La API identifica la sesión desde un access o refresh token válido cuando sea posible.
2. Revoca la sesión persistida.
3. Elimina siempre ambas cookies con los mismos atributos usados al crearlas.
4. La operación no revela si la sesión ya estaba vencida o revocada.

#### CF-005 — Autorizar por permisos

1. Un endpoint declara uno o más códigos de permiso requeridos.
2. El guard de autenticación construye el principal desde datos actuales de Oracle, no desde permisos embebidos en el JWT.
3. El guard de permisos exige que el usuario posea todos los permisos declarados.
4. Los permisos efectivos son la unión sin duplicados de los permisos activos de todos los roles activos asignados al usuario.

#### CF-006 — Navegación Angular

1. Angular consulta `/api/auth/me` sin leer el JWT.
2. Si el access token venció, puede intentar una única renovación y repetir la consulta.
3. Un guard de navegación deriva usuarios anónimos hacia `/login`.
4. Los `401` actualizan el estado local de sesión; los `403` no se presentan como pérdida de sesión.

### 1.6 Reglas relacionadas

- `BR-015`: acciones críticas protegidas mediante roles/permisos.
- `BR-016`: la autorización efectiva se valida en backend.
- `AD-012` a `AD-021`: JWT por cookies, cookies seguras, RBAC, roles múltiples, permisos acumulativos y autorización backend.
- Un usuario puede tener múltiples roles.
- Un rol puede tener múltiples permisos.
- No existe un bypass especial para `ADMIN`.
- No se define en esta feature un rol `ADMIN` ni un catálogo textil definitivo.
- Un usuario inactivo no puede iniciar ni continuar una sesión.

### 1.7 Identificador de acceso

La foundation utiliza un `loginName` técnico y opaco:

- obligatorio para los registros persistidos;
- normalizado con `trim` y minúsculas antes de buscar o persistir;
- único sobre el valor normalizado;
- no se presupone que sea un email, DNI u otro dato de negocio.

La elección de un identificador funcional definitivo podrá evolucionar en una feature de administración de usuarios sin cambiar la seguridad base.

### 1.7.1 Bootstrap del primer usuario

Una instalación sin usuarios dispone de un comando CLI explícito para crear
únicamente el primer usuario:

- utiliza el mismo normalizador de `loginName` que el login;
- genera el hash mediante `PasswordHasherService`;
- recibe login y password exclusivamente mediante variables de entorno;
- exige una confirmación explícita y una habilitación adicional en producción;
- es idempotente cuando el mismo usuario ya existe;
- rechaza crear un usuario diferente cuando la tabla ya contiene usuarios;
- no asigna roles ni permisos y no expone un endpoint HTTP.

El comando no reemplaza un futuro ABM de usuarios ni define datos funcionales.

### 1.8 Contratos HTTP

Base: `/api/auth`.

#### `POST /api/auth/login`

Request:

```json
{
  "loginName": "usuario",
  "password": "valor ingresado"
}
```

Response `200`:

```json
{
  "user": {
    "id": 1,
    "loginName": "usuario",
    "roles": ["ROLE_CODE"],
    "permissions": ["PERMISSION_CODE"]
  }
}
```

Efecto adicional: envía cookies de access y refresh token.

Errores:

- `400`: contrato inválido;
- `401`: credenciales inválidas o usuario inactivo, sin distinguir el motivo.

#### `POST /api/auth/refresh`

Sin body. Usa la cookie de refresh.

Response `200`: mismo contrato seguro de usuario y nuevas cookies rotadas.

Errores:

- `401`: refresh ausente, inválido, vencido, reutilizado o sesión revocada.

#### `GET /api/auth/me`

Response `200`: mismo contrato seguro de usuario.

Errores:

- `401`: access token ausente/inválido, sesión revocada o usuario inactivo.

#### `POST /api/auth/logout`

Response `204`, incluso si no se pudo recuperar una sesión vigente. Siempre elimina las cookies.

### 1.9 Cookies y tokens

Cookies:

- access: `mf_access`;
- refresh: `mf_refresh`;
- `HttpOnly=true`;
- `Secure=true` en producción y `false` únicamente en desarrollo/test HTTP local;
- `SameSite=Lax`;
- `Path=/`;
- sin `Domain`, por lo que son host-only.

JWT:

- access y refresh usan secretos independientes desde variables de entorno;
- algoritmo HMAC provisto por `@nestjs/jwt`;
- payload mínimo: `sub`, `sid`, `typ`; el refresh agrega `jti`;
- no contiene password, hash, roles ni permisos;
- issuer y audience se validan;
- TTL configurables por ambiente.

Valores base de la foundation:

- access token: 15 minutos (`JWT_ACCESS_TTL_SECONDS=900`);
- refresh token: 7 días (`JWT_REFRESH_TTL_SECONDS=604800`).

Estos valores son decisiones técnicas iniciales, quedan centralizados en configuración y pueden ajustarse por ambiente sin migración ni cambio de contrato.

### 1.10 Refresh token e invalidación

Se implementa rotación con estado mínimo en servidor:

- cada login crea una sesión en `MF_AUTH_SESSIONS`;
- solo se persiste SHA-256 del refresh token, nunca el token;
- la rotación actualiza el hash mediante una condición atómica sobre el hash anterior;
- logout marca la sesión como revocada;
- el access token contiene el ID de sesión y el guard comprueba que esa sesión siga activa, por lo que logout invalida también access tokens no vencidos;
- las sesiones expiradas/revocadas podrán limpiarse mediante mantenimiento posterior; no se agrega un scheduler en esta feature.

Se permite más de una sesión por usuario para no imponer una regla funcional de sesión única no documentada.

### 1.11 Password hashing

Se utiliza `crypto.scrypt` asíncrono incluido en Node.js para evitar una dependencia nativa adicional y mantener un algoritmo memory-hard:

- `N=2^17`;
- `r=8`;
- `p=1`;
- salt aleatorio de 16 bytes;
- clave derivada de 64 bytes;
- comparación con `timingSafeEqual`;
- formato versionado que incluye algoritmo y parámetros para permitir upgrades.

Los parámetros siguen la alternativa mínima de scrypt recomendada por OWASP cuando no se incorpora Argon2id.

Esta feature no define una política funcional de complejidad de contraseñas porque no existe alta/cambio de password público. Solo aplica límites técnicos de contrato para evitar entradas vacías o desproporcionadas. La política funcional deberá definirse con la administración de usuarios.

### 1.12 CSRF y CORS

Se utiliza la protección CSRF nativa de NestJS 12.1:

- se habilita inmediatamente después de crear la aplicación;
- las operaciones seguras `GET`, `HEAD` y `OPTIONS` se permiten;
- las operaciones mutables rechazan orígenes cruzados según Fetch Metadata/Origin;
- `FRONTEND_ORIGIN` se registra como origen confiable para el desarrollo separado Angular `localhost:4200` → NestJS `localhost:3000`;
- CORS permite exclusivamente `FRONTEND_ORIGIN` con `credentials=true`;
- no se utiliza `origin=*`;
- `SameSite=Lax` agrega defensa de navegador;
- no se implementa double-submit token en esta iteración porque la protección integrada cubre el escenario web definido sin exponer un token adicional a JavaScript.

En producción se prefiere Angular y `/api` bajo el mismo site. Cualquier nuevo origen deberá agregarse explícitamente a configuración.

### 1.13 Modelo RBAC y persistencia Oracle

Tablas versionadas por migration:

- `MF_USERS`;
- `MF_ROLES`;
- `MF_PERMISSIONS`;
- `MF_USER_ROLES`;
- `MF_ROLE_PERMISSIONS`;
- `MF_AUTH_SESSIONS`.

Decisiones:

- IDs numéricos generados por Oracle/TypeORM;
- `LOGIN_NAME`, `ROLE.CODE` y `PERMISSION.CODE` únicos;
- flags persistidos como `CHAR(1)` (`Y`/`N`) para no depender de soporte Oracle específico de `BOOLEAN`;
- junctions explícitas con clave primaria compuesta y fecha de asignación;
- índices sobre foreign keys y campos usados para sesión;
- timestamps Oracle;
- `synchronize=false` se mantiene;
- no hay seeds de roles ni permisos funcionales;
- los tests pueden crear códigos `TEST_*` y eliminarlos dentro de su entorno aislado.

### 1.14 Auditoría

- Login fallido no registra contraseña ni indica si el usuario existe.
- Login, refresh y logout pueden generar logs técnicos con trace ID e ID de usuario/sesión cuando exista, nunca tokens o hashes.
- Las junctions conservan fecha de asignación.
- No se incluyen endpoints de asignación de roles/permisos en esta feature.
- El modelo físico de auditoría funcional sigue pendiente en `AP-008`; las futuras operaciones administrativas de asignación deberán registrar actor, fecha y cambio sin almacenar secretos.

### 1.15 Criterios de aceptación

1. Existe una Card Jira Feature real y una branch `feat/auth-rbac-kan-10` creada desde `main`.
2. El workspace local está posicionado en la branch antes de cualquier cambio.
3. Las tablas de usuarios, RBAC y sesiones se crean mediante migration TypeORM para Oracle.
4. Ningún password se persiste en texto plano.
5. Login válido emite cookies HttpOnly y devuelve solo datos seguros.
6. Login inválido o usuario inactivo devuelve el mismo `401` genérico.
7. `/auth/me` no requiere que Angular lea el JWT.
8. Refresh rota el token y persiste únicamente su hash.
9. Logout revoca la sesión y elimina ambas cookies.
10. Cookies usan `SameSite=Lax`, `Path=/` y `Secure` en producción.
11. Desarrollo funciona con orígenes `localhost:4200` y `localhost:3000` sin CORS abierto.
12. CSRF rechaza operaciones mutables desde orígenes no confiables.
13. Los permisos efectivos acumulan los permisos activos de múltiples roles activos.
14. Un endpoint protegido sin sesión devuelve `401`.
15. Un usuario autenticado sin permiso devuelve `403`.
16. Un usuario con todos los permisos requeridos accede.
17. No existe bypass hardcodeado para `ADMIN`.
18. Angular implementa login, sesión, logout, credentials, guard y manejo de estados/errores sin guardar tokens.
19. Existen tests unitarios, de integración, frontend y un flujo Playwright crítico acorde al entorno disponible.
20. Builds y tests ejecutados quedan registrados en TASKS y en el reporte final.
21. Una instalación limpia puede crear de forma explícita e idempotente el primer usuario con un hash real, sin endpoint público ni credenciales versionadas.
22. Existe una integración real HTTP + Oracle que valida login, cookies, autorización, rotación, replay, logout y revocación persistida.

### 1.16 Casos de error

- body de login inválido → `400`;
- credenciales inválidas o usuario inactivo → `401` genérico;
- token ausente, mal firmado, expirado o de tipo incorrecto → `401`;
- sesión inexistente, expirada o revocada → `401`;
- refresh token rotado/reutilizado → `401`;
- usuario autenticado sin permiso → `403`;
- intento CSRF desde origen no confiable → `403`;
- error Oracle/TypeORM → respuesta global sin detalle interno ni stack trace.

### 1.17 Dependencias

- `@nestjs/jwt`: única dependencia de runtime nueva necesaria para firma y verificación JWT integrada con NestJS.
- Node `crypto`: hashing de passwords, hashes de refresh y comparaciones constantes.
- TypeORM/Oracle, Angular HttpClient, Signals/RxJS, Vitest, Supertest y Playwright ya existen.

No se incorpora Passport porque el guard necesario es pequeño, específico para cookies y puede implementarse con `JwtService` sin otra capa.

### 1.18 Fuera de alcance

- ABM administrativo completo de usuarios, roles y permisos;
- registro público de usuarios;
- recuperación o cambio de contraseña;
- MFA;
- SSO/OIDC;
- catálogo definitivo de roles/permisos textiles;
- rol `ADMIN` seed o bypass especial;
- política funcional definitiva de contraseñas;
- cierre remoto de todas las sesiones de un usuario;
- modelo general de auditoría funcional;
- rate limiting distribuido;
- infraestructura productiva, dominio o reverse proxy definitivos.

### 1.19 Preguntas abiertas

- `OQ-008`: roles y permisos definitivos. No bloquea la infraestructura RBAC.
- `AP-003`: UI library. No bloquea un formulario accesible con estilos propios mínimos.
- `AP-007`: hosting y reverse proxy. No bloquea cookies configurables; producción requerirá HTTPS.
- `AP-008`: auditoría física. No bloquea login ni RBAC base porque no se exponen mutaciones administrativas.
- La política funcional de contraseñas continúa pendiente; el bootstrap inicial aplica solamente límites técnicos y no define esa política.

## 2. PLAN

### 2.1 Backend

- Crear módulos `users`, `rbac` y `auth` dentro de `src/features`.
- Separar entities, contracts de repository, implementations TypeORM, DTOs y responses.
- Implementar `PasswordHasher`, token service, cookie service y `AuthService`.
- Implementar `JwtAuthGuard`, `PermissionsGuard`, `@Public` y `@RequirePermissions`.
- Registrar guards globales para seguridad por defecto y marcar health/auth públicos según contrato.
- Incorporar Swagger para cookies y respuestas sin exponer secretos.
- Mantener services sin `Repository<Entity>` directo.
- Agregar un comando CLI controlado para crear únicamente el primer usuario,
  reutilizando el hasher y el repository propio.

### 2.2 Frontend

- Crear modelos y `AuthService` con Signals/RxJS.
- Implementar formulario reactivo de login.
- Implementar guard de sesión y flujo de logout.
- Mantener `withCredentials` para la API.
- Incorporar interceptor de sesión para una renovación única ante `401` y conservar `403` como autorización denegada.
- Actualizar home para representar una sesión autenticada.

### 2.3 Base de datos

- Crear una única migration inicial de Auth/RBAC con seis tablas, constraints e índices.
- Implementar repositories TypeORM propios.
- Crear prueba de persistencia Oracle ejecutable contra el contenedor cuando esté disponible.
- No crear datos funcionales iniciales.

### 2.4 Seguridad

- Secretos y TTLs desde variables de entorno validadas.
- JWT separados por tipo y secreto.
- Sesiones revocables y refresh rotativo con hash.
- `scrypt` asíncrono y comparación constante.
- Cookies HttpOnly explícitas y seguras por ambiente.
- CSRF nativo Nest + CORS exacto.
- Respuestas sanitizadas y mensajes genéricos.

### 2.5 Transacciones y concurrencia

- Login crea una única sesión; no requiere escrituras múltiples dependientes.
- Refresh rota el hash mediante update condicional atómico para impedir doble uso concurrente.
- Futuras asignaciones RBAC compuestas deberán usar transacción; no se exponen en esta feature.

### 2.6 Testing

- Unit: password hashing, login, credenciales inválidas, usuario inactivo, permisos acumulados y guard.
- Integration HTTP in-memory: login, cookies, me, refresh, logout, `401`, `403` y acceso permitido usando repositories de prueba.
- Persistencia Oracle real: migration, repositories, RBAC y sesiones, condicionada a Oracle de testing disponible.
- Integration Auth HTTP + Oracle real: NestJS, Supertest, repositories TypeORM y Oracle reales para el flujo crítico completo.
- Frontend: AuthService, login y guards/interceptor.
- Playwright con API mockeada: flujo crítico de login/logout de UI; no representa una validación full-stack.

### 2.7 Documentación

- Actualizar `.env.example`, README cuando corresponda, `ARCHITECTURE.md` con las decisiones cerradas y `ROADMAP.md` con estado verificado.
- Mantener TASKS según resultados reales.
- Documentar que el bootstrap es un comando de instalación de una sola finalidad, sin endpoint, roles ni permisos.

### 2.7.1 Docker Oracle

El montaje actual en `/opt/oracle/scripts/startup` reaplica en cada arranque el
`ALTER USER`, la cuota y los grants definidos por el script local. Esto puede
recuperar el esquema de desarrollo cuando se reutiliza el volumen, pero no es
un requisito propio de Auth/RBAC: afecta transversalmente a la infraestructura
Oracle. KAN-10 no vuelve a modificar `docker-compose.yml`; se propone separar
esa decisión en una card `chore` específica, sin crearla hasta recibir
autorización.

### 2.7.2 Configuración restaurada tras la revisión

- Backend vuelve a TypeScript `5.9.3`; frontend conserva su TypeScript `6.0.3`.
- Angular vuelve a usar su caché y prebundle predeterminados.
- `health.e2e-spec.ts` vuelve a inicializar la aplicación sin un `listen()`
  explícito; Supertest administra su listener efímero.
- No se restaura `baseUrl` en el frontend porque su propio TypeScript 6 rechaza
  esa opción deprecada; la ausencia no depende del upgrade backend revertido.

### 2.8 Riesgos

- Oracle local puede no estar disponible o tardar en inicializar; los tests Oracle deben reportarse como bloqueados, no simularse.
- La rotación concurrente de refresh puede producir un `401` para una segunda solicitud simultánea, comportamiento seguro y esperado.
- La protección CSRF requiere mantener actualizada la lista explícita de orígenes confiables.
- El bootstrap crea únicamente el primer usuario técnico; no debe confundirse con un ABM, un seed funcional ni una definición de roles.

## 3. TASKS

- [x] Identificar/crear Card Jira Feature real `KAN-10`.
- [x] Asignar la Card al sprint activo `Sprint 0`.
- [x] Crear branch remota desde `main`.
- [x] Posicionar y verificar el workspace local en `feat/auth-rbac-kan-10`.
- [x] Inspeccionar foundation backend/frontend y documentación canónica.
- [x] Definir contratos, refresh, CSRF, hashing y alcance RBAC en la SPEC.
- [x] Agregar dependencia JWT justificada.
- [x] Crear migration Oracle Auth/RBAC.
- [x] Implementar entities y repositories propios.
- [x] Implementar autenticación, sesiones, cookies y refresh.
- [x] Implementar guards y autorización RBAC.
- [x] Implementar soporte Angular de autenticación.
- [x] Agregar backend Unit Tests.
- [x] Agregar backend Integration Tests.
- [x] Agregar Integration Test Oracle.
- [x] Agregar Frontend Tests.
- [x] Agregar E2E crítico Playwright.
- [x] Ejecutar migration contra Oracle local.
- [x] Ejecutar lint backend.
- [x] Ejecutar backend build.
- [x] Ejecutar frontend build.
- [x] Ejecutar backend Unit Tests (7 archivos, 19 tests).
- [x] Ejecutar backend Integration Tests (4 archivos, 9 tests; incluye persistencia Oracle e HTTP + Oracle reales).
- [x] Ejecutar frontend Tests (5 archivos, 14 tests).
- [x] Ejecutar Playwright E2E (2 proyectos, 2 tests).
- [x] Actualizar documentación y TASKS con resultados reales.
- [x] Crear commits con `KAN-10`.
- [x] Crear Pull Request `[KAN-10] Auth / RBAC` (#4).
- [x] Verificar trazabilidad Jira Development: PR abierto detectado desde GitHub.
- [x] No mergear sin autorización explícita.
- [x] Implementar bootstrap CLI seguro e idempotente del primer usuario.
- [x] Agregar Integration Auth HTTP + Oracle real.
- [x] Probar replay de refresh e invalidación de access retenido.
- [x] Agregar test directo de `permissionGuard` frontend.
- [x] Rechazar secrets de ejemplo en producción.
- [x] Revertir cambios globales no necesarios autorizados.
- [x] Reclasificar y documentar la cobertura de tests.
- [x] Ejecutar validación completa posterior a la revisión.
- [x] Revisar `git status`, `git diff` y alcance antes de commit.
