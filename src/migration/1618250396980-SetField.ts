import {MigrationInterface, QueryRunner} from "typeorm";

export class SetField1618250396980 implements MigrationInterface {
    name = 'SetField1618250396980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `set_field` (`id` int NOT NULL AUTO_INCREMENT, `fieldNumber` int NOT NULL, `restrictRing` int NULL, `restrictField` int NULL, `createdAt` datetime NOT NULL, `updatedAt` datetime NOT NULL, `tileSetId` int NULL, `boardTileId` int NULL, INDEX `IDX_e3760feebe22dee5d2d2589c3d` (`id`, `fieldNumber`), UNIQUE INDEX `REL_735f650db06db1a69f53bfe46c` (`boardTileId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `set_field` ADD CONSTRAINT `FK_124ff0cbc22ea0d62bfc34998ed` FOREIGN KEY (`tileSetId`) REFERENCES `tile_set`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `set_field` ADD CONSTRAINT `FK_735f650db06db1a69f53bfe46c8` FOREIGN KEY (`boardTileId`) REFERENCES `board_tile`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `set_field` DROP FOREIGN KEY `FK_735f650db06db1a69f53bfe46c8`");
        await queryRunner.query("ALTER TABLE `set_field` DROP FOREIGN KEY `FK_124ff0cbc22ea0d62bfc34998ed`");
        await queryRunner.query("DROP INDEX `REL_735f650db06db1a69f53bfe46c` ON `set_field`");
        await queryRunner.query("DROP INDEX `IDX_e3760feebe22dee5d2d2589c3d` ON `set_field`");
        await queryRunner.query("DROP TABLE `set_field`");
    }

}
