import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import BoardTile from "./BoardTile";
import TileSet from "./TileSet";

@Entity()
@Index(["id", "fieldNumber"])
class SetField {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => TileSet, tileSet => tileSet.fields, {nullable: false})
  public tileSet: TileSet;

  @Column({ type: "int", nullable: false })
  public fieldNumber: number;

  @ManyToOne(() => BoardTile, boardTile => boardTile.setFields, {nullable: false})
  public boardTile: BoardTile;

  @Column({ type: "int", nullable: true })
  public restrictRing: number;

  @Column({ type: "int", nullable: true })
  public restrictField: number;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()" })
  public createdAt: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP()", onUpdate: "CURRENT_TIMESTAMP()" })
  public updatedAt: Date;

  constructor(fieldNumber: number, boardTile: BoardTile, restrictRing: number = null, restrictField: number = null) {
    this.fieldNumber = fieldNumber;
    this.boardTile = boardTile;
    this.restrictRing = restrictRing;
    this.restrictField = restrictField;
  }
}

export default SetField;
