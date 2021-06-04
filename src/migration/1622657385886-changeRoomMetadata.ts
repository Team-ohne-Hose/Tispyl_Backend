import {MigrationInterface, QueryRunner} from "typeorm";

export class changeRoomMetadata1622657385886 implements MigrationInterface {
    name = 'changeRoomMetadata1622657385886'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `Games` DROP COLUMN `skin`");
        await queryRunner.query("ALTER TABLE `Games` ADD `useItems` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `Games` ADD `useMultipleItems` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `Games` ADD `tileSetId` int NULL");
        await queryRunner.query("ALTER TABLE `Games` ADD CONSTRAINT `FK_57dba8d3d4ab9e85fcf4d5e56fc` FOREIGN KEY (`tileSetId`) REFERENCES `tile_set`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `Games` DROP FOREIGN KEY `FK_57dba8d3d4ab9e85fcf4d5e56fc`");
        await queryRunner.query("ALTER TABLE `Games` DROP COLUMN `tileSetId`");
        await queryRunner.query("ALTER TABLE `Games` DROP COLUMN `useMultipleItems`");
        await queryRunner.query("ALTER TABLE `Games` DROP COLUMN `useItems`");
        await queryRunner.query("ALTER TABLE `Games` ADD `skin` varchar(45) NOT NULL");
    }

}
