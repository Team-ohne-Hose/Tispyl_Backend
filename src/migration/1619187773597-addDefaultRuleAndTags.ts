import {MigrationInterface, QueryRunner} from "typeorm";

export class addDefaultRuleAndTags1619187773597 implements MigrationInterface {
    name = 'addDefaultRuleAndTags1619187773597'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `tag` (`id` int NOT NULL AUTO_INCREMENT, `tag` varchar(20) NOT NULL, `tileSetId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `default_rule` (`id` int NOT NULL AUTO_INCREMENT, `rule` varchar(80) NOT NULL, `tileSetId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `tile_set` ADD `description` varchar(160) NOT NULL");
        await queryRunner.query("ALTER TABLE `tag` ADD CONSTRAINT `FK_16d88716db31b2161756d772863` FOREIGN KEY (`tileSetId`) REFERENCES `tile_set`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `default_rule` ADD CONSTRAINT `FK_468ab957b7212ee526d8ac585da` FOREIGN KEY (`tileSetId`) REFERENCES `tile_set`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `default_rule` DROP FOREIGN KEY `FK_468ab957b7212ee526d8ac585da`");
        await queryRunner.query("ALTER TABLE `tag` DROP FOREIGN KEY `FK_16d88716db31b2161756d772863`");
        await queryRunner.query("ALTER TABLE `tile_set` DROP COLUMN `description`");
        await queryRunner.query("DROP TABLE `default_rule`");
        await queryRunner.query("DROP TABLE `tag`");
    }

}
