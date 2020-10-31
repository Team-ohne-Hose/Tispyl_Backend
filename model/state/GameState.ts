import {PhysicsState} from "./PhysicsState";
import {MessageType, PlayerModel} from "../WsData";
import {Schema, ArraySchema, MapSchema, type} from "@colyseus/schema"
import {Player} from "./Player";
import {BoardLayoutState} from "./BoardLayoutState";
import {VoteState} from "./VoteState";
import {Link} from "./Link";
import {ItemManager} from "../ItemManager";
import {GameRoom} from "../../GameRoom";

export enum Actions {
    ROLL,
    MOVE,
    EXECUTE
}

export class GameState extends Schema {

    @type('number')
    round = 0;

    @type('string')
    action: string = Actions[Actions.EXECUTE];

    @type('string')
    hostLoginName = '';

    @type('boolean')
    hasStarted = false;

    @type(PhysicsState)
    physicsState = new PhysicsState();

    @type({map: Player})
    playerList = new MapSchema<Player>();

    @type([ 'string' ])
    rules = new ArraySchema<string>();

    @type([ Link ])
    drinkBuddyLinks = new ArraySchema<Link>();

    @type('string')
    currentPlayerLogin: string;

    @type(BoardLayoutState)
    boardLayout = new BoardLayoutState();

    @type('boolean')
    reversed = false;

    @type(VoteState)
    voteState: VoteState = new VoteState();

    nextRound() {
        this.round += 1;
    }

    nextAction(gameRoom: GameRoom) {
        let newAction = Actions[Actions[this.action] + 1];
        if (newAction === undefined) {
            this.nextTurn(gameRoom);
        } else {
            this.action = newAction;
        }
    }

    private getNextActivePlayer(current: string, reversed: boolean): Player {
        let playerArray: Player[];

        if (reversed) {
            playerArray = this.asArray(this.playerList).reverse();
        } else {
            playerArray = this.asArray(this.playerList)
        }

        if (current !== undefined) {
            let currentPlayerInd = -1;
            for (let i = 0; i < playerArray.length; i++) {
                if (currentPlayerInd >= 0 && playerArray[i].isConnected) {
                    return playerArray[i];
                }
                if (current === playerArray[i].loginName) {
                    currentPlayerInd = i;
                }
            }
            this.nextRound();
        }
        for (let j = 0; j < playerArray.length; j++) {
            if (playerArray[j].isConnected) {
                return playerArray[j];
            }
        }
        console.error('something went wrong.. No client is marked as connected');
    }

    nextTurn(gameRoom: GameRoom) {
        this.currentPlayerLogin = this.getNextActivePlayer(this.currentPlayerLogin, this.reversed).loginName;
        this.action = Actions[Actions.ROLL];
        if (Math.random() <= 0.10) {
            const itemId = ItemManager.getRandomItem();
            this.getPlayer(this.currentPlayerLogin).addItem(itemId);
            gameRoom.broadcast(MessageType.CHAT_MESSAGE, {
                type: MessageType.CHAT_MESSAGE,
                message: `Player: ${gameRoom.state.playerList[this.currentPlayerLogin].displayName} received Item ${itemId}.`,
                authorLoginName: 'SERVER'
            });
        }
    }

    getOrAddPlayer(login: string, id: string, name: string): [Player, boolean] {
        const playerArray: Player[] = this.asArray(this.playerList);
        const playerRef: Player = playerArray.find((p: Player) => {
            return p.loginName === login;
        });
        if (playerRef !== undefined) {
            return[playerRef, false];
        } else {
            return[this.addPlayer(login, id, name), true];
        }
    }

    addPlayer(login: string, id: string, name: string): Player {
        const p = new Player(login, id, name);
        this.playerList[login] = p;
        return p;
    }

    removePlayer(login: string) {
        this.playerList[login].isConnected = false;
        // delete this.playerList[id]
    }

    getPlayer(loginName: string): Player {
        return this.playerList[loginName];
    }
    getPlayerByClientId(clientId: string): Player {
        for (const key in this.playerList) {
            if (key in this.playerList) {
                if (this.playerList[key].clientId === clientId) {
                    return this.playerList[key];
                }
            }
        }
        return undefined;
    }
    getPlayerByFigure(id: number): Player {
        for (let key in this.playerList) {
            const player: Player = this.playerList[key];
            if (player.figureId === id) {
                return player;
            }
        }
    }

    startGame() {
        this.round = 1;
        this.currentPlayerLogin = this.getNextActivePlayer(undefined, false).loginName;
        this.action = Actions[Actions.ROLL];
        this.hasStarted = true;
    }

    setHost(login: string) {
        const hostCandidate: Player = this.playerList[login];
        if (hostCandidate !== undefined) {
            hostCandidate.isCurrentHost = true;
            this.hostLoginName = login;
        }
    }

    private asArray<T>(map: MapSchema<T>): T[] {
        const tmpArray: T[] = [];
        for (let id in map) {
            tmpArray.push(map[id])
        }
        return tmpArray;
    }
}
