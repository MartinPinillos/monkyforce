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

En Windows, Docker Desktop necesita virtualización habilitada en BIOS/UEFI
(Intel VT-x o AMD SVM) y el motor WSL 2. Si informa `no virtualization available`,
habilitarla y reiniciar Windows antes de levantar Oracle.

Docker se utiliza para Oracle; backend y frontend se ejecutan con npm.

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

Configurar también `JWT_SECRET` con un valor aleatorio de al menos 32 bytes
para que el backend pueda arrancar. Se puede generar uno con:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

Validar la configuración sin mostrar contraseñas:

```bash
docker compose config --quiet
```

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

### Migración de telas y colores (primera parte)

Configurar el `.env` de la raíz y levantar Oracle como se indica arriba. La
conexión usa `APP_DB_USERNAME`, `APP_DB_PASSWORD` y `APP_DB_CONNECT_STRING`.
No se ejecutan migraciones automáticamente al iniciar el backend.

```bash
npm --prefix backend run migration:show
npm --prefix backend run migration:run
npm --prefix backend run migration:show
```

Contrato físico propuesto para P01 (sin DER disponible):

- `MF_FABRICS`: ID identity, nombre de hasta 120 caracteres, unidad `M`/`KG`,
  ancho de referencia en metros `NUMBER(8,3)` positivo y habilitado `0`/`1`.
- `MF_FABRIC_COLORS`: ID identity, FK a tela, nombre de hasta 80 caracteres y
  habilitado `0`/`1`. Cada color pertenece a una tela; no hay catálogo global.
- Nombres obligatorios y únicos ignorando mayúsculas y espacios exteriores:
  globalmente para telas y por tela para colores, incluso estando deshabilitados.
- La FK impide eliminar una tela con colores. No hay borrado en cascada.
- TypeORM registra ejecuciones en `MF_MIGRATIONS`. No se crean ni alteran tablas
  de usuarios, roles o permisos. Docker y su volumen se reutilizan.
- Entidades, repositorios e integración de persistencia con Nest quedan para
  la segunda parte. No se incluyen endpoints ni pantallas en esta entrega.

Validación manual en una base de desarrollo descartable:

1. Ejecutar la migración y comprobar las dos tablas, sus constraints e índices
   en `USER_TABLES`, `USER_CONSTRAINTS` y `USER_INDEXES`.
2. Insertar una tela válida y un color con su ID. Confirmar que se rechazan
   unidad distinta de `M`/`KG`, ancho cero/negativo, nombres vacíos o solo
   espacios, estado distinto de `0`/`1` y un color con FK inexistente.
3. Confirmar que nombres como `Azul` y ` azul ` colisionan en una misma tela,
   pero pueden existir en telas diferentes. Comprobar que una tela con colores
   no puede eliminarse.
4. Revertir, comprobar que las tablas de telas desaparecen y las tablas ajenas
   permanecen intactas; volver a ejecutar para comprobar recreación:

```bash
npm --prefix backend run migration:revert
npm --prefix backend run migration:run
```

La reversión elimina los datos de estas dos tablas. Oracle hace commit implícito
del DDL: una ejecución fallida puede dejar objetos parciales. La migración
rechaza tablas preexistentes; no las omite ni las borra automáticamente. Ante
un fallo, revisar el esquema y el historial antes de reintentar. `revert`
revierte la última migración registrada, no una ejecución parcial fallida.

Referencia CLI: https://typeorm.io/docs/migrations/executing/

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
