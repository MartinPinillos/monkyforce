import { Inject, Injectable } from '@nestjs/common';
import { PasswordHasherService } from './security/password-hasher.service.js';
import { normalizeLoginName } from '../users/login-name.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../users/users.repository.js';

export interface BootstrapUserInput {
  loginName: string;
  password: string;
}

export interface BootstrapUserResult {
  status: 'created' | 'already-exists';
  userId: number;
  loginName: string;
}

@Injectable()
export class BootstrapUserService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async execute(input: BootstrapUserInput): Promise<BootstrapUserResult> {
    const loginName = normalizeLoginName(input.loginName);
    this.validateInput(loginName, input.password);

    const existing =
      await this.usersRepository.findByLoginNameWithAuthorization(loginName);

    if (existing) {
      return {
        status: 'already-exists',
        userId: existing.id,
        loginName: existing.loginName,
      };
    }

    if ((await this.usersRepository.count()) > 0) {
      throw new Error(
        'Bootstrap refused: an initial user already exists. Use the future user administration flow.',
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.usersRepository.create({
      loginName,
      passwordHash,
      isActive: true,
    });

    return { status: 'created', userId: user.id, loginName: user.loginName };
  }

  private validateInput(loginName: string, password: string): void {
    if (!loginName || loginName.length > 128) {
      throw new Error(
        'BOOTSTRAP_USER_LOGIN_NAME must contain between 1 and 128 characters after normalization',
      );
    }

    if (!password || password.length > 1024) {
      throw new Error(
        'BOOTSTRAP_USER_PASSWORD must contain between 1 and 1024 characters',
      );
    }
  }
}
