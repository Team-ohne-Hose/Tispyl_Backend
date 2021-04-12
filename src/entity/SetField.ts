import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import BoardTile from "./BoardTile";
import TileSet from "./TileSet";

@Entity()
@Index(["id", "fieldNumber"])
class SetField {
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => TileSet, tileSet => tileSet.fields)
    public tileSet: TileSet;

    @Column({ type: "int", nullable: false })
    public fieldNumber: number;

    @OneToOne(() => BoardTile, boardTile => boardTile.setField)
    @JoinColumn()
    public boardTile: BoardTile;

    @Column({ type: "int", nullable: true })
    public restrictRing: number;

    @Column({ type: "int", nullable: true })
    public restrictField: number;

    @Column({ type: "datetime", nullable: false })
    public createdAt: Date;

    @Column({ type: "datetime", nullable: false })
    public updatedAt: Date;

    constructor(fieldNumber: number, boardTile: BoardTile, restrictRing: number = null, restrictField: number = null) {
        this.fieldNumber = fieldNumber;
        this.boardTile = boardTile;
        this.restrictRing = restrictRing;
        this.restrictField = restrictField;

        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

export default SetField;