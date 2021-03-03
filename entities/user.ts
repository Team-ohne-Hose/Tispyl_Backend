import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity("User")
class User {

    @PrimaryGeneratedColumn()
    public user_id: number;

    @Column({ type: "varchar", length: 45, unique: true, nullable: false })
    public login_name: string;

    @Column({ type: "varchar", length: 45, unique: false, nullable: false })
    public display_name: string;

    @Column({ type: "timestamp", nullable: false })
    public user_creation: Date;

    @Column({ type: 'int' })
    public time_played: number;

    @Column({ type: "varchar", length: 45, nullable: false })
    public password_hash: string;

    @Column({ type: "varchar", length: 45 })
    public profile_picture: string;

    @Column({ type: "int" })
    public last_figure: number;

    @Column({ type: 'tinyint', nullable: false })
    public is_connected: number;

    @Column({ type: 'tinyint', nullable: false })
    public is_dev: number;


    constructor(loginname: string, displayname: string, passwordHash: string) {
        this.login_name = loginname;
        this.display_name = displayname;
        this.password_hash = passwordHash;

        this.user_creation = new Date();
        this.time_played = 0;
        this.profile_picture = null;
        this.last_figure = 1;
        this.is_connected = 0;
        this.is_dev = 0;
    }
}

export default User