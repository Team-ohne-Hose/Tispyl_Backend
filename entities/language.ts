import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import BoardTile from "./boardTile";


@Entity()
class Language {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: 'varchar', length: 65, unique: true, nullable: false })
    public name: string;

    @OneToMany(() => BoardTile, boardTile => boardTile.language)
    board_tiles: BoardTile[];

    constructor(name: string) {
        this.name = name;
    }
}

export default Language;