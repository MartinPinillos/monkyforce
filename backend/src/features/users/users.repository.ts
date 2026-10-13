import type { UserEntity } from './entities/user.entity.js';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface UsersRepository {
  findByLoginNameWithAuthorization(
    normalizedLoginName: string,
  ): Promise<UserEntity | null>;
  findByIdWithAuthorization(userId: number): Promise<UserEntity | null>;
}
