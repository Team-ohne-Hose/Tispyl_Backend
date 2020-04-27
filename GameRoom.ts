import {Client, Room} from "colyseus";
import {Actions, GameState} from "./model/state/GameState";
import {
    ChatMessage,
    DebugCommandType,
    GameActionType,
    JoinMessage,
    MessageType,
    PhysicsCommandAddEntity,
    PlayerMessageType,
    WsData
} from "./model/WsData";
import {Player} from "./model/state/Player";
import {PhysicsObjectState} from "./model/state/PhysicsState";


export class GameRoom extends Room<GameState> {

    onCreate(options: any): void | Promise<any> {
        console.log("onCreate was triggered with: ", options);

        this.setState(new GameState());

        this.setMetadata({
            lobbyName: options['name'],
            author: options['author']
        });

        this.state.physicsState.setBroadcastCallback(this.broadcast.bind(this));
        this.state.physicsState.addDice();
        this.state.physicsState.setOnDiceThrow(((num: number) => {
            if (this.state.action === Actions[Actions.ROLL]) {
                this.state.nextAction();
            }
        }).bind(this));

        return undefined;
    }

    onDispose(): void | Promise<any> {
        this.state.physicsState.destructState();
        console.log("onDispose was triggered, rendering Stopped");

        return undefined;
    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
        const playerResult: [Player, boolean] = this.state.getOrAddPlayer(options.login, client.id, options.displayName);
        console.log('Options were: ', options);
        if (this.state.currentPlayerLogin === undefined) {
            this.state.nextTurn();
        }

        if (playerResult[0].gracePeriodTimeout !== undefined) {
            global.clearTimeout(playerResult[0].gracePeriodTimeout);
            playerResult[0].gracePeriodTimeout = undefined;
        }
        if (playerResult[0].hasLeft) {
            playerResult[0].hasLeft = false;
            const pObj: PhysicsObjectState = this.state.physicsState.objects[playerResult[0].figureId];
            pObj.setDisabled(false);
        }
        playerResult[0].isConnected = true;

        if (this.state.hostLoginName === '') { this.state.setHost(playerResult[0].loginName) }
        const msg: JoinMessage = {
            type: MessageType.JOIN_MESSAGE,
            message: `[SERVER] ${this.state.playerList[options.login].displayName}(${client.id}) joined the game`
        };
        this.broadcast(msg);
        this.state.physicsState.sendExisting((obj: PhysicsCommandAddEntity) => {
            this.send(client, obj);
        });
        if (playerResult[1]) {
            const id = this.state.physicsState.addPlayerFigure();
            console.log('created PlayerFigure');
            playerResult[0].figureId = id;
        } else {
            playerResult[0].clientId = client.id;
            playerResult[0].isConnected = true;
        }
        return undefined;
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        const player = this.state.getPlayerByClientId(client.id);
        console.log("OnLeave(): Client left the room:", player.loginName);
        if (player !== undefined) {
            if (player.loginName === this.state.hostLoginName) {
                this.broadcast({
                    type: MessageType.LEFT_MESSAGE,
                    message: `[SERVER] The host: ${this.state.playerList[player.loginName].displayName} left the game.`
                });
                this.state.removePlayer(player.loginName);
                // only way to access 'first' element...
                for (let id in this.state.playerList) {
                    this.state.setHost(id);
                    this.broadcast({
                        type: MessageType.CHAT_MESSAGE,
                        message: `[SERVER] Player: ${this.state.playerList[id].displayName} is now host of the game.`
                    });
                    break;
                }
            } else {
                this.broadcast({
                    type: MessageType.CHAT_MESSAGE,
                    message: `[SERVER] Player: ${this.state.playerList[player.loginName].displayName} left the game.`
                });
                this.state.removePlayer(player.loginName);
            }
            player.gracePeriodTimeout = global.setTimeout(((p: Player) => {
                if (!p.isConnected) {
                    p.hasLeft = true;
                    const pObj: PhysicsObjectState = this.state.physicsState.objects[p.figureId];
                    pObj.setDisabled(true);
                }
                p.gracePeriodTimeout = undefined;
            }).bind(this), 120000, player);
        }
        return undefined;
    }

    onMessage(client: Client, data: WsData): void {
        const player = this.state.getPlayerByClientId(client.id);
        if (player !== undefined) {
            switch (data.type) {
                case MessageType.CHAT_MESSAGE:
                    const msg: ChatMessage = {
                        type: MessageType.CHAT_MESSAGE,
                        message: `[${this.state.playerList[player.loginName].displayName}] ${data.message}`
                    };
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
                        case GameActionType.addRule:
                            this.state.rules.push(data.text);
                            break;
                        case GameActionType.deleteRule:
                            this.state.rules.splice(data.id, 1);
                            break;
                        case GameActionType.setTile:
                            const myPlayer = data.playerId ? this.state.getPlayer(data.playerId) : this.state.getPlayerByFigure(data.figureId);
                            if (myPlayer !== undefined) {
                                myPlayer.setTile(data.tileId);
                            }
                            if (this.state.currentPlayerLogin === data.playerId) {
                                if (this.state.action === Actions[Actions.MOVE]) {
                                    this.state.nextAction();
                                }
                            }
                            break;
                        case GameActionType.readyPropertyChange:
                            this.state.playerList[player.loginName].isReady = data.isReady;
                            let allReady = true;
                            for (let id in this.state.playerList) {
                                if (!this.state.playerList[id].isReady) {
                                    allReady = false
                                }
                            }
                            if (allReady) {
                                this.state.startGame()
                            }
                            break;
                        case GameActionType.refreshData:
                            this.state.triggerAll();
                            this.state.playerList.triggerAll();
                            for (const key in this.state.playerList) {
                                if (key in this.state.playerList) {
                                    this.state.playerList[key].triggerAll();
                                }
                            }
                            break;
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
                                player.setFigure(player.figureId, data.playerModel);
                            }
                            this.state.playerList.triggerAll();
                            for (const key in this.state.playerList) {
                                if (key in this.state.playerList) {
                                    this.state.playerList[key].triggerAll();
                                }
                            }
                            console.log('got Figure: ', player.figureModel, data.playerModel, data.playerId);
                            break;
                    }
                    break;
                case MessageType.PHYSICS_MESSAGE:
                    switch (data.subType) {
                        default:
                            this.state.physicsState.handlePhysicsCommand(data);
                            break;
                    }
                    break;
                case MessageType.DEBUG_COMMAND:
                    switch (data.subType) {
                        case DebugCommandType.listPhysics:
                            this.state.physicsState.listPhysicsItems();
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
}
