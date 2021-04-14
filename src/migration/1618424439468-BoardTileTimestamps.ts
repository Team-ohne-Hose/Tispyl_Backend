import {MigrationInterface, QueryRunner} from "typeorm";

export class BoardTileTimestamps1618424439468 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE board_tile ADD createdAt datetime");
      await queryRunner.query("ALTER TABLE board_tile ADD updatedAt datetime");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query("ALTER TABLE board_tile DROP COLUMN createdAt");
      await queryRunner.query("ALTER TABLE board_tile DROP COLUMN updatedAt");
    }

}
