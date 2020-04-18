import {Schema, ArraySchema, type} from "@colyseus/schema"

enum Actions {
    ROLL,
    MOVE,
    EXECUTE
}

export class GameState extends Schema {

    @type('number')
    round: number = 0;

    @type('string')
    turn: string = 'none';

    @type('string')
    action: string = Actions[Actions.EXECUTE];

    internalPlayerList: Map<string, string> = new Map<string, string>();
    turnIndex = 0;

    nextRound() {
        this.round += 1;
    }

    nextAction() {
        let newAction = Actions[Actions[this.action]+1];
        if (newAction === undefined) {
            this.action =  Actions[Actions.ROLL];
            this.nextTurn();
        } else {
            this.action =  newAction;
        }
    }

    nextTurn() {
        this.turnIndex = this.turnIndex + 1;
        const turnArray =  Array.from( this.internalPlayerList.values() );
        if (this.turnIndex === turnArray.length) {
            this.nextRound();
            this.turnIndex = 0;
        }
        this.turn = turnArray[this.turnIndex];
    }

    addPlayer(id: string, name: string) {
        this.internalPlayerList.set(id, name);
    }

    removePlayer(id: string) {
        this.internalPlayerList.delete(id)
    }

    startGame() {
            this.round = 1;
            this.turnIndex = 0;
            this.turn = Array.from( this.internalPlayerList.values() )[0];
            this.action = Actions[Actions.ROLL];
    }

}