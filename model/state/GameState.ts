import {PhysicsState} from "./PhysicsState";
import {PlayerModel} from "../WsData";
import {Schema, ArraySchema, MapSchema, type} from "@colyseus/schema"

enum Actions {
    ROLL,
    MOVE,
    EXECUTE
}

export class Player extends Schema {
    @type('string')
    displayName: string;
    @type('string')
    playerId: string;
    @type('string')
    loginName: string;
    @type('boolean')
    isCurrentHost: boolean;
    @type('boolean')
    isReady: boolean;
    @type('number')
    figureId: number;
    @type('number')
    figureModel: PlayerModel;
    @type('number')
    currentTile: number;
    @type('boolean')
    isConnected: boolean;

    constructor(loginName: string, playerId: string, displayName: string) {
        super();
        this.loginName = loginName;
        this.playerId = playerId;
        this.displayName = displayName;
        this.isConnected = true;
    }

    setFigure(id: number, figureModel?: PlayerModel) {
        this.figureId = id;
        this.figureModel = figureModel !== undefined ? figureModel : this.figureModel;
    }
    setTile(tile: number) {
        this.currentTile = tile;
    }
}

export class GameState extends Schema {

    @type('number')
    round: number = 0;

    @type('string')
    action: string = Actions[Actions.EXECUTE];

    @type('string')
    hostSession: string = '';

    @type('boolean')
    hasStarted: boolean = false;

    @type(PhysicsState)
    physicsState = new PhysicsState();

    internalPlayerList: Map<string, string> = new Map<string, string>();

    @type({map: Player})
    playerList = new MapSchema<Player>();

    @type([ 'string' ])
    rules = new ArraySchema<string>();

    currentPlayer: Player;

    nextRound() {
        this.round += 1;
    }

    nextAction() {
        let newAction = Actions[Actions[this.action] + 1];
        if (newAction === undefined) {
            this.action = Actions[Actions.ROLL];
            this.nextTurn();
        } else {
            this.action = newAction;
        }
    }

    private getNextActivePlayer(current: Player): Player {
        const playerArray: Player[] = this.asArray(this.playerList);
        if (current !== undefined) {
            let currentPlayerInd = -1;
            for (let i = 0; i < playerArray.length; i++) {
                if (currentPlayerInd >= 0 && playerArray[i].isConnected) {
                    return playerArray[i];
                }
                if (current.loginName === playerArray[i].loginName) {
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

    nextTurn() {
        this.currentPlayer = this.getNextActivePlayer(this.currentPlayer);
    }

    // Attention!: also updates id if id != undefined
    getOrAddPlayer(login: string, id: string, name: string): [Player, boolean] {
        const playerArray: Player[] = this.asArray(this.playerList);
        const playerRef: Player = playerArray.find((val: Player, index: number) => {
            return val.loginName === login;
        });
        if (playerRef !== undefined) {
            playerRef.playerId = id || playerRef.playerId;
            return[playerRef, false];
        } else {
            return[this.addPlayer(login, id, name), true];
        }
    }

    addPlayer(login: string, id: string, name: string): Player {
        const p = new Player(login, id, name);
        this.playerList[id] = p;
        return p;
    }

    removePlayer(id: string) {
        this.playerList[id].isConnected = false;
        // delete this.playerList[id]
    }

    getPlayer(id: string): Player {
        return this.playerList[id];
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
        this.currentPlayer = this.getNextActivePlayer(undefined);
        this.action = Actions[Actions.ROLL];
        this.hasStarted = true;
    }

    setHost(clientId: string) {
        const hostCandidate: Player = this.playerList[clientId];
        if (hostCandidate !== undefined) {
            hostCandidate.isCurrentHost = true;
            this.hostSession = clientId;
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
