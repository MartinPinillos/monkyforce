# MonkyForce Backend

Aplicación backend NestJS del monorepo MonkyForce.

## Ejecutar desde la raíz

```bash
npm run dev:backend
```

También puede ejecutarse directamente:

```bash
cd backend
npm run start:dev
```

La documentación canónica y las SPECs viven en la raíz del repositorio:

```text
../KNOWLEDGE.md
../ARCHITECTURE.md
../AGENTS.md
../ROADMAP.md
../spec/features/
```

La base Oracle local se administra desde el `docker-compose.yml` de la raíz.

## Auth / RBAC

La migration de la foundation se ejecuta desde la raíz con:

```bash
npm --workspace backend run migration:run
```

El backend emite access y refresh tokens en cookies HttpOnly. No deben
guardarse ni leerse desde Angular. Las variables JWT, TTL, origen frontend y
conexión Oracle requeridas están documentadas en `.env.example`.

### Bootstrap del primer usuario

En una instalación limpia, luego de ejecutar las migrations, el primer usuario
se crea de forma explícita con:

```bash
read -r BOOTSTRAP_USER_LOGIN_NAME
export BOOTSTRAP_USER_LOGIN_NAME
read -rs BOOTSTRAP_USER_PASSWORD
export BOOTSTRAP_USER_PASSWORD
export BOOTSTRAP_USER_CONFIRM=CREATE_INITIAL_USER
npm --workspace backend run bootstrap:user
unset BOOTSTRAP_USER_LOGIN_NAME BOOTSTRAP_USER_PASSWORD BOOTSTRAP_USER_CONFIRM
```

El valor de `BOOTSTRAP_USER_LOGIN_NAME` debe cargarse en el entorno antes de
ejecutar el comando. La contraseña se lee sin eco para no dejarla escrita en el
historial del shell. En producción también se requiere la habilitación explícita
de una sola ejecución:

```bash
export BOOTSTRAP_USER_ALLOW_PRODUCTION=true
```

El comando normaliza el login igual que Auth, genera el hash con
`PasswordHasherService` y no imprime ni la contraseña ni su hash. Si el mismo
login ya existe finaliza de forma idempotente; si existe cualquier otro usuario
rechaza la operación. No asigna roles ni permisos, no reemplaza un ABM y no debe
usarse como seed. Una ejecución idempotente no reemplaza ni rota la contraseña
del usuario existente. Las variables `BOOTSTRAP_USER_*` no deben persistirse
en archivos versionados ni reutilizarse después del bootstrap.
