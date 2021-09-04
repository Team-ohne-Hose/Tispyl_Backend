import { Schema, MapSchema, type } from '@colyseus/schema';
interface TileSetEntry {
  id: number;
  title: string;
  description: string;
  translationKey: string;
  imageUrl: string;
  restrictToRing: number;
  restrictToField: number;
}
interface TileSet {
  name: string;
  base: TileSetEntry[];
  extensions: TileSetEntry[]; // Currently extensions are NOT supported
}
export interface TileRestriction {
  id: number;
  field: number;
}
export interface TileRowRestriction {
  id: number;
  row: number;
}
export class Tile extends Schema {
  @type('number')
  tileId: number;

  @type('string')
  imageUrl: string;

  @type('string')
  title: string;

  @type('string')
  description: string;

  constructor(
    tileId: number,
    imageUrl: string,
    title: string,
    description: string
  ) {
    super();
    this.tileId = tileId;
    this.imageUrl = imageUrl;
    this.title = title;
    this.description = description;
  }
}

export class BoardLayoutState extends Schema {
  readonly startTile: Tile = new Tile(
    0,
    '/assets/board/start.png',
    'Start',
    'Füllt die Gläser!'
  );

  readonly goalTile: Tile = new Tile(
    63,
    '/assets/board/goal.png',
    'Ziel',
    'Trinket aus!!'
  );

  readonly defaultUrl = '/assets/board/default.png';

  @type({ map: Tile })
  tileList = new MapSchema<Tile>();

  public static readonly rows: [number, number][] = [
    [0, 27],
    [28, 47],
    [48, 59],
    [60, 62],
    [63, 63],
  ];

  constructor() {
    super();
  }

  // set start and goal tile defaults. (at spot 0 and 63)
  setStartEnd(): void {
    this.tileList.set('0', this.startTile);
    this.tileList.set('63', this.goalTile);
  }

  fillEmptyTilesWithDefaults(): void {
    for (let i = 1; i <= 62; i++) {
      if (!this.tileList.get(i.toString())) {
        this.tileList.set(
          i.toString(),
          new Tile(i, this.defaultUrl, 'UNDEFINED', 'UNDEFINED')
        );
      }
    }
  }

  setTile(i: number, t: Tile): void {
    //this.tileList.set(i.toString(), t);
    this.tileList[i] = t;
  }
}
