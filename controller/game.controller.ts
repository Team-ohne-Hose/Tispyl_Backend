import { getRepository, Repository } from "typeorm";
import Game from "../entities/game";

class GameController {

    public static async saveGameLog(game : Game) {
        const gameRepository: Repository<Game> = getRepository(Game)
        await gameRepository.save(game)
    }
}

export default GameController