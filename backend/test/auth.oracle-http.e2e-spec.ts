import {
  Controller,
  Get,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { CreateAuthRbacFoundation1791931262000 } from '../database/migrations/1791931262000-create-auth-rbac-foundation.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../src/features/auth/auth.constants.js';
import { RequirePermissions } from '../src/features/auth/decorators/require-permissions.decorator.js';
import { AuthSessionEntity } from '../src/features/auth/entities/auth-session.entity.js';
import { PasswordHasherService } from '../src/features/auth/security/password-hasher.service.js';
import { PermissionEntity } from '../src/features/rbac/entities/permission.entity.js';
import { RolePermissionEntity } from '../src/features/rbac/entities/role-permission.entity.js';
import { RoleEntity } from '../src/features/rbac/entities/role.entity.js';
import { UserRoleEntity } from '../src/features/rbac/entities/user-role.entity.js';
import { UserEntity } from '../src/features/users/entities/user.entity.js';

const LOGIN_NAME = 'test_http_oracle_user';
const PASSWORD = 'test password supplied at runtime';
const ROLE_CODE = 'TEST_HTTP_ORACLE_ROLE';
const PERMISSION_CODE = 'TEST_HTTP_ORACLE_ACCESS';
const FRONTEND_ORIGIN = 'http://localhost:4200';
const describeOracle =
  process.env.RUN_ORACLE_TESTS === 'true' ? describe : describe.skip;

@Controller('test/oracle-auth')
class OracleProtectedTestController {
  @Get('permission')
  @RequirePermissions(PERMISSION_CODE)
  permission(): { allowed: true } {
    return { allowed: true };
  }
}

describeOracle('Auth HTTP + Oracle integration', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let users: Repository<UserEntity>;
  let roles: Repository<RoleEntity>;
  let permissions: Repository<PermissionEntity>;
  let userRoles: Repository<UserRoleEntity>;
  let rolePermissions: Repository<RolePermissionEntity>;
  let sessions: Repository<AuthSessionEntity>;
  let user: UserEntity;
  let role: RoleEntity;
  let permission: PermissionEntity;

  beforeAll(async () => {
    configureTestEnvironment();
    await runMigrations();
    const { AppModule } = await import('../src/app.module.js');

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [OracleProtectedTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.enableCsrfProtection({ trustedOrigins: [FRONTEND_ORIGIN] });
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = moduleRef.get(DataSource);
    users = dataSource.getRepository(UserEntity);
    roles = dataSource.getRepository(RoleEntity);
    permissions = dataSource.getRepository(PermissionEntity);
    userRoles = dataSource.getRepository(UserRoleEntity);
    rolePermissions = dataSource.getRepository(RolePermissionEntity);
    sessions = dataSource.getRepository(AuthSessionEntity);

    await cleanup();
    const passwordHash = await app.get(PasswordHasherService).hash(PASSWORD);
    user = await users.save(
      users.create({ loginName: LOGIN_NAME, passwordHash, isActive: true }),
    );
    role = await roles.save(
      roles.create({ code: ROLE_CODE, description: null, isActive: true }),
    );
    permission = await permissions.save(
      permissions.create({
        code: PERMISSION_CODE,
        description: null,
        isActive: true,
      }),
    );
  }, 240_000);

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await cleanup();
    }
    if (app) {
      await app.close();
    }
  });

  it('executes the complete cookie session and permission flow against Oracle', async () => {
    const server = app.getHttpServer();
    const login = await request(server)
      .post('/api/auth/login')
      .set('Origin', FRONTEND_ORIGIN)
      .send({ loginName: ` ${LOGIN_NAME.toUpperCase()} `, password: PASSWORD })
      .expect(200);
    const initialAccess = cookiePair(login, ACCESS_TOKEN_COOKIE);
    const initialRefresh = cookiePair(login, REFRESH_TOKEN_COOKIE);

    expect(cookieHeaders(login)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${ACCESS_TOKEN_COOKIE}=`),
        expect.stringContaining(`${REFRESH_TOKEN_COOKIE}=`),
      ]),
    );
    await request(server)
      .get('/api/auth/me')
      .set('Cookie', initialAccess)
      .expect(200)
      .expect(({ body }) => {
        expect(body.user.loginName).toBe(LOGIN_NAME);
        expect(body.user).not.toHaveProperty('passwordHash');
      });
    await request(server)
      .get('/api/test/oracle-auth/permission')
      .set('Cookie', initialAccess)
      .expect(403);

    await userRoles.save(
      userRoles.create({ userId: user.id, roleId: role.id }),
    );
    await rolePermissions.save(
      rolePermissions.create({
        roleId: role.id,
        permissionId: permission.id,
      }),
    );
    await request(server)
      .get('/api/test/oracle-auth/permission')
      .set('Cookie', initialAccess)
      .expect(200)
      .expect({ allowed: true });

    const refresh = await request(server)
      .post('/api/auth/refresh')
      .set('Origin', FRONTEND_ORIGIN)
      .set('Cookie', initialRefresh)
      .send({})
      .expect(200);
    const rotatedAccess = cookiePair(refresh, ACCESS_TOKEN_COOKIE);
    const rotatedRefresh = cookiePair(refresh, REFRESH_TOKEN_COOKIE);

    await request(server)
      .post('/api/auth/refresh')
      .set('Origin', FRONTEND_ORIGIN)
      .set('Cookie', initialRefresh)
      .send({})
      .expect(401);

    const persistedSession = await sessions.findOneByOrFail({
      userId: user.id,
    });
    expect(persistedSession.revokedAt).toBeNull();

    await request(server)
      .post('/api/auth/logout')
      .set('Origin', FRONTEND_ORIGIN)
      .set('Cookie', `${rotatedAccess}; ${rotatedRefresh}`)
      .send({})
      .expect(204);
    await request(server)
      .get('/api/auth/me')
      .set('Cookie', rotatedAccess)
      .expect(401);

    const revokedSession = await sessions.findOneByOrFail({
      id: persistedSession.id,
    });
    expect(revokedSession.revokedAt).toBeInstanceOf(Date);
  }, 120_000);

  async function cleanup(): Promise<void> {
    const existingUser = await users.findOne({
      where: { loginName: LOGIN_NAME },
    });
    const existingRole = await roles.findOne({ where: { code: ROLE_CODE } });
    const existingPermission = await permissions.findOne({
      where: { code: PERMISSION_CODE },
    });

    if (existingUser) {
      await users.remove(existingUser);
    }
    if (existingRole) {
      await roles.remove(existingRole);
    }
    if (existingPermission) {
      await permissions.remove(existingPermission);
    }
  }
});

function configureTestEnvironment(): void {
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST ??= 'localhost';
  process.env.DB_PORT ??= '1521';
  process.env.DB_SERVICE_NAME ??= 'FREEPDB1';
  process.env.DB_USERNAME ??= 'MONKYFORCE';
  process.env.DB_PASSWORD ??= 'MonkyForceDev_2026';
  process.env.FRONTEND_ORIGIN = FRONTEND_ORIGIN;
  process.env.JWT_ACCESS_SECRET =
    'oracle-http-access-secret-with-at-least-32-characters';
  process.env.JWT_REFRESH_SECRET =
    'oracle-http-refresh-secret-with-at-least-32-characters';
  process.env.JWT_ACCESS_TTL_SECONDS = '900';
  process.env.JWT_REFRESH_TTL_SECONDS = '604800';
  process.env.JWT_ISSUER = 'monkyforce-oracle-http-test';
  process.env.JWT_AUDIENCE = 'monkyforce-oracle-http-test';
  process.env.SWAGGER_ENABLED = 'false';
}

async function runMigrations(): Promise<void> {
  const migrationDataSource = new DataSource({
    type: 'oracle',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    serviceName: process.env.DB_SERVICE_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [
      UserEntity,
      RoleEntity,
      PermissionEntity,
      UserRoleEntity,
      RolePermissionEntity,
      AuthSessionEntity,
    ],
    migrations: [CreateAuthRbacFoundation1791931262000],
    synchronize: false,
    logging: false,
  });

  try {
    await migrationDataSource.initialize();
    await migrationDataSource.runMigrations();
  } finally {
    if (migrationDataSource.isInitialized) {
      await migrationDataSource.destroy();
    }
  }
}

function cookieHeaders(response: request.Response): string[] {
  const header = response.headers['set-cookie'];
  return Array.isArray(header) ? header : header ? [header] : [];
}

function cookiePair(response: request.Response, name: string): string {
  const header = cookieHeaders(response).find((value) =>
    value.startsWith(`${name}=`),
  );

  if (!header) {
    throw new Error(`Expected ${name} Set-Cookie header`);
  }

  return header.split(';', 1)[0];
}
