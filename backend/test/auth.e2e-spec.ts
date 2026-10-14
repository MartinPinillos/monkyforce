import {
  Controller,
  Get,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type {
  AuthSessionsRepository,
  CreateAuthSession,
} from '../src/features/auth/auth-sessions.repository.js';
import { AUTH_SESSIONS_REPOSITORY } from '../src/features/auth/auth-sessions.repository.js';
import { AuthController } from '../src/features/auth/auth.controller.js';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../src/features/auth/auth.constants.js';
import { AuthService } from '../src/features/auth/auth.service.js';
import { RequirePermissions } from '../src/features/auth/decorators/require-permissions.decorator.js';
import type { AuthSessionEntity } from '../src/features/auth/entities/auth-session.entity.js';
import { JwtAuthGuard } from '../src/features/auth/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../src/features/auth/guards/permissions.guard.js';
import { AuthCookieService } from '../src/features/auth/security/auth-cookie.service.js';
import { AuthTokenService } from '../src/features/auth/security/auth-token.service.js';
import { PasswordHasherService } from '../src/features/auth/security/password-hasher.service.js';
import type { PermissionEntity } from '../src/features/rbac/entities/permission.entity.js';
import type { RolePermissionEntity } from '../src/features/rbac/entities/role-permission.entity.js';
import type { RoleEntity } from '../src/features/rbac/entities/role.entity.js';
import type { UserRoleEntity } from '../src/features/rbac/entities/user-role.entity.js';
import type { UserEntity } from '../src/features/users/entities/user.entity.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../src/features/users/users.repository.js';

@Controller('test')
class ProtectedTestController {
  @Get('authenticated')
  authenticated() {
    return { allowed: true };
  }

  @Get('permission')
  @RequirePermissions('TEST_ACCESS')
  permission() {
    return { allowed: true };
  }
}

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let passwordHasher: PasswordHasherService;
  let user: UserEntity;
  let agent: ReturnType<typeof request.agent>;
  const sessionsRepository = new InMemorySessionsRepository();

  beforeAll(async () => {
    const config = new ConfigService({
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'test-access-secret-with-at-least-32-characters',
      JWT_REFRESH_SECRET: 'test-refresh-secret-with-at-least-32-characters',
      JWT_ACCESS_TTL_SECONDS: '900',
      JWT_REFRESH_TTL_SECONDS: '604800',
      JWT_ISSUER: 'monkyforce-api-test',
      JWT_AUDIENCE: 'monkyforce-web-test',
    });
    passwordHasher = new PasswordHasherService();
    user = makeUser(await passwordHasher.hash('correct password'));
    const usersRepository = new InMemoryUsersRepository(() => user);

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      controllers: [AuthController, ProtectedTestController],
      providers: [
        AuthService,
        AuthCookieService,
        AuthTokenService,
        PasswordHasherService,
        { provide: ConfigService, useValue: config },
        { provide: USERS_REPOSITORY, useValue: usersRepository },
        { provide: AUTH_SESSIONS_REPOSITORY, useValue: sessionsRepository },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.enableCsrfProtection({
      trustedOrigins: ['http://localhost:4200'],
    });
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.listen(0, '127.0.0.1');
  });

  beforeEach(() => {
    sessionsRepository.clear();
    user.userRoles = [];
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the same generic 401 for unknown login and wrong password', async () => {
    const unknown = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginName: 'missing', password: 'guess' })
      .expect(401);
    const invalid = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginName: 'operator', password: 'wrong' })
      .expect(401);

    expect(unknown.body.message).toBe('Invalid credentials');
    expect(invalid.body.message).toBe(unknown.body.message);
  });

  it('logs in with HttpOnly cookies and returns the current safe user', async () => {
    const login = await agent
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:4200')
      .send({ loginName: ' Operator ', password: 'correct password' })
      .expect(200);

    expect(login.body).toEqual({
      user: {
        id: 1,
        loginName: 'operator',
        roles: [],
        permissions: [],
      },
    });
    expect(cookieHeaders(login)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('mf_access='),
        expect.stringContaining('mf_refresh='),
      ]),
    );
    for (const cookie of cookieHeaders(login)) {
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Path=/');
      expect(cookie).not.toContain('Secure');
    }

    await agent
      .get('/api/auth/me')
      .expect(200)
      .expect(({ body }) => {
        expect(body.user).not.toHaveProperty('passwordHash');
        expect(body.user.loginName).toBe('operator');
      });
  });

  it('returns 401 without a session, 403 without permission and 200 with it', async () => {
    await request(app.getHttpServer())
      .get('/api/test/authenticated')
      .expect(401);

    await login(agent);
    await agent.get('/api/test/permission').expect(403);

    user.userRoles = [makeUserRole('TEST_ROLE', ['TEST_ACCESS'])];
    await agent
      .get('/api/test/permission')
      .expect(200)
      .expect({ allowed: true });
  });

  it('rotates the refresh cookie and keeps the session usable', async () => {
    const loginResponse = await login(agent);
    const previousRefreshCookie = cookiePair(
      loginResponse,
      REFRESH_TOKEN_COOKIE,
    );

    const refresh = await agent
      .post('/api/auth/refresh')
      .set('Origin', 'http://localhost:4200')
      .send({})
      .expect(200);

    expect(
      cookieHeaders(refresh).some((value) => value.startsWith('mf_refresh=')),
    ).toBe(true);
    await agent.get('/api/auth/me').expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Origin', 'http://localhost:4200')
      .set('Cookie', previousRefreshCookie)
      .send({})
      .expect(401);
  });

  it('revokes the server session and clears both cookies on logout', async () => {
    const loginResponse = await login(agent);
    const retainedAccessCookie = cookiePair(loginResponse, ACCESS_TOKEN_COOKIE);

    const logout = await agent
      .post('/api/auth/logout')
      .set('Origin', 'http://localhost:4200')
      .send({})
      .expect(204);

    expect(cookieHeaders(logout)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^mf_access=;/),
        expect.stringMatching(/^mf_refresh=;/),
      ]),
    );
    await agent.get('/api/auth/me').expect(401);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', retainedAccessCookie)
      .expect(401);
  });

  it('rejects a cross-site mutable browser request', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('Origin', 'https://attacker.example')
      .set('Sec-Fetch-Site', 'cross-site')
      .send({ loginName: 'operator', password: 'correct password' })
      .expect(403);
  });

  async function login(testAgent: ReturnType<typeof request.agent>) {
    return testAgent
      .post('/api/auth/login')
      .set('Origin', 'http://localhost:4200')
      .send({ loginName: 'operator', password: 'correct password' })
      .expect(200);
  }
});

class InMemoryUsersRepository implements UsersRepository {
  constructor(private readonly currentUser: () => UserEntity) {}

  async count(): Promise<number> {
    return 1;
  }

  async create(): Promise<UserEntity> {
    throw new Error('Not supported by this in-memory auth fixture');
  }

  async findByLoginNameWithAuthorization(
    normalizedLoginName: string,
  ): Promise<UserEntity | null> {
    const user = this.currentUser();
    return user.loginName === normalizedLoginName ? user : null;
  }

  async findByIdWithAuthorization(userId: number): Promise<UserEntity | null> {
    const user = this.currentUser();
    return user.id === userId ? user : null;
  }
}

class InMemorySessionsRepository implements AuthSessionsRepository {
  private readonly sessions = new Map<string, AuthSessionEntity>();

  clear(): void {
    this.sessions.clear();
  }

  async create(session: CreateAuthSession): Promise<AuthSessionEntity> {
    const entity = {
      ...session,
      revokedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AuthSessionEntity;
    this.sessions.set(entity.id, entity);
    return entity;
  }

  async findActiveById(
    sessionId: string,
    now: Date,
  ): Promise<AuthSessionEntity | null> {
    const session = this.sessions.get(sessionId);
    return session && !session.revokedAt && session.expiresAt > now
      ? session
      : null;
  }

  async rotate(
    sessionId: string,
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
    nextExpiresAt: Date,
    now: Date,
  ): Promise<boolean> {
    const session = await this.findActiveById(sessionId, now);

    if (!session || session.refreshTokenHash !== currentRefreshTokenHash) {
      return false;
    }

    session.refreshTokenHash = nextRefreshTokenHash;
    session.expiresAt = nextExpiresAt;
    session.updatedAt = now;
    return true;
  }

  async revoke(sessionId: string, now: Date): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.revokedAt = now;
      session.updatedAt = now;
    }
  }
}

function makeUser(passwordHash: string): UserEntity {
  return {
    id: 1,
    loginName: 'operator',
    passwordHash,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
  } as UserEntity;
}

function makeUserRole(code: string, permissionCodes: string[]): UserRoleEntity {
  const role = {
    id: 1,
    code,
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
    rolePermissions: [],
  } as RoleEntity;

  role.rolePermissions = permissionCodes.map((permissionCode, index) => {
    const permission = {
      id: index + 1,
      code: permissionCode,
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      rolePermissions: [],
    } as PermissionEntity;

    return {
      roleId: role.id,
      permissionId: permission.id,
      role,
      permission,
      assignedAt: new Date(),
    } as RolePermissionEntity;
  });

  return {
    userId: 1,
    roleId: role.id,
    role,
    assignedAt: new Date(),
  } as UserRoleEntity;
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
