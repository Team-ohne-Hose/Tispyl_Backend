import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixTypo1659988746841 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE board_tile SET description = ? WHERE name = `Perspektivwechsel`',
      [
        'Wechselt die Spielrichtung. (Tipp: /perspectiveChange)',
        'Perspektivwechsel',
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE board_tile SET description = ? WHERE name = ?',
      [
        'Wechselt die Spielrichtung. (Tipp: /persperciveChange)',
        'Perspektivwechsel',
      ]
    );
  }
}
