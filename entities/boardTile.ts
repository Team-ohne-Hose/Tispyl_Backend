import { type } from "node:os";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Language from "./language";
import User from "./user";

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

    @ManyToOne(() => Language, language => language.board_tiles)
    language: Language;

    @ManyToOne(type => User, user => user.board_tile)
    public user: User;

    constructor(name: string, description: string, path: string) {
        this.name = name;
        this.description = description;
        this.path = path
    }
}

export default BoardTile;