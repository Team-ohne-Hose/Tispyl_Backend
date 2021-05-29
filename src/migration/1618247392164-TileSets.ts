import { MigrationInterface, QueryRunner } from 'typeorm';

export class TileSets1618247392164 implements MigrationInterface {
  name = 'TileSets1618247392164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE `tile_set` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(45) NOT NULL, `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(), `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP(), `authorId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` ADD CONSTRAINT `FK_5e376f6df6c23f47d1aeed743c7` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tile_set` DROP FOREIGN KEY `FK_5e376f6df6c23f47d1aeed743c7`'
    );
    await queryRunner.query('DROP TABLE `tile_set`');
  }
}
