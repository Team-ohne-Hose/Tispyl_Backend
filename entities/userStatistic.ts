import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import User from "./user";

@Entity()
class UserStatistic {

    @PrimaryGeneratedColumn()
    public user_statistic_id: number;

    @Column({ type: "int", nullable: false })
    public duration: number;

    @Column({ type: "int", nullable: false })
    public number_of_rounds: number;
    

    @Column({ type: "datetime", nullable: false })
    public create_time: Date;

    @Column({ type: "datetime", nullable: false })
    public update_time: Date;

    @ManyToMany(type => User, user => user.roles)
    public users: User[]
}

export default UserStatistic;