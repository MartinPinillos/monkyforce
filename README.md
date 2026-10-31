# MonkyForce

Proyecto académico de gestión de producción textil.

## Tecnologías

- Backend: NestJS 11.
- Frontend: Angular 21.
- Base de datos: Oracle en Docker.

## Estructura

```text
monkyforce/
├── backend/
├── frontend/
├── docker/
│   └── crear-schema.sh
├── .env.example
└── docker-compose.yml
```

## Requisitos

- Node.js 22, versión 22.12 o superior.
- npm.
- Docker Desktop con el motor iniciado.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/MartinPinillos/monkyforce.git
cd monkyforce
```

Instalar las dependencias:

```bash
npm install --prefix backend
npx --yes npm@11.6.0 install --prefix frontend
```

Para el frontend se utiliza npm 11.6.0 por un error de instalación con npm 10. Esto no cambia la versión global de npm.

## Base de datos

Copiar `.env.example` como `.env` en la raíz y configurar las contraseñas:

```bash
cp .env.example .env
```

El archivo `.env` es local y no se sube al repositorio.

Levantar Oracle:

```bash
docker compose up -d oracle
```

Ver los logs:

```bash
docker compose logs -f oracle
```

Esperar a que aparezca `MonkyForce schema ready.`. El primer inicio puede tardar varios minutos.

Con `Ctrl+C` se dejan de visualizar los logs; el contenedor continúa funcionando.

Datos de conexión para DBeaver o SQL Developer:

| Campo | Valor |
|---|---|
| Host | localhost |
| Puerto | 1521 |
| Tipo | Service Name |
| Servicio | FREEPDB1 |
| Usuario | Valor de `APP_DB_USERNAME` en `.env` |
| Contraseña | Valor de `APP_DB_PASSWORD` en `.env` |

El script `crear-schema.sh` prepara el usuario/esquema de la aplicación en cada arranque. Los datos se conservan en el volumen `oracle-data`.

## Backend

En una terminal:

```bash
npm --prefix backend run start:dev
```

Disponible en http://localhost:3000.

## Frontend

En otra terminal:

```bash
npm --prefix frontend start
```

Disponible en http://localhost:4200.

## Detener el entorno

Para detener backend y frontend, presionar `Ctrl+C` en sus terminales.

Para detener Oracle:

```bash
docker compose stop oracle
```