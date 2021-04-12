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

    @Column({ type: "datetime", nullable: false })
    public createdAt: Date;

    @Column({ type: "datetime", nullable: false })
    public updatedAt: Date;

    @OneToMany(() => SetField, setField => setField.tileSet)
    public fields: SetField[];

    constructor(name: string, author: User) {
        this.name = name;
        this.author = author;

        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

export default TileSet;