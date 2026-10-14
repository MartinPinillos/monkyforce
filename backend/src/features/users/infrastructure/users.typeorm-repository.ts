import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity.js';
import type { CreateUser, UsersRepository } from '../users.repository.js';

@Injectable()
export class UsersTypeormRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  count(): Promise<number> {
    return this.repository.count();
  }

  create(user: CreateUser): Promise<UserEntity> {
    return this.repository.save(this.repository.create(user));
  }

  findByLoginNameWithAuthorization(
    normalizedLoginName: string,
  ): Promise<UserEntity | null> {
    return this.authorizationQuery()
      .where('user.LOGIN_NAME = :loginName', {
        loginName: normalizedLoginName,
      })
      .getOne();
  }

  findByIdWithAuthorization(userId: number): Promise<UserEntity | null> {
    return this.authorizationQuery()
      .where('user.ID = :userId', { userId })
      .getOne();
  }

  private authorizationQuery() {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermission')
      .leftJoinAndSelect('rolePermission.permission', 'permission');
  }
}
