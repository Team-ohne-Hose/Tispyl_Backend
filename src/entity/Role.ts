import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import User from "./User";

@Entity()
class Role {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ type: "varchar", length: 65, unique: false, nullable: false })
    public description: string;

    @Column({ type: "datetime", nullable: false })
    public create_time: Date;

    @Column({ type: "datetime", nullable: false })
    public update_time: Date;

    @ManyToMany(type => User, user => user.roles)
    public users: User[]

    constructor(description: string) {
        this.description = description
    }
}

export default Role;