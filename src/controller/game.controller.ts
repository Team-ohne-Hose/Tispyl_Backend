import { getRepository, Repository } from 'typeorm';
import GameLog from '../entity/GameLog';
import User from '../entity/User';
import UserStatistic from '../entity/userStatistic';
import UserController from './user.controller';
import { MapSchema } from '@colyseus/schema';
import { Player } from '../../model/state/Player';

class GameController {
  public static async saveGameLog(
    game: GameLog,
    players: MapSchema<Player>,
    start: Date,
    rounds: number
  ): Promise<GameLog> {
    const gameRepository: Repository<GameLog> = getRepository(GameLog);

    const stop: Date = new Date();
    const duration = Math.round(
      ((stop.getTime() - (start.getTime() % 86400000)) % 3600000) / 60000
    );

    game = await gameRepository.save(game);

    players.forEach(async (player) => {
      this.saveStatisticsForUser(
        player.loginName,
        duration,
        rounds,
        player.hasLeft
      );
    });

    return game;
  }

  public static async saveStatisticsForUser(
    loginName: string,
    duration: number,
    rounds: number,
    has_left: boolean
  ) {
    const userStatRepository: Repository<UserStatistic> = getRepository(
      UserStatistic
    );

    const userStats = new UserStatistic(duration, rounds, has_left);
    const user: User = await UserController.getUserEntity(loginName);
    userStats.users = [user];

    const stats = await userStatRepository.save(userStats);
  }
}

export default GameController;
