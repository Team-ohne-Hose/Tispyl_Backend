import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import SetField from "./SetField";
import User from "./User";
import Tag from "./Tag";
import DefaultRule from "./DefaultRule";

@Entity()
class TileSet {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 45, unique: false, nullable: false })
  public name: string;

  @Column({ type: "varchar", length: 160, unique: false, nullable: false })
  public description: string;

  @ManyToOne(() => User, (user) => user.tileSets, {nullable: false, eager: true})
  public author: User;

  @Column({ type: 'varchar', length: 45, unique: false, nullable: true })
  public thumbnailPath: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP()' })
  public createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP()',
    onUpdate: 'CURRENT_TIMESTAMP()',
  })
  public updatedAt: Date;

  @OneToMany(() => SetField, (setField) => setField.tileSet)
  public fields: Promise<SetField[]>;

  @OneToMany(() => Tag, tag => tag.tileSet, {eager: true})
  public tags: Tag[];

  @OneToMany(() => DefaultRule, dRule => dRule.tileSet, {eager: true})
  public defaultRules: DefaultRule[];

  constructor(name: string, author: User) {
    this.name = name;
    this.author = author;
  }
}

export default TileSet;
