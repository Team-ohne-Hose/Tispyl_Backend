import {MigrationInterface, QueryRunner} from "typeorm";

export class renameGameLog1622667269704 implements MigrationInterface {
    name = 'renameGameLog1622667269704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("RENAME TABLE Games TO GameLogs");
        // await queryRunner.query("CREATE TABLE `GameLogs` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(45) NOT NULL, `author` varchar(45) NOT NULL, `useItems` tinyint NOT NULL, `useMultipleItems` tinyint NOT NULL, `randomizeTiles` tinyint NOT NULL, `startTime` datetime NOT NULL, `endTime` datetime NOT NULL, `maxPlayers` int NOT NULL, `maxRound` int NOT NULL, `tileSetId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        // await queryRunner.query("ALTER TABLE `GameLogs` ADD CONSTRAINT `FK_d561dfab04fb9388d1f4b4d4816` FOREIGN KEY (`tileSetId`) REFERENCES `tile_set`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("RENAME TABLE GameLogs TO Games");
        // await queryRunner.query("ALTER TABLE `GameLogs` DROP FOREIGN KEY `FK_d561dfab04fb9388d1f4b4d4816`");
        // await queryRunner.query("DROP TABLE `GameLogs`");
    }

}
