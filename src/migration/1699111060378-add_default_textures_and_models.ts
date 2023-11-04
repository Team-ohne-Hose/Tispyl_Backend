import {MigrationInterface, QueryRunner} from "typeorm";

export class addDefaultTexturesAndModels1699111060378 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Default bcap textures
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_128', 'default_bcap_128.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_256', 'default_bcap_256.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_1024', 'default_bcap_1024.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_normal_128', 'default_bcap_normal_128.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_normal_256', 'default_bcap_normal_256.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_normal_1024', 'default_bcap_normal_1024.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_spec_128', 'default_bcap_spec_128.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_spec_256', 'default_bcap_spec_256.png', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_bcap_spec_1024', 'default_bcap_spec_1024.png', '')");
        // Default cubemap textures
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_cm_posx', 'default_cm_posx.jpg', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_cm_posy', 'default_cm_posy.jpg', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_cm_posz', 'default_cm_posz.jpg', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_cm_negx', 'default_cm_negx.jpg', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_cm_negy', 'default_cm_negy.jpg', '')");
        await queryRunner.query("INSERT INTO texture_file (name, asset_file, contribution) VALUES ('default_cm_negz', 'default_cm_negz.jpg', '')");
        // Default cubemap
        await queryRunner.query("INSERT INTO cube_texture (name, texturePosXId, texturePosYId, texturePosZId, textureNegXId, textureNegYId, textureNegZId) VALUES ('default_cm', " +
            "(SELECT id FROM texture_file WHERE name='default_cm_posx')," +
            "(SELECT id FROM texture_file WHERE name='default_cm_posy')," +
            "(SELECT id FROM texture_file WHERE name='default_cm_posz')," +
            "(SELECT id FROM texture_file WHERE name='default_cm_negx')," +
            "(SELECT id FROM texture_file WHERE name='default_cm_negy')," +
            "(SELECT id FROM texture_file WHERE name='default_cm_negz'))");
        // Default models
        await queryRunner.query("INSERT INTO gltf_file (name, asset_file, contribution) VALUES ('default_bcap_model', 'default_bcap_model_blank.glb', '')");
        await queryRunner.query("INSERT INTO gltf_file (name, asset_file, contribution) VALUES ('default_dice_model', 'default_dice_model.glb', '')");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM gltf_file WHERE name LIKE 'default_%_model%'");
        await queryRunner.query("DELETE FROM cube_texture WHERE name='default_cm'");
        await queryRunner.query("DELETE FROM texture_file WHERE name LIKE 'default_bcap_%'");
        await queryRunner.query("DELETE FROM texture_file WHERE name LIKE 'default_cm_%'");
    }

}
