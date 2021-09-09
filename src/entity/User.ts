import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import BoardTile from './BoardTile';
import Role from './Role';
import TileSet from './TileSet';
import UserStatistic from './userStatistic';
@Entity('User')
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 45, unique: true, nullable: false })
  public login_name: string;

  @Column({ type: 'varchar', length: 45, unique: false, nullable: false })
  public display_name: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP()' })
  public user_creation: Date;

  @Column({ type: 'int' })
  public time_played: number;

  @Column({ type: 'varchar', length: 45, nullable: false })
  public password_hash: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  public profile_picture: string;

  @Column({ type: 'int' })
  public last_figure: number;

  @Column({ type: 'tinyint', nullable: false })
  public is_connected: number;

  @Column({ type: 'tinyint', nullable: false })
  public is_dev: number;

  @OneToMany(() => BoardTile, (boardTile) => boardTile.user)
  public board_tile: BoardTile[];

  @OneToMany(() => TileSet, (tileSet) => tileSet.author)
  tileSets: TileSet[];

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable()
  public roles: Role[];

  @ManyToMany(() => UserStatistic, (userStatistic) => userStatistic.users)
  @JoinTable()
  public userStatistics: UserStatistic[];

  constructor(loginname: string, displayname: string, passwordHash: string) {
    this.login_name = loginname;
    this.display_name = displayname;
    this.password_hash = passwordHash;
    this.time_played = 0;
    this.profile_picture = null;
    this.last_figure = 1;
    this.is_connected = 0;
    this.is_dev = 0;
  }
}

export default User;
