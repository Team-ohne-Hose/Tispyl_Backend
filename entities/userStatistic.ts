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

    @Column({type: "boolean", nullable: false})
    public has_left: boolean;
    
    @Column({ type: "datetime", nullable: false })
    public create_time: Date;

    @Column({ type: "datetime", nullable: false })
    public update_time: Date;

    @ManyToMany(type => User, user => user.userStatistics)
    public users: User[]

    constructor(duration: number, number_of_rounds: number, has_left: boolean) {
        this.duration = duration;
        this.number_of_rounds = number_of_rounds;
        this.has_left = has_left;
        this.create_time = new Date();
        this.update_time = new Date();
    }
}

export default UserStatistic;