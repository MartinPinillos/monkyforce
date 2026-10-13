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
