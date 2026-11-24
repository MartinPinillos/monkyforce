import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSessions1794787200001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE AUTH_SESSIONS (
        ID VARCHAR2(36 CHAR),
        USER_ID NUMBER NOT NULL,
        REFRESH_TOKEN_HASH VARCHAR2(64 CHAR) NOT NULL,
        EXPIRES_AT TIMESTAMP WITH TIME ZONE NOT NULL,
        REVOKED_AT TIMESTAMP WITH TIME ZONE,
        CONSTRAINT PK_AUTH_SESSIONS PRIMARY KEY (ID),
        CONSTRAINT FK_AUTH_SESSIONS_USER FOREIGN KEY (USER_ID) REFERENCES USERS (ID)
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE AUTH_SESSIONS');
  }
}
