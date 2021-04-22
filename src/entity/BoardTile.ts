import {Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import Language from "./Language";
import SetField from "./SetField";
import User from "./User";

@Entity()
class BoardTile {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 65, unique: true, nullable: false })
  public name: string

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  public description: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  public path: string;

  @ManyToOne(() => Language, language => language.board_tiles, {nullable: false})
  language: Language;

  @ManyToOne(type => User, user => user.board_tile, {nullable: false})
  public user: User;

  @OneToMany(() => SetField, setField => setField.boardTile)
  public setFields: SetField[];

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()" })
  public createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()", onUpdate: "CURRENT_TIMESTAMP()" })
  public updatedAt: Date;

  constructor(name: string, description: string, path: string) {
    this.name = name;
    this.description = description;
    this.path = path
  }
}

export default BoardTile;
