import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameInRole1618423842833 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE role CHANGE COLUMN create_time createdAt datetime DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE role CHANGE COLUMN update_time updatedAt datetime DEFAULT CURRENT_TIMESTAMP()'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE role CHANGE COLUMN createdAt create_time datetime'
    );
    await queryRunner.query(
      'ALTER TABLE role CHANGE COLUMN updatedAt update_time datetime'
    );
  }
}
