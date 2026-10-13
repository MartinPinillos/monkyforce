import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { oracleBooleanTransformer } from '../../../database/transformers/oracle-boolean.transformer.js';
import { RolePermissionEntity } from './role-permission.entity.js';
import { UserRoleEntity } from './user-role.entity.js';

@Entity({ name: 'MF_ROLES' })
export class RoleEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id: number;

  @Column({ name: 'CODE', type: 'varchar2', length: 100, unique: true })
  code: string;

  @Column({
    name: 'DESCRIPTION',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  description: string | null;

  @Column({
    name: 'IS_ACTIVE',
    type: 'char',
    length: 1,
    default: () => "'Y'",
    transformer: oracleBooleanTransformer,
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'CREATED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'UPDATED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles: Relation<UserRoleEntity[]>;

  @OneToMany(
    () => RolePermissionEntity,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions: Relation<RolePermissionEntity[]>;
}
