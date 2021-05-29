import { MigrationInterface, QueryRunner } from 'typeorm';

export class cleanupMigrations1619086949265 implements MigrationInterface {
  name = 'cleanupMigrations1619086949265';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `role` CHANGE `createdAt` `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `role` CHANGE `updatedAt` `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `User` CHANGE `user_creation` `user_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` DROP FOREIGN KEY `FK_5e376f6df6c23f47d1aeed743c7`'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` CHANGE `updatedAt` `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` CHANGE `authorId` `authorId` int NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` DROP FOREIGN KEY `FK_124ff0cbc22ea0d62bfc34998ed`'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` DROP FOREIGN KEY `FK_735f650db06db1a69f53bfe46c8`'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` CHANGE `updatedAt` `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` CHANGE `tileSetId` `tileSetId` int NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` CHANGE `boardTileId` `boardTileId` int NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` DROP FOREIGN KEY `FK_f9e85e818a3e6d12eef1c0b16d6`'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` DROP FOREIGN KEY `FK_d980dd48fac8f904fe42edc36b6`'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `createdAt` `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `updatedAt` `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `languageId` `languageId` int NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `userId` `userId` int NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` ADD CONSTRAINT `FK_5e376f6df6c23f47d1aeed743c7` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` ADD CONSTRAINT `FK_124ff0cbc22ea0d62bfc34998ed` FOREIGN KEY (`tileSetId`) REFERENCES `tile_set`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` ADD CONSTRAINT `FK_735f650db06db1a69f53bfe46c8` FOREIGN KEY (`boardTileId`) REFERENCES `board_tile`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` ADD CONSTRAINT `FK_f9e85e818a3e6d12eef1c0b16d6` FOREIGN KEY (`languageId`) REFERENCES `language`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` ADD CONSTRAINT `FK_d980dd48fac8f904fe42edc36b6` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `board_tile` DROP FOREIGN KEY `FK_d980dd48fac8f904fe42edc36b6`'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` DROP FOREIGN KEY `FK_f9e85e818a3e6d12eef1c0b16d6`'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` DROP FOREIGN KEY `FK_735f650db06db1a69f53bfe46c8`'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` DROP FOREIGN KEY `FK_124ff0cbc22ea0d62bfc34998ed`'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` DROP FOREIGN KEY `FK_5e376f6df6c23f47d1aeed743c7`'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `userId` `userId` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `languageId` `languageId` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `updatedAt` `updatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` CHANGE `createdAt` `createdAt` datetime NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` ADD CONSTRAINT `FK_d980dd48fac8f904fe42edc36b6` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `board_tile` ADD CONSTRAINT `FK_f9e85e818a3e6d12eef1c0b16d6` FOREIGN KEY (`languageId`) REFERENCES `language`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` CHANGE `boardTileId` `boardTileId` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` CHANGE `tileSetId` `tileSetId` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` CHANGE `updatedAt` `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` ADD CONSTRAINT `FK_735f650db06db1a69f53bfe46c8` FOREIGN KEY (`boardTileId`) REFERENCES `board_tile`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `set_field` ADD CONSTRAINT `FK_124ff0cbc22ea0d62bfc34998ed` FOREIGN KEY (`tileSetId`) REFERENCES `tile_set`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` CHANGE `authorId` `authorId` int NULL'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` CHANGE `updatedAt` `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `tile_set` ADD CONSTRAINT `FK_5e376f6df6c23f47d1aeed743c7` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION'
    );
    await queryRunner.query(
      'ALTER TABLE `User` CHANGE `user_creation` `user_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `role` CHANGE `updatedAt` `updatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP()'
    );
    await queryRunner.query(
      'ALTER TABLE `role` CHANGE `createdAt` `createdAt` datetime NULL DEFAULT CURRENT_TIMESTAMP()'
    );
  }
}
