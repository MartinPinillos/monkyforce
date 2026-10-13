import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

const idColumn = {
  name: 'ID',
  type: 'number',
  precision: 19,
  scale: 0,
  isPrimary: true,
  isGenerated: true,
  generationStrategy: 'increment' as const,
};

const activeColumn = {
  name: 'IS_ACTIVE',
  type: 'char',
  length: '1',
  default: "'Y'",
};

const createdAtColumn = {
  name: 'CREATED_AT',
  type: 'timestamp',
  default: 'CURRENT_TIMESTAMP',
};

const updatedAtColumn = {
  name: 'UPDATED_AT',
  type: 'timestamp',
  default: 'CURRENT_TIMESTAMP',
};

export class CreateAuthRbacFoundation1791931262000 implements MigrationInterface {
  name = 'CreateAuthRbacFoundation1791931262000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'MF_USERS',
        columns: [
          idColumn,
          { name: 'LOGIN_NAME', type: 'varchar2', length: '128' },
          { name: 'PASSWORD_HASH', type: 'varchar2', length: '512' },
          activeColumn,
          createdAtColumn,
          updatedAtColumn,
        ],
        uniques: [{ name: 'UQ_MF_USERS_LOGIN', columnNames: ['LOGIN_NAME'] }],
        checks: [
          {
            name: 'CK_MF_USERS_ACTIVE',
            expression: "IS_ACTIVE IN ('Y', 'N')",
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'MF_ROLES',
        columns: [
          idColumn,
          { name: 'CODE', type: 'varchar2', length: '100' },
          {
            name: 'DESCRIPTION',
            type: 'varchar2',
            length: '255',
            isNullable: true,
          },
          activeColumn,
          createdAtColumn,
          updatedAtColumn,
        ],
        uniques: [{ name: 'UQ_MF_ROLES_CODE', columnNames: ['CODE'] }],
        checks: [
          {
            name: 'CK_MF_ROLES_ACTIVE',
            expression: "IS_ACTIVE IN ('Y', 'N')",
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'MF_PERMISSIONS',
        columns: [
          idColumn,
          { name: 'CODE', type: 'varchar2', length: '120' },
          {
            name: 'DESCRIPTION',
            type: 'varchar2',
            length: '255',
            isNullable: true,
          },
          activeColumn,
          createdAtColumn,
          updatedAtColumn,
        ],
        uniques: [{ name: 'UQ_MF_PERMS_CODE', columnNames: ['CODE'] }],
        checks: [
          {
            name: 'CK_MF_PERMS_ACTIVE',
            expression: "IS_ACTIVE IN ('Y', 'N')",
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'MF_USER_ROLES',
        columns: [
          {
            name: 'USER_ID',
            type: 'number',
            precision: 19,
            scale: 0,
            isPrimary: true,
          },
          {
            name: 'ROLE_ID',
            type: 'number',
            precision: 19,
            scale: 0,
            isPrimary: true,
          },
          {
            name: 'ASSIGNED_AT',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
    await queryRunner.createForeignKeys('MF_USER_ROLES', [
      new TableForeignKey({
        name: 'FK_MF_UR_USER',
        columnNames: ['USER_ID'],
        referencedTableName: 'MF_USERS',
        referencedColumnNames: ['ID'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_MF_UR_ROLE',
        columnNames: ['ROLE_ID'],
        referencedTableName: 'MF_ROLES',
        referencedColumnNames: ['ID'],
        onDelete: 'CASCADE',
      }),
    ]);
    await queryRunner.createIndex(
      'MF_USER_ROLES',
      new TableIndex({ name: 'IX_MF_UR_ROLE', columnNames: ['ROLE_ID'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'MF_ROLE_PERMISSIONS',
        columns: [
          {
            name: 'ROLE_ID',
            type: 'number',
            precision: 19,
            scale: 0,
            isPrimary: true,
          },
          {
            name: 'PERMISSION_ID',
            type: 'number',
            precision: 19,
            scale: 0,
            isPrimary: true,
          },
          {
            name: 'ASSIGNED_AT',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
    await queryRunner.createForeignKeys('MF_ROLE_PERMISSIONS', [
      new TableForeignKey({
        name: 'FK_MF_RP_ROLE',
        columnNames: ['ROLE_ID'],
        referencedTableName: 'MF_ROLES',
        referencedColumnNames: ['ID'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_MF_RP_PERMISSION',
        columnNames: ['PERMISSION_ID'],
        referencedTableName: 'MF_PERMISSIONS',
        referencedColumnNames: ['ID'],
        onDelete: 'CASCADE',
      }),
    ]);
    await queryRunner.createIndex(
      'MF_ROLE_PERMISSIONS',
      new TableIndex({
        name: 'IX_MF_RP_PERMISSION',
        columnNames: ['PERMISSION_ID'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'MF_AUTH_SESSIONS',
        columns: [
          { name: 'ID', type: 'varchar2', length: '36', isPrimary: true },
          { name: 'USER_ID', type: 'number', precision: 19, scale: 0 },
          { name: 'REFRESH_TOKEN_HASH', type: 'varchar2', length: '64' },
          { name: 'EXPIRES_AT', type: 'timestamp' },
          { name: 'REVOKED_AT', type: 'timestamp', isNullable: true },
          createdAtColumn,
          updatedAtColumn,
        ],
      }),
    );
    await queryRunner.createForeignKey(
      'MF_AUTH_SESSIONS',
      new TableForeignKey({
        name: 'FK_MF_SESSION_USER',
        columnNames: ['USER_ID'],
        referencedTableName: 'MF_USERS',
        referencedColumnNames: ['ID'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createIndices('MF_AUTH_SESSIONS', [
      new TableIndex({
        name: 'IX_MF_SESSION_USER',
        columnNames: ['USER_ID'],
      }),
      new TableIndex({
        name: 'IX_MF_SESSION_EXPIRES',
        columnNames: ['EXPIRES_AT'],
      }),
    ]);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('MF_AUTH_SESSIONS', true);
    await queryRunner.dropTable('MF_ROLE_PERMISSIONS', true);
    await queryRunner.dropTable('MF_USER_ROLES', true);
    await queryRunner.dropTable('MF_PERMISSIONS', true);
    await queryRunner.dropTable('MF_ROLES', true);
    await queryRunner.dropTable('MF_USERS', true);
  }
}
