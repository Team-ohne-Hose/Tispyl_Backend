import {PhysicsState} from "./PhysicsState";
import {Schema, MapSchema, type} from "@colyseus/schema"

enum Actions {
    ROLL,
    MOVE,
    EXECUTE
}

class Player extends Schema {
    @type('string')
    displayName: string;
}

export class GameState extends Schema {

    @type('number')
    round: number = 0;

    @type('string')
    turn: string = 'none';

    @type('string')
    action: string = Actions[Actions.EXECUTE];

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

    addPlayer(id: string, name: string) {
        const p = new Player();
        p.displayName = name;
        this.playerList[id] = p;
    }

    removePlayer(id: string) {
        delete this.playerList[id]
    }

    startGame() {
        this.round = 1;
        this.turnIndex = 0;
        this.turn = this.asArray(this.playerList)[0].displayName;
        this.action = Actions[Actions.ROLL];
    }

    private asArray<T>(map: MapSchema<T>): T[] {
        const tmpArray: T[] = [];
        for (let id in map) {
            tmpArray.push(map[id])
        }
        return tmpArray;
    }
}
