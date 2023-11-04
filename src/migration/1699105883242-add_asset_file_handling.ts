import {MigrationInterface, QueryRunner} from "typeorm";

export class addAssetFileHandling1699105883242 implements MigrationInterface {
    name = 'addAssetFileHandling1699105883242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`texture_file\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(45) NOT NULL, \`asset_file\` varchar(256) NOT NULL, \`contribution\` varchar(256) NOT NULL, UNIQUE INDEX \`IDX_6bbb4184f468adbf8235f5127b\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cube_texture\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(45) NOT NULL, \`texturePosXId\` int NOT NULL, \`texturePosYId\` int NOT NULL, \`texturePosZId\` int NOT NULL, \`textureNegXId\` int NOT NULL, \`textureNegYId\` int NOT NULL, \`textureNegZId\` int NOT NULL, UNIQUE INDEX \`IDX_92eaeb3c9ad0e101ef050e57b9\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gltf_file\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(45) NOT NULL, \`asset_file\` varchar(256) NOT NULL, \`contribution\` varchar(256) NOT NULL, UNIQUE INDEX \`IDX_474483218968c7e4798696918c\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` ADD CONSTRAINT \`FK_62e1f2fe4019450fc3812accbab\` FOREIGN KEY (\`texturePosXId\`) REFERENCES \`texture_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` ADD CONSTRAINT \`FK_1c0588dfb4952c683a3998e7d0a\` FOREIGN KEY (\`texturePosYId\`) REFERENCES \`texture_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` ADD CONSTRAINT \`FK_9c19c48fcd752d44a6bba31db8e\` FOREIGN KEY (\`texturePosZId\`) REFERENCES \`texture_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` ADD CONSTRAINT \`FK_c067ac40a15536615dce5d6dbd4\` FOREIGN KEY (\`textureNegXId\`) REFERENCES \`texture_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` ADD CONSTRAINT \`FK_c73509d0df77f26e83c42e7e9e4\` FOREIGN KEY (\`textureNegYId\`) REFERENCES \`texture_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` ADD CONSTRAINT \`FK_edcfd12b50050d56dd57a1be402\` FOREIGN KEY (\`textureNegZId\`) REFERENCES \`texture_file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`cube_texture\` DROP FOREIGN KEY \`FK_edcfd12b50050d56dd57a1be402\``);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` DROP FOREIGN KEY \`FK_c73509d0df77f26e83c42e7e9e4\``);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` DROP FOREIGN KEY \`FK_c067ac40a15536615dce5d6dbd4\``);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` DROP FOREIGN KEY \`FK_9c19c48fcd752d44a6bba31db8e\``);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` DROP FOREIGN KEY \`FK_1c0588dfb4952c683a3998e7d0a\``);
        await queryRunner.query(`ALTER TABLE \`cube_texture\` DROP FOREIGN KEY \`FK_62e1f2fe4019450fc3812accbab\``);
        await queryRunner.query(`DROP INDEX \`IDX_474483218968c7e4798696918c\` ON \`gltf_file\``);
        await queryRunner.query(`DROP TABLE \`gltf_file\``);
        await queryRunner.query(`DROP INDEX \`IDX_92eaeb3c9ad0e101ef050e57b9\` ON \`cube_texture\``);
        await queryRunner.query(`DROP TABLE \`cube_texture\``);
        await queryRunner.query(`DROP INDEX \`IDX_6bbb4184f468adbf8235f5127b\` ON \`texture_file\``);
        await queryRunner.query(`DROP TABLE \`texture_file\``);
    }

}
