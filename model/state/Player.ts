import {Schema, type} from "@colyseus/schema";
import {PlayerModel} from "../WsData";
import Timeout = NodeJS.Timeout;
import {PhysicsObjectState} from "./PhysicsState";

export class Player extends Schema {
    @type('string')
    displayName: string;
    @type('string')
    clientId: string;
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
    @type('boolean')
    hasLeft: boolean;
    gracePeriodTimeout: Timeout;

    constructor(loginName: string, playerId: string, displayName: string) {
        super();
        this.loginName = loginName;
        this.clientId = playerId;
        this.displayName = displayName;
        this.isConnected = true;
        this.hasLeft = false;
    }

    setFigure(id: number, figureModel?: PlayerModel) {
        this.figureId = id;
        this.figureModel = figureModel !== undefined ? figureModel : this.figureModel;
    }
    setTile(tile: number) {
        this.currentTile = tile;
    }
}
