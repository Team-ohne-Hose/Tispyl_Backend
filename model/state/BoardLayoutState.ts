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
interface TileRestriction {
    id: number;
    field: number;
}
interface TileRowRestriction {
    id: number;
    row: number;
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

    private readonly rows: [number, number][] = [
        [0,27],
        [28, 47],
        [48, 59],
        [60, 62],
        [63, 63]
    ];

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

    private getRandomEntry<T>(list: T[]): [T, number] {
        if (list.length <= 0) {
            return [undefined, -1];
        } else {
            const i = Math.max(0, Math.min(list.length - 1, Math.floor(Math.random() * list.length)));
            return [list[i], i];
        }
    }
    private generateFieldListForRow(row: number): number[] {
        const rows: number[] = [];
        const fieldList: number[] = [];
        while (row > 0) {
            if (row % 10 > 0 && row % 10 <= this.rows.length) {
                rows.push(row % 10);
            }
            row = Math.floor(row / 10);
        }
        rows.forEach(value => {
            for (let canidate = this.rows[value - 1][0]; canidate <= this.rows[value - 1][1]; canidate++) {
                if (fieldList.find(element => element === canidate) === undefined) {
                    fieldList.push(canidate);
                }
            }
        })
        return fieldList;
    }
    private generateRandomTilePermutation(size: number, tileRestrictions?: TileRestriction[], tileRowRestriction?: TileRowRestriction[]): number[] {
        tileRestrictions = tileRestrictions || [];
        tileRowRestriction = tileRowRestriction || [];
        let tilesToPick: number[] = [];
        const permutation: number[] = [];


        for (let j = 0; j < size; j++) {
            tilesToPick.push(j);
        }

        // fill in tiles with limitations
        tileRestrictions.forEach((value: TileRestriction) => {
            if (value.field >= 0 && value.field < size) {
                if (permutation[value.field] === undefined) {
                    permutation[value.field] = value.id;
                    tilesToPick = tilesToPick.filter(value1 => {
                        return value1 !== value.id;
                    });
                } else {
                    console.error('ERROR while randomizing, ', value.id, 'couldnt get its tile.');
                }
            }
        });
        tileRowRestriction.forEach((value: TileRowRestriction) => {
            if (value.row >= 0) {
                const freePositions = this.generateFieldListForRow(value.row).filter(value1 => {
                    return permutation[value1] === undefined;
                })
                if (freePositions.length > 0) {
                    const entry = this.getRandomEntry<number>(freePositions);
                    console.log('putting to row:', value.row, freePositions, entry[0], value.id);
                    permutation[entry[0]] = value.id;
                    tilesToPick = tilesToPick.filter(value1 => {
                        return value1 !== value.id;
                    });
                } else {
                    console.error('ERROR while randomizing, ', value.id, 'couldnt get its row.');
                }
            }
        })


        // fill in the rest
        let counter = 0;
        while (tilesToPick.length > 0) {
            const entry = this.getRandomEntry<number>(tilesToPick);
            while(permutation[counter] !== undefined) {
                counter++;
            }
            permutation[counter] = entry[0];
            counter++;
            tilesToPick.splice(entry[1], 1);
        }

        return permutation;
    }
    generateRandomLayout(tileset?: string) {
        const ts: TileSet = this.getTileSet(tileset);
        const tiles: TileSetEntry[] = ts.base;
        const tr: TileRestriction[] = [];
        const trr: TileRowRestriction[] = [];
        tiles.forEach((value: TileSetEntry, index: number) => {
            if (value.restrictToField >= 0 && value.restrictToField < 64) {
                tr.push({
                    field: value.restrictToField,
                    id: index
                })
            } else if (value.restrictToRing > 0) {
                trr.push({
                    row: value.restrictToRing,
                    id: index
                })
            }
        });

        const permutation = this.generateRandomTilePermutation(64, tr, trr);

        for (let i = 0; i < 64; i++) {
            const tsEntry = tiles[permutation[i]];
            this.tileList[i] = new Tile(i, tsEntry.imageUrl, tsEntry.translationKey, tsEntry.description);
        }
    }
    generateDefaultLayout(tileset?: string) {
        const ts: TileSet = this.getTileSet(tileset);
        const tiles: TileSetEntry[] = ts.base;
        for (let i = 0; i < 64; i++) {
            const tsEntry = tiles[i];
            this.tileList[i] = new Tile(i, tsEntry.imageUrl, tsEntry.translationKey, tsEntry.description);
        }
    }

}
