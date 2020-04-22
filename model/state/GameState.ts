import {PhysicsState} from "./PhysicsState";
import {Schema, MapSchema, type} from "@colyseus/schema"
import {PlayerModel} from "../WsData";

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

    constructor(playerId: string, displayName: string) {
        super();
        this.playerId = playerId;
        this.displayName = displayName;
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
    turn: string = 'none';

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

    turnIndex = 0;

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

    nextTurn() {
        this.turnIndex = this.turnIndex + 1;
        const turnArray = this.asArray(this.playerList);
        if (this.turnIndex === turnArray.length) {
            this.nextRound();
            this.turnIndex = 0;
        }
        this.turn = turnArray[this.turnIndex].displayName;
    }

    addPlayer(id: string, name: string): Player {
        const p = new Player(id, name);
        this.playerList[id] = p;
        return p;
    }

    removePlayer(id: string) {
        delete this.playerList[id]
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
        this.turnIndex = 0;
        this.turn = this.asArray(this.playerList)[0].displayName;
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
