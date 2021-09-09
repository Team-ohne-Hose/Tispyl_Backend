import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateRole1631181878502 implements MigrationInterface {
  name = 'updateRole1631181878502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `role` ADD `name` varchar(64) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `role` DROP COLUMN `description`');
    await queryRunner.query(
      'ALTER TABLE `role` ADD `description` varchar(256) NOT NULL'
    );

    await queryRunner.query(
      "INSERT INTO `role` (id,  name, description) VALUES (1, 'ADMIN', 'MASTERRACE'), (2, 'MODERATOR', 'Community Bimbo')"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `role` DROP COLUMN `description`');
    await queryRunner.query(
      'ALTER TABLE `role` ADD `description` varchar(65) NOT NULL'
    );
    await queryRunner.query('ALTER TABLE `role` DROP COLUMN `name`');

    await queryRunner.query('DELETE FROM `role` WHERE id in (1,2)');
  }
}
