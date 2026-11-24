import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('AUTH_SESSIONS')
export class AuthSession {
  @PrimaryColumn('varchar2', { name: 'ID', length: 36 })
  id!: string;

  @Column('number', { name: 'USER_ID' })
  userId!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'USER_ID',
    foreignKeyConstraintName: 'FK_AUTH_SESSIONS_USER',
  })
  user!: User;

  @Column('varchar2', { name: 'REFRESH_TOKEN_HASH', length: 64 })
  refreshTokenHash!: string;

  @Column('timestamp with time zone', { name: 'EXPIRES_AT' })
  expiresAt!: Date;

  @Column('timestamp with time zone', { name: 'REVOKED_AT', nullable: true })
  revokedAt!: Date | null;
}
