import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import TileSet from './TileSet';

@Entity()
class Tag {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 20, unique: false, nullable: false })
  public tag: string;

  @ManyToOne(() => TileSet, (ts) => ts.tags)
  public tileSet: Promise<TileSet>;

  constructor(tag: string) {
    this.tag = tag;
  }
}
export default Tag;
