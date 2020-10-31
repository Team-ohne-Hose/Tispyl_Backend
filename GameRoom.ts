import {Client, Room} from "colyseus";
import {Actions, GameState} from "./model/state/GameState";
import {
    AchievementMessageType,
    ChatMessage,
    DebugCommandType,
    GameActionType, ItemMessageType,
    MessageType,
    PlayerMessageType,
    WsData
} from "./model/WsData";
import {Player} from "./model/state/Player";
import {PhysicsObjectState} from "./model/state/PhysicsState";
import {WSLogger} from "./WSLogger";
import {MariaDAO} from "./MariaDAO";
import {ItemManager} from "./model/ItemManager";
import {Link} from "./model/state/Link";

export class GameRoom extends Room<GameState> {

    createDate: Date;

    onCreate(options: any): void | Promise<any> {
        WSLogger.log(`[onCreate] Room created. Options: ${JSON.stringify(options)}`);
        this.createDate = new Date();

        this.setState(new GameState());
        this.setMetadata({
            lobbyName: options['name'],
            author: options['author'],
            skin: options['skin'],
            randomizeTiles: options['randomizeTiles']
        });
        if (options['randomizeTiles']) {
            this.state.boardLayout.generateRandomLayout();
            console.log('generated random Layout');
        } else {
            this.state.boardLayout.generateDefaultLayout();
            console.log('generated Layout');
        }

        this.state.physicsState.setBroadcastCallback(this.broadcast.bind(this));
        this.state.physicsState.addDice();
        this.state.physicsState.setOnDiceThrow(((num: number) => {
            if (this.state.action === Actions[Actions.ROLL]) {
                this.state.nextAction(this);
            }
        }).bind(this));

        this.onMessage(MessageType.CHAT_MESSAGE, this.onChatMessage.bind(this));
        this.onMessage(MessageType.JOIN_MESSAGE, this.onJoinMessage.bind(this));
        this.onMessage(MessageType.GAME_MESSAGE, this.onGameMessage.bind(this));
        this.onMessage(MessageType.PLAYER_MESSAGE, this.onPlayerMessage.bind(this));
        this.onMessage(MessageType.PHYSICS_MESSAGE, this.onPhysicsMessage.bind(this));
        this.onMessage(MessageType.DEBUG_COMMAND, this.onDebugMessage.bind(this));
        this.onMessage(MessageType.LEFT_MESSAGE, this.onLeftMessage.bind(this));
        this.onMessage(MessageType.OTHER, this.onOtherMessage.bind(this));
        this.onMessage(MessageType.REFRESH_COMMAND, this.onRefreshMessage.bind(this));
        this.onMessage(MessageType.ACHIEVEMENT_MESSAGE, this.onAchievementMessage.bind(this));
        this.onMessage(MessageType.ITEM_MESSAGE, this.onItemMessage.bind(this));

        return undefined;
    }

    onDispose(): void | Promise<any> {
        WSLogger.log(`[onDispose] Destructing physicsState`);
        MariaDAO.insertGameLog(this.metadata.lobbyName,
          this.metadata.author,
          this.metadata.skin,
          this.metadata.randomizeTiles,
          this.createDate.toISOString().slice(0, 19).replace('T', ' '),
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          this.state.playerList._indexes.size,
          this.state.round);

        this.state.physicsState.destructState();
        return undefined;
    }

    onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
        WSLogger.log(`[onJoin] Client ID: ${client.id} DisplayName: ${options.displayName} joined. Options: ${JSON.stringify(options)}`);

        // find matching player object or create a new one
        const playerResult: [Player, boolean] = this.state.getOrAddPlayer(options.login, client.id, options.displayName);
        const player: Player = playerResult[0];
        const isNewPlayer: boolean = playerResult[1];
        player.joined = new Date();

        // set joining player as host if no host exists
        if (this.state.hostLoginName === '') { this.state.setHost(player.loginName) }

        let joinedMsg: string = '';
        if (isNewPlayer) {
            joinedMsg = `${this.state.playerList[options.login].displayName}(${client.id}) joined the game`;
            player.figureId = this.state.physicsState.addPlayerFigure();

        } else {
            joinedMsg = `${this.state.playerList[options.login].displayName}(${client.id}) reconnected to the game`;

            // remove potential timeout
            if (player.gracePeriodTimeout !== undefined) {
              global.clearTimeout(player.gracePeriodTimeout);
              player.gracePeriodTimeout = undefined;
            }

            // re-enable figure old game
            const pObj: PhysicsObjectState = this.state.physicsState.objects[player.figureId];
            pObj.setDisabled(false);

            // register new sessionId to old player object
            player.clientId = client.id;
            player.hasLeft = false;
        }

        player.isConnected = true;
        this.broadcast(MessageType.JOIN_MESSAGE, { type: MessageType.JOIN_MESSAGE, message: joinedMsg});
        return undefined;
    }

    onLeave(client: Client, consented?: boolean): void | Promise<any> {
        const player = this.state.getPlayerByClientId(client.id);

        const minPlayed = (new Date().getTime() - player.joined.getTime()) / 60000;
        MariaDAO.addPlaytime(player.loginName, minPlayed);


        WSLogger.log(`[onLeave] Client left the room: ${player.loginName}`);
        if (player !== undefined) {
            if (player.loginName === this.state.hostLoginName) {
                this.broadcast(MessageType.LEFT_MESSAGE, {
                    type: MessageType.LEFT_MESSAGE,
                    message: `The Host: ${this.state.playerList[player.loginName].displayName} left the game.`
                });
                this.state.removePlayer(player.loginName);
                // only way to access 'first' element...
                for (let id in this.state.playerList) {
                    this.state.setHost(id);
                    this.broadcast(MessageType.CHAT_MESSAGE, {
                        type: MessageType.CHAT_MESSAGE,
                        message: `Player: ${this.state.playerList[id].displayName} is now host of the game.`,
                        authorLoginName: 'SERVER'
                    });
                    break;
                }
            } else {
                this.broadcast(MessageType.CHAT_MESSAGE, {
                    type: MessageType.CHAT_MESSAGE,
                    message: `Player: ${this.state.playerList[player.loginName].displayName} left the game.`,
                    authorLoginName: 'SERVER'
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

    onChatMessage(client: Client, data: WsData) {
        const player = this.state.getPlayerByClientId(client.id);
        if (player !== undefined && data.type === MessageType.CHAT_MESSAGE) {
            const msg: ChatMessage = {
                type: MessageType.CHAT_MESSAGE,
                message: data.message,
                authorLoginName: player.loginName
            };
            this.broadcast(msg.type, msg);
        }
    }
    onJoinMessage(client: Client, data: WsData) {
        if (data.type === MessageType.JOIN_MESSAGE) {

        }
    }
    onGameMessage(client: Client, data: WsData) {
        const player = this.state.getPlayerByClientId(client.id);
        if (player !== undefined && data.type === MessageType.GAME_MESSAGE) {
            switch (data.action) {
                case GameActionType.advanceRound:
                    this.state.nextRound();
                    break;
                case GameActionType.advanceAction:
                    this.state.nextAction(this);
                    break;
                case GameActionType.advanceTurn:
                    this.state.nextTurn(this);
                    break;
                case GameActionType.reverseTurnOrder:
                    WSLogger.log('reversingTurnOrder');
                    this.state.reversed = !this.state.reversed;
                    break;
                case GameActionType.setStartingCondition:
                    this.state.startGame();
                    break;
                case GameActionType.addRule:
                    // TODO: add Author
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
                            this.state.nextAction(this);
                        }
                        const msg = {
                            type: MessageType.GAME_MESSAGE,
                            action: GameActionType.showTile,
                            tile: data.tileId
                        };
                        console.log(msg);
                        this.broadcast(msg.type, msg);
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
                case GameActionType.closeVote:
                    data.withCooldown = true;
                    this.broadcast(data.type, data, { afterNextPatch: true });
                    console.log("Closing Vote");
                    global.setTimeout((() => {
                        console.log("Closed Vote");
                        this.broadcast(MessageType.GAME_MESSAGE, {
                            type: MessageType.GAME_MESSAGE,
                            action: GameActionType.closeVote,
                            withCooldown: false,
                        }, { afterNextPatch: true });
                        this.state.voteState.idle = true;
                    }).bind(this), 5000);
                    break;
                case GameActionType.startCreateVote:
                    for (const key in this.state.playerList) {
                        if (key in this.state.playerList && this.state.playerList[key].clientId === client.id) {
                            if (data.authorLogin === this.state.playerList[key].loginName) {
                                this.state.voteState.idle = false;
                                this.state.voteState.author = data.authorLogin;
                                this.broadcast(data.type, data, { afterNextPatch: true });
                                break;
                            }
                        }
                    }
                    break;
                case GameActionType.createVote:
                    this.state.voteState.startVote(data.authorId, data.eligible, data.customVote, data.options);
                    this.broadcast(MessageType.GAME_MESSAGE, {type: MessageType.GAME_MESSAGE, action: GameActionType.openVote}, { afterNextPatch: true });
                    break;
                case GameActionType.playerVote:
                    for (const key in this.state.playerList) {
                        if (key in this.state.playerList && this.state.playerList[key].clientId === client.id) {
                            this.state.voteState.playerVote(this.state.playerList[key].loginName, data.vote);
                        }
                    }
                    break;
                case GameActionType.addDrinkbuddies:
                    let l = new Link();
                    l.source = data.source;
                    l.target = data.target;
                    this.state.drinkBuddyLinks.push(l);
                    break;
                case GameActionType.removeDrinkbuddies:
                    const linkIndex = this.state.drinkBuddyLinks.findIndex((l) => l.source === data.source && l.target === data.target);
                    this.state.drinkBuddyLinks.splice(linkIndex, 1);
                    break;
                case GameActionType.none:
                default:
                    WSLogger.log(`[onMessage] GAME_MESSAGE: No action found for ${JSON.stringify(data)}`);
            }
        }
    }
    onPlayerMessage(client: Client, data: WsData) {
        const player = this.state.getPlayerByClientId(client.id);
        if (player !== undefined && data.type === MessageType.PLAYER_MESSAGE) {
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
        }
    }
    onPhysicsMessage(client: Client, data: WsData) {
        if (data.type === MessageType.PHYSICS_MESSAGE) {
            switch (data.subType) {
                default:
                    this.state.physicsState.handlePhysicsCommand(data);
                    break;
            }
        }
    }
    onDebugMessage(client: Client, data: WsData) {
        if (data.type === MessageType.DEBUG_COMMAND) {
            switch (data.subType) {
                case DebugCommandType.listPhysics:
                    this.state.physicsState.listPhysicsItems();
                    break;
            }
        }
    }
    onLeftMessage(client: Client, data: WsData) {
        const player = this.state.getPlayerByClientId(client.id);
        if (player !== undefined && data.type === MessageType.LEFT_MESSAGE) {

        }
    }
    onOtherMessage(client: Client, data: WsData) {
        const player = this.state.getPlayerByClientId(client.id);
        if (player !== undefined && data.type === MessageType.OTHER) {

        }
    }
    onRefreshMessage(client: Client, data: WsData) {
        this.broadcast(data.type, data);
    }
    onAchievementMessage(client: Client, data: WsData) {
        if (data.type === MessageType.ACHIEVEMENT_MESSAGE) {
            switch (data.subType) {
                case AchievementMessageType.newAchievement:
                    this.broadcast(data.type, data);
                    break;
            }
        }
    }
    onItemMessage(client: Client, data: WsData) {
        if (data.type === MessageType.ITEM_MESSAGE) {
            switch (data.subType) {
                case ItemMessageType.giveItem:
                    if (this.isHost(client)) {
                        const p = this.state.getPlayer(data.playerLoginName);
                        if (p !== undefined) {
                            if (Number(data.itemId) === -1) {
                                data.itemId = ItemManager.getRandomItem();
                            }
                            p.addItem(Number(data.itemId));
                            WSLogger.log(`[onItemMessage] Player received Item: ${p.loginName}, Item:${data.itemId}`);
                            this.broadcast(MessageType.CHAT_MESSAGE, {
                                type: MessageType.CHAT_MESSAGE,
                                message: `Player: ${this.state.playerList[data.playerLoginName].displayName} received Item ${data.itemId}.`,
                                authorLoginName: 'SERVER'
                            });
                        } else {
                            WSLogger.log(`[onItemMessage] Player couldn't be found to receive Item: ${data.playerLoginName}`);
                        }
                    } else {
                        WSLogger.log(`[onItemMessage] Client not authorized to give Item: ${client.id}`);
                    }
                    break;
                case ItemMessageType.useItem:
                    const player = this.state.getPlayerByClientId(client.id);
                    if (player !== undefined && player.loginName === data.playerLoginName) {
                        WSLogger.log(`[onItemMessage] Client using Item: ${data.itemId}`);
                        if (player.useItem(Number(data.itemId))) {
                            data.itemName = ItemManager.getName(Number(data.itemId));
                            data.itemDescription = ItemManager.getDescription(Number(data.itemId));
                            this.broadcast(data.type, data);
                        } else {
                            WSLogger.log(`[onItemMessage] Failed using Item: ${data.itemId}`);
                        }
                    } else {
                        WSLogger.log(`[onItemMessage] Client not authorized to use: ${player.loginName} tried to use ${data.playerLoginName}'s Item of ${data.itemId}`);
                    }
                    break;
            }
        }
    }
    private isHost(client: Client) {
        const player = this.state.getPlayerByClientId(client.id);
        if (player !== undefined) {
            return player.loginName === this.state.hostLoginName
        }
        return false;
    }
}
