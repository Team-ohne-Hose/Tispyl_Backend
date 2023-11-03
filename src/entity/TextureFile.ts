import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TextureFile {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 45, unique: true, nullable: false })
  public name: string;

  @Column({ type: 'varchar', length: 256, unique: false, nullable: false })
  public asset_file: string;

  @Column({ type: 'varchar', length: 256, unique: false })
  public contribution: string;

  constructor(name: string, asset_file: string, contribution: string) {
    this.name = name;
    this.asset_file = asset_file;
    this.contribution = contribution;
  }
}

export class SendableTextureFile {
  public name: string;
  public asset_file: string;
  public contribution: string;

  constructor(tex: TextureFile) {
    this.name = tex.name;
    this.asset_file = tex.asset_file;
    this.contribution = tex.contribution;
  }
}
