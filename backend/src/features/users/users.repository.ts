import type { UserEntity } from './entities/user.entity.js';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface CreateUser {
  loginName: string;
  passwordHash: string;
  isActive: boolean;
}

export interface UsersRepository {
  count(): Promise<number>;
  create(user: CreateUser): Promise<UserEntity>;
  findByLoginNameWithAuthorization(
    normalizedLoginName: string,
  ): Promise<UserEntity | null>;
  findByIdWithAuthorization(userId: number): Promise<UserEntity | null>;
}
