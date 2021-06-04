import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import TileSet from './TileSet';

@Entity('GameLogs')
class GameLog {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 45, nullable: false })
  public name: string;

  @Column({ type: 'varchar', length: 45, nullable: false })
  public author: string;

  @ManyToOne(() => TileSet, (tileSet) => tileSet.games)
  public tileSet: TileSet;

  @Column({ type: 'tinyint' })
  public useItems: number;

  @Column({ type: 'tinyint' })
  public useMultipleItems: number;

  @Column({ type: 'tinyint' })
  public randomizeTiles: number;

  @Column({ type: 'datetime', nullable: false })
  public startTime: Date;

  @Column({ type: 'datetime', nullable: false })
  public endTime: Date;

  @Column({ type: 'int', nullable: false })
  public maxPlayers: number;

  @Column({ type: 'int', nullable: false })
  public maxRound: number;

  constructor(
    gameName: string,
    author: string,
    randomizeTiles: number,
    tileSet: TileSet,
    useItems: number,
    useMultipleItems: number,
    startTime: Date,
    endTime: Date,
    maxPlayers: number,
    maxRound: number
  ) {
    this.name = gameName;
    this.author = author;
    this.randomizeTiles = randomizeTiles;
    this.useItems = useItems;
    this.useMultipleItems = useMultipleItems;
    this.startTime = startTime;
    this.endTime = endTime;
    this.maxPlayers = maxPlayers;
    this.maxRound = maxRound;
    this.tileSet = tileSet;
  }
}

export default GameLog;
