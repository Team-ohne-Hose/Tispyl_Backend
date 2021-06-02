import {MigrationInterface, QueryRunner} from "typeorm";

export class renameGameLog1622667269704 implements MigrationInterface {
    name = 'renameGameLog1622667269704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("RENAME TABLE Games TO GameLogs");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("RENAME TABLE GameLogs TO Games");
    }

}
