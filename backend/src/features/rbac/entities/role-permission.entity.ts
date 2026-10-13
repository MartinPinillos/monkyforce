import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { PermissionEntity } from './permission.entity.js';
import { RoleEntity } from './role.entity.js';

@Entity({ name: 'MF_ROLE_PERMISSIONS' })
export class RolePermissionEntity {
  @PrimaryColumn({ name: 'ROLE_ID', type: 'number' })
  roleId: number;

  @PrimaryColumn({ name: 'PERMISSION_ID', type: 'number' })
  permissionId: number;

  @ManyToOne(() => RoleEntity, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ROLE_ID' })
  role: Relation<RoleEntity>;

  @ManyToOne(
    () => PermissionEntity,
    (permission) => permission.rolePermissions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'PERMISSION_ID' })
  permission: Relation<PermissionEntity>;

  @CreateDateColumn({
    name: 'ASSIGNED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignedAt: Date;
}
