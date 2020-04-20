import {Client, Room} from "colyseus";
import {GameState} from "./model/state/GameState";
import {
    ChatMessage,
    DebugCommandType,
    GameActionType,
    JoinMessage,
    MessageType,
    PhysicsCommandGetNewId,
    PhysicsCommandType,
    PlayerMessageType,
    WsData
} from "./model/WsData";


export class GameRoom extends Room<GameState> {

    playerNames = new Map<string, string>();

    onCreate(options: any): void | Promise<any> {
        console.log("onCreate was triggered with: ", options);

        this.setState(new GameState());

        this.setMetadata({
            lobbyName: options['name'],
            author: options['author']
        });

        return undefined;
    }

    onDispose(): void | Promise<any> {
        console.log("onDispose was triggered");

        return undefined;
    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
        this.playerNames.set(client.id, options.displayName);
        this.state.addPlayer(client.id, options.displayName);
        console.log('options were: ', options);
        const msg: JoinMessage = {
            type: MessageType.JOIN_MESSAGE,
            message: `[Server] ${this.playerNames.get(client.id)}(${client.id}) joined the game`
        };
        this.broadcast(msg);
        return undefined;
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        console.log("onLeave was triggered");
        this.state.removePlayer(client.id);
        return undefined;
    }

    onMessage(client: Client, data: WsData): void {
        switch (data.type) {
            case MessageType.CHAT_MESSAGE:
                const msg: ChatMessage = {
                    type: MessageType.CHAT_MESSAGE,
                    message: `[${this.playerNames.get(client.id)}] ${data.message}`
                }
                this.broadcast(msg);
                break;
            case MessageType.JOIN_MESSAGE:
                break;
            case MessageType.GAME_MESSAGE:
                switch (data.action) {
                    case GameActionType.advanceRound:
                        this.state.nextRound();
                        break;
                    case GameActionType.advanceAction:
                        this.state.nextAction();
                        break;
                    case GameActionType.advanceTurn:
                        this.state.nextTurn();
                        break;
                    case GameActionType.setStartingCondition:
                        this.state.startGame();
                        break;
                    case GameActionType.setTile:
                        const player = data.playerId ? this.state.getPlayer(data.playerId) : this.state.getPlayerByFigure(data.figureId);
                        if (player !== undefined) {
                            player.setTile(data.tileId);
                        }
                    case GameActionType.none:
                    default:
                        console.log('nothing to do to that action');
                }
                break;
            case MessageType.PLAYER_MESSAGE:
                switch (data.subType) {
                    case PlayerMessageType.setFigure:
                        const player = this.state.getPlayer(data.playerId);
                        if (player !== undefined) {
                            player.setFigure(data.figureId, data.color);
                        }
                        break;
                }
                break;
            case MessageType.PHYSICS_MESSAGE:
                switch (data.subType) {
                    case PhysicsCommandType.getNewId:
                        const msg: PhysicsCommandGetNewId = {
                            type: MessageType.PHYSICS_MESSAGE,
                            subType: PhysicsCommandType.getNewId,
                            id: this.state.physicsState.getNewId()
                        }
                        this.send(client, msg);
                        break;
                    default:
                        this.state.physicsState.handlePhysicsCommand(data);
                        break;
                }
                break;
            case MessageType.DEBUG_COMMAND:
                switch (data.subType) {
                    case DebugCommandType.listPhysics:
                        this.state.physicsState.listPhysicsItems()
                        break;
                }
                break;
            case MessageType.OTHER:
                break;
            default:
                console.error('Message not implemented', data);
                break;
        }
    }

}
