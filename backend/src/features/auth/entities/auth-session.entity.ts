import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity.js';

@Entity({ name: 'MF_AUTH_SESSIONS' })
export class AuthSessionEntity {
  @PrimaryColumn({ name: 'ID', type: 'varchar2', length: 36 })
  id: string;

  @Column({ name: 'USER_ID', type: 'number' })
  userId: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'USER_ID' })
  user: Relation<UserEntity>;

  @Column({ name: 'REFRESH_TOKEN_HASH', type: 'varchar2', length: 64 })
  refreshTokenHash: string;

  @Column({ name: 'EXPIRES_AT', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'REVOKED_AT', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

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
}
