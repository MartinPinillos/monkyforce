import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn('identity', { name: 'ID' })
  id!: number;

  @Column('varchar2', { name: 'LOGIN_NAME', length: 100, unique: true })
  loginName!: string;

  @Column('varchar2', { name: 'PASSWORD_HASH', length: 161 })
  passwordHash!: string;

  @Column('number', { name: 'ACTIVE', precision: 1, default: 1 })
  active!: number;
}
