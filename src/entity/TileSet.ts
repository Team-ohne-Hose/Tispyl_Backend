import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import SetField from "./SetField";
import User from "./User";

@Entity()
class TileSet {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: "varchar", length: 45, unique: false, nullable: false })
  public name: string;

  @ManyToOne(() => User, user => user.tileSets)
  public author: User;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP(6)" })
  public createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updatedAt: Date;

  @OneToMany(() => SetField, setField => setField.tileSet)
  public fields: SetField[];

  constructor(name: string, author: User) {
    this.name = name;
    this.author = author;
  }
}

export default TileSet;