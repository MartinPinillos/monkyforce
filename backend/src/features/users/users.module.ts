import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacModule } from '../rbac/rbac.module.js';
import { UserEntity } from './entities/user.entity.js';
import { UsersTypeormRepository } from './infrastructure/users.typeorm-repository.js';
import { USERS_REPOSITORY } from './users.repository.js';

@Module({
  imports: [RbacModule, TypeOrmModule.forFeature([UserEntity])],
  providers: [
    UsersTypeormRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: UsersTypeormRepository,
    },
  ],
  exports: [USERS_REPOSITORY, TypeOrmModule],
})
export class UsersModule {}
