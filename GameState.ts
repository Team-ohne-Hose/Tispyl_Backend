import {Schema, ArraySchema, type} from "@colyseus/schema"

enum Actions {
    ROLL,
    MOVE,
    EXECUTE
}

export class GameState extends Schema {

    @type('number')
    round: number = 1;

    @type('string')
    turn: string = 'none';

    @type('string')
    action: string = Actions[Actions.ROLL];

    nextRound() {
        this.round += 1;
    }

    nextAction() {
        let newAction = Actions[this.action+1];
        if (newAction === undefined) {
            this.action =  Actions[Actions.ROLL];
        }
    }


    setRound( n: number ) {
        this.round = n;
    }

}