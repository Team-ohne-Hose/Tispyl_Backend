import { getRepository, Repository } from "typeorm";
import Game from "../entities/game";
import User from "../entities/user";
import UserStatistic from "../entities/userStatistic";
import { Player } from "../model/state/Player";
import UserController from "./user.controller";

class GameController {

    public static async saveGameLog(game: Game, players: any, start: Date, rounds: number): Promise<Game> {
        const gameRepository: Repository<Game> = getRepository(Game)

        const stop: Date = new Date();
        const duration = Math.round(((stop.getTime() - start.getTime() % 86400000) % 3600000) / 60000);

        game = await gameRepository.save(game)

        players.forEach(async player => {
            this.saveStatisticsForUser(player.loginName, duration, rounds, player.hasLeft)
        })

        return game
    }

    public static async saveStatisticsForUser(loginName: string, duration: number, rounds: number, has_left:boolean) {
        const userStatRepository: Repository<UserStatistic> = getRepository(UserStatistic)

        const userStats = new UserStatistic(duration, rounds, has_left)
        const user: User = await UserController.getUserEntity(loginName)
        userStats.users = [user]

        const stats = await userStatRepository.save(userStats)
    }
}

export default GameController