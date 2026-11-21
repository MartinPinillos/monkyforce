import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFabrics1795219200000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    
    if (
      (await queryRunner.hasTable('MF_FABRICS')) ||
      (await queryRunner.hasTable('MF_FABRIC_COLORS'))
    ) {
      throw new Error(
        'Fabric tables already exist; reconcile the schema before migrating.',
      );
    }

    await queryRunner.query(`CREATE TABLE MF_FABRICS (
      ID NUMBER(10) GENERATED ALWAYS AS IDENTITY,
      NAME VARCHAR2(120 CHAR) NOT NULL,
      UNIT VARCHAR2(2 CHAR) NOT NULL,
      REFERENCE_WIDTH NUMBER(8,3) NOT NULL,
      IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL,
      CONSTRAINT PK_MF_FABRICS PRIMARY KEY (ID),
      CONSTRAINT CK_MF_FABRICS_NAME CHECK (TRIM(NAME) IS NOT NULL),
      CONSTRAINT CK_MF_FABRICS_UNIT CHECK (UNIT IN ('M', 'KG')),
      CONSTRAINT CK_MF_FABRICS_WIDTH CHECK (REFERENCE_WIDTH > 0),
      CONSTRAINT CK_MF_FABRICS_ACTIVE CHECK (IS_ACTIVE IN (0, 1))
    )`);
    await queryRunner.query(`CREATE UNIQUE INDEX UQ_MF_FABRICS_NAME
      ON MF_FABRICS (UPPER(TRIM(NAME)))`);

    await queryRunner.query(`CREATE TABLE MF_FABRIC_COLORS (
      ID NUMBER(10) GENERATED ALWAYS AS IDENTITY,
      FABRIC_ID NUMBER(10) NOT NULL,
      NAME VARCHAR2(80 CHAR) NOT NULL,
      IS_ACTIVE NUMBER(1) DEFAULT 1 NOT NULL,
      CONSTRAINT PK_MF_FABRIC_COLORS PRIMARY KEY (ID),
      CONSTRAINT FK_MF_COLORS_FABRIC FOREIGN KEY (FABRIC_ID) REFERENCES MF_FABRICS (ID),
      CONSTRAINT CK_MF_COLORS_NAME CHECK (TRIM(NAME) IS NOT NULL),
      CONSTRAINT CK_MF_COLORS_ACTIVE CHECK (IS_ACTIVE IN (0, 1))
    )`);

    await queryRunner.query(`CREATE UNIQUE INDEX UQ_MF_COLORS_FABRIC_NAME
      ON MF_FABRIC_COLORS (FABRIC_ID, UPPER(TRIM(NAME)))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE MF_FABRIC_COLORS');
    await queryRunner.query('DROP TABLE MF_FABRICS');
  }
}
