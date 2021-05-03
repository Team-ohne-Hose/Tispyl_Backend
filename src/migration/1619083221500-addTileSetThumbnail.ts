import {MigrationInterface, QueryRunner} from "typeorm";

export class addTileSetThumbnail1619083221500 implements MigrationInterface {
    name = 'addTileSetThumbnail1619083221500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tile_set` ADD `thumbnailPath` varchar(45) NULL");
        await queryRunner.query("UPDATE tile_set SET thumbnailPath='/assets/classic_ts.png' where id=1");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tile_set` DROP COLUMN `thumbnailPath`");
    }
}
