import {MigrationInterface, QueryRunner} from "typeorm";

export class LanguageMigration1617313838924 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE language CHANGE  `name` lanname varchar(255)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE language CHANGE `lanname` name varchar(65)");
    }

}
