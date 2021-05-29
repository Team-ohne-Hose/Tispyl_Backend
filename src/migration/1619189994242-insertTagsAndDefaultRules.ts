import {MigrationInterface, QueryRunner} from "typeorm";

export class insertTagsAndDefaultRules1619189994242 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("UPDATE tile_set SET description=" +
`'Klassische Variante des Tischspiels
Bestimmte Felder sind nicht perfekt für ein Onlinespiel geeignet, dafür gibt das Deck aber das klassische Feeling.'` +
        "WHERE id=1");
        await queryRunner.query("INSERT INTO tag (tag, tileSetId) VALUES ('Classic', 1), ('Balanced', 1), ('NSFW-Light', 1)");
        await queryRunner.query("INSERT INTO default_rule (rule, tileSetId) VALUES ('Habt Spaß!', 1)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM default_rule WHERE tileSetId=1");
        await queryRunner.query("DELETE FROM tag WHERE tileSetId=1");
        await queryRunner.query("UPDATE tile_set SET description='' WHERE id=1");
    }

}
