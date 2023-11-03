import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SendableTextureFile, TextureFile } from './TextureFile';
@Entity()
export class CubeTexture {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 45, unique: true, nullable: false })
  public name: string;

  @ManyToOne(() => TextureFile, { eager: true, nullable: false })
  @JoinColumn()
  public texture_pos_x: number | TextureFile;

  @ManyToOne(() => TextureFile, { eager: true, nullable: false })
  @JoinColumn()
  public texture_pos_y: number | TextureFile;

  @ManyToOne(() => TextureFile, { eager: true, nullable: false })
  @JoinColumn()
  public texture_pos_z: number | TextureFile;

  @ManyToOne(() => TextureFile, { eager: true, nullable: false })
  @JoinColumn()
  public texture_neg_x: number | TextureFile;

  @ManyToOne(() => TextureFile, { eager: true, nullable: false })
  @JoinColumn()
  public texture_neg_y: number | TextureFile;

  @ManyToOne(() => TextureFile, { eager: true, nullable: false })
  @JoinColumn()
  public texture_neg_z: number | TextureFile;

  constructor(name, pos_x, pos_y, pos_z, neg_x, neg_y, neg_z) {
    this.name = name;
    this.texture_pos_x = pos_x;
    this.texture_pos_y = pos_y;
    this.texture_pos_z = pos_z;
    this.texture_neg_x = neg_x;
    this.texture_neg_y = neg_y;
    this.texture_neg_z = neg_z;
  }
}

export class SendableCubeTexture {
  public name: string;
  public texture_pos_x: SendableTextureFile;
  public texture_pos_y: SendableTextureFile;
  public texture_pos_z: SendableTextureFile;
  public texture_neg_x: SendableTextureFile;
  public texture_neg_y: SendableTextureFile;
  public texture_neg_z: SendableTextureFile;

  constructor(ct: CubeTexture) {
    if (
      ct.texture_pos_x instanceof TextureFile &&
      ct.texture_pos_y instanceof TextureFile &&
      ct.texture_pos_z instanceof TextureFile &&
      ct.texture_neg_x instanceof TextureFile &&
      ct.texture_neg_y instanceof TextureFile &&
      ct.texture_neg_z instanceof TextureFile
    ) {
      this.name = ct.name;
      this.texture_pos_x = new SendableTextureFile(ct.texture_pos_x);
      this.texture_pos_y = new SendableTextureFile(ct.texture_pos_y);
      this.texture_pos_z = new SendableTextureFile(ct.texture_pos_z);
      this.texture_neg_x = new SendableTextureFile(ct.texture_neg_x);
      this.texture_neg_y = new SendableTextureFile(ct.texture_neg_y);
      this.texture_neg_z = new SendableTextureFile(ct.texture_neg_z);
    } else {
      throw new Error('Failed to build SendableCubeTexture. All TextureFiles need to be resolved.');
    }
  }
}
