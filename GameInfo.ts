import {PlayerInfo} from './PlayerInfo';

export class GameInfo {

    constructor(name: String, author: String){
        this.name = name;
        this.author = author;
        this.creationDate = Date.now();
    }

    name: String;
    author: String;
    creationDate: number;
    players: PlayerInfo[];
}
