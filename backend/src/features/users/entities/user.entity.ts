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
import { UserRoleEntity } from '../../rbac/entities/user-role.entity.js';

@Entity({ name: 'MF_USERS' })
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'ID', type: 'number' })
  id: number;

  @Column({ name: 'LOGIN_NAME', type: 'varchar2', length: 128, unique: true })
  loginName: string;

  @Column({ name: 'PASSWORD_HASH', type: 'varchar2', length: 512 })
  passwordHash: string;

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

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles: Relation<UserRoleEntity[]>;
}
