import { MapSchema, Schema, type } from '@colyseus/schema';
import { PlayerModel } from '../WsData';
import Timeout = NodeJS.Timeout;

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

  @type({ map: 'number' })
  itemList: MapSchema<number> = new MapSchema<number>();

  gracePeriodTimeout: Timeout;
  joined: Date;
  maxItemCount: number;

  constructor(loginName: string, playerId: string, displayName: string, maxItemCount?: number) {
    super();
    this.loginName = loginName;
    this.clientId = playerId;
    this.displayName = displayName;
    this.isConnected = true;
    this.hasLeft = false;
    this.maxItemCount = maxItemCount | 5;
  }

  setFigure(id: number, figureModel?: PlayerModel): void {
    this.figureId = id;
    this.figureModel =
      figureModel !== undefined ? figureModel : this.figureModel;
  }

  setTile(tile: number): void {
    this.currentTile = tile;
  }

  getItemCount(): number {
    let count = 0;
    this.itemList.forEach((val: number, key: string) => {
      count += val;
    });
    return count;
  }

  addItem(itemId: number): boolean {
    if (this.getItemCount() < 5) {
      this.itemList[itemId] = this.itemList[itemId] + 1 || 1;
      return true;
    }
    return false;
  }

  useItem(itemId: number): boolean {
    if (this.itemList[itemId] > 0) {
      this.itemList[itemId]--;
      return true;
    }
    return false;
  }
}
