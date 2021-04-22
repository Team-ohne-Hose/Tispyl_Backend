import {MigrationInterface, QueryRunner} from "typeorm";

export class changeSetFieldBoardTileRelation1618947888900 implements MigrationInterface {
    name = 'changeSetFieldBoardTileRelation1618947888900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `set_field` DROP FOREIGN KEY `FK_735f650db06db1a69f53bfe46c8`");
        await queryRunner.query("DROP INDEX `REL_735f650db06db1a69f53bfe46c` ON `set_field`");
        await queryRunner.query("ALTER TABLE `set_field` ADD CONSTRAINT `FK_735f650db06db1a69f53bfe46c8` FOREIGN KEY (`boardTileId`) REFERENCES `board_tile`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `set_field` DROP FOREIGN KEY `FK_735f650db06db1a69f53bfe46c8`");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_735f650db06db1a69f53bfe46c` ON `set_field` (`boardTileId`)");
        await queryRunner.query("ALTER TABLE `set_field` ADD CONSTRAINT `FK_735f650db06db1a69f53bfe46c8` FOREIGN KEY (`boardTileId`) REFERENCES `board_tile`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
