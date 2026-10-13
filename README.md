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

> `.agents/` comienza con punto y por eso puede mostrarse como carpeta oculta en macOS/Linux. El archivo del workflow vive en `.agents/skills/monkyforce/SKILL.md`.

## Fuente de verdad

La documentación canónica vive en la raíz:

- `KNOWLEDGE.md` → negocio y procesos;
- `ARCHITECTURE.md` → arquitectura técnica;
- `AGENTS.md` → reglas obligatorias para agentes;
- `ROADMAP.md` → estado y prioridades;
- `spec/features/` → especificaciones de features;
- `.agents/skills/monkyforce/SKILL.md` → workflow operativo reutilizable del agente.

## Repositorio

```text
GitHub: MartinPinillos/monkyforce
Jira:   proyecto KAN
```

## Requisitos

- Node.js 24 LTS (`.nvmrc` fija actualmente `24.21.0`)
- npm
- Docker Desktop / Docker Engine + Compose

## Primer inicio

```bash
git clone https://github.com/MartinPinillos/monkyforce.git
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

Servicios locales esperados:

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

No asumir que estos comandos están OK hasta ejecutarlos en el entorno correspondiente.

## Jira-first

Toda nueva feature que vaya a implementarse nace primero en Jira.

Flujo canónico:

```text
Necesidad
   ↓
Crear / identificar Card Jira
   ↓
Obtener KAN-XX real
   ↓
Crear branch desde main
feat/<descripcion>-kan-XX
   ↓
Crear / actualizar SPEC
spec/features/NNN-KAN-XX-<descripcion>.md
   ↓
Implementar + tests + builds
   ↓
Pull Request [KAN-XX] Título
   ↓
Verificar Jira Development
   ↓
Merge cuando esté autorizado
```

Ejemplo:

```text
Jira:    KAN-12
Branch:  feat/auth-rbac-kan-12
SPEC:    spec/features/001-KAN-12-auth-rbac.md
Commit:  KAN-12 implementar login
PR:      [KAN-12] Auth / RBAC
```

El mismo branch/PR puede modificar `backend/`, `frontend/`, base de datos, infraestructura y documentación porque todo forma parte del mismo monorepo y de la misma feature.

La creación automática Card Jira → branch por parte de un agente está permitida únicamente cuando el agente tiene acceso autorizado y el usuario pidió crear/iniciar/implementar la feature. El agente nunca debe inventar el Jira Key.
