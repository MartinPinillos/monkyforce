# MonkyForce

Monorepo del sistema de gestión de producción textil MonkyForce.

## Estructura

```text
monkyforce/
├── backend/                    # NestJS + TypeORM + Oracle
├── frontend/                   # Angular
├── spec/features/              # SPEC + PLAN + TASKS
├── docs/sources/               # fuentes de relevamiento
├── .agents/skills/monkyforce/  # workflow del agente
├── docker/                     # infraestructura local
├── AGENTS.md
├── KNOWLEDGE.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── docker-compose.yml
└── package.json                # npm workspaces + scripts globales
```

## Fuente de verdad

La documentación canónica vive en la raíz:

- `KNOWLEDGE.md` → negocio y procesos;
- `ARCHITECTURE.md` → arquitectura técnica;
- `AGENTS.md` → reglas para agentes;
- `ROADMAP.md` → estado y prioridades;
- `spec/features/` → especificaciones de features.

## Requisitos

- Node.js 24 LTS
- npm
- Docker Desktop / Docker Engine + Compose

## Primer inicio

```bash
git clone <URL_DEL_REPOSITORIO>
cd monkyforce

cp .env.example .env
cp backend/.env.example backend/.env

npm install
npm run db:up
```

En terminales separadas:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Servicios locales:

```text
Frontend  http://localhost:4200
Backend   http://localhost:3000/api
Swagger   http://localhost:3000/api/docs
Oracle    localhost:1521
```

## Build y tests

```bash
npm run build
npm test
npm run test:e2e
```

## Jira-first

Las nuevas features nacen primero en Jira.

Ejemplo:

```text
Jira:    KAN-12
SPEC:    spec/features/001-KAN-12-auth-rbac.md
Branch:  feature/KAN-12-auth-rbac
PR:      [KAN-12] Auth / RBAC
```

El mismo branch/PR puede modificar `backend/` y `frontend/` porque ambos forman parte del mismo repositorio y de la misma feature.
