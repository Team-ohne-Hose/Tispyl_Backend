import {Schema, MapSchema, type} from "@colyseus/schema";
import boardTiles from '../../resources/boardTiles.json';

interface TileSetEntry {
    id: number;
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
export class Tile extends Schema {
    @type('number')
    tileId: number;
    @type('string')
    imageUrl: string;
    @type('string')
    translationKey: string;
    @type('string')
    description: string;

    constructor(tileId: number, imageUrl: string, translationKey: string, description: string) {
        super();
        this.tileId = tileId;
        this.imageUrl = imageUrl;
        this.translationKey = translationKey;
        this.description = description;
    }
}

export class BoardLayoutState extends Schema {
    @type({map: Tile})
    tileList = new MapSchema<Tile>();

    constructor() {
        super();
    }

    private getTileSet(tileset?: string): TileSet {
        tileset = tileset || 'default';
        for (const ts of boardTiles.tileSets) {
            if (ts.name === tileset) {
                return ts;
            }
        }
        return tileset === 'default' ? null : this.getTileSet('default');
    }

    generateRandomLayout(tileset?: string) {
        const ts: TileSet = this.getTileSet(tileset);

    }
    generateDefaultLayout(tileset?: string) {
        const ts: TileSet = this.getTileSet(tileset);
        for (let i = 0; i < 64; i++) {
            const tsEntry = ts.base[i];
            this.tileList[i] = new Tile(i, tsEntry.imageUrl, tsEntry.translationKey, tsEntry.description);
        }
    }

}
