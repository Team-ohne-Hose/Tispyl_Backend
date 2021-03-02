import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Games")
class Game {

    @PrimaryGeneratedColumn()
    public game_id: number;

    @Column({ type: 'varchar', length: 45, nullable: false })
    public game_name: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    public author: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    public skin: string;

    @Column({ type: "tinyint" })
    public randomizeTiles: number;

    @Column({ type: "datetime", nullable: false })
    public startTime: Date;

    @Column({ type: "datetime", nullable: false })
    public endTime: Date;

    @Column({ type: "int", nullable: false })
    public maxPlayers: number;

    @Column({ type: "int", nullable: false })
    public maxRound: number;

    constructor(gameName: string, author: string, skin: string, randomizeTiles: number, startTime: Date, endTime: Date, maxPlayers: number, maxRound: number) { 
        this.game_name = gameName;
        this.author = author;
        this.skin = skin;
        this.randomizeTiles = randomizeTiles;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxPlayers = maxPlayers;
        this.maxRound = maxRound;
    }
}

export default Game