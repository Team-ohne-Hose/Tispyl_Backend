import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import SetField from "./SetField";
import User from "./User";

@Entity()
class TileSet {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: "varchar", length: 45, unique: false, nullable: false })
  public name: string;

  @ManyToOne(() => User, user => user.tileSets, {nullable: false})
  public author: User;

  @Column({type: "varchar", length: 45, unique: false, nullable: true })
  public thumbnailPath: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()" })
  public createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()", onUpdate: "CURRENT_TIMESTAMP()" })
  public updatedAt: Date;

  @OneToMany(() => SetField, setField => setField.tileSet)
  public fields: Promise<SetField[]>;

  constructor(name: string, author: User) {
    this.name = name;
    this.author = author;
  }
}

export default TileSet;
