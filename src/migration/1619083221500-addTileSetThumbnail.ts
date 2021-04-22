import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTileSetThumbnail1619083221500 implements MigrationInterface {
  name = 'addTileSetThumbnail1619083221500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tile_set` ADD `thumbnailPath` varchar(45) NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `tile_set` DROP COLUMN `thumbnailPath`'
    );
  }
}
