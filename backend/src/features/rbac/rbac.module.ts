import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity.js';
import { RolePermissionEntity } from './entities/role-permission.entity.js';
import { RoleEntity } from './entities/role.entity.js';
import { UserRoleEntity } from './entities/user-role.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      PermissionEntity,
      UserRoleEntity,
      RolePermissionEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class RbacModule {}
