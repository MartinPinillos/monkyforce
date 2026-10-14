import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';
import { RoleEntity } from './role.entity.js';

@Entity({ name: 'MF_USER_ROLES' })
export class UserRoleEntity {
  @PrimaryColumn({ name: 'USER_ID', type: 'number' })
  userId: number;

  @PrimaryColumn({ name: 'ROLE_ID', type: 'number' })
  roleId: number;

  @ManyToOne(() => UserEntity, (user) => user.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'USER_ID' })
  user: Relation<UserEntity>;

  @ManyToOne(() => RoleEntity, (role) => role.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ROLE_ID' })
  role: Relation<RoleEntity>;

  @CreateDateColumn({
    name: 'ASSIGNED_AT',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignedAt: Date;
}
