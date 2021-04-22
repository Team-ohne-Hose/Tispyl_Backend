import {getRepository, Repository} from "typeorm";
import TileSet from "../entity/TileSet";
import SetField from "../entity/SetField";
import {BoardLayoutState, Tile, TileRestriction, TileRowRestriction} from "../../model/state/BoardLayoutState";


class TileSetController {
  private static readonly rows: [number, number][] = [
    [0,27],
    [28, 47],
    [48, 59],
    [60, 62],
    [63, 63]
  ];

  public static async getAll(): Promise<TileSet[]> {
    const tilesetRepo: Repository<TileSet> = getRepository(TileSet);
    return tilesetRepo.find();
  }

  public static async getTileSetById(tilesetID: number): Promise<TileSet> | null {
    const tilesetRepo: Repository<TileSet> = getRepository(TileSet);

    return tilesetRepo.findOneOrFail({where: [{id: tilesetID}], relations: ['fields', 'fields.boardTile']});
  }

  public static generateField(tiles: SetField[], boardLayoutState: BoardLayoutState, randomize: boolean) {
    if (randomize) {
      return TileSetController.generateRandomField(tiles, boardLayoutState);
    } else {
      return TileSetController.generateDefaultField(tiles, boardLayoutState);
    }
  }
  private static generateDefaultField(tiles: SetField[], boardLayoutState: BoardLayoutState) {
    tiles.forEach((value) => {
      if (value.fieldNumber >= 1 && value.fieldNumber <= 62) {
        const boardTile = value.boardTile;
        boardLayoutState.setTile(value.fieldNumber, new Tile(value.fieldNumber, boardTile.path, boardTile.name, boardTile.description));
      }
    });
    boardLayoutState.fillEmptyTilesWithDefaults();
    boardLayoutState.setStartEnd();
    return true;
  }
  private static placeRowRestricted(row: number, permutation: number[]): number[] {
    // reconstruct list of allowed rows
    const allowedRows: number[] = [];
    while (row > 0) {
      if (row % 10 > 0 && row % 10 <= this.rows.length) {
        allowedRows.push(row % 10);
      }
      row = Math.floor(row / 10);
    }

    // create list of available fields
    const fieldList: number[] = [];
    allowedRows.forEach(value => {
      for (let canidate = this.rows[value - 1][0]; canidate <= this.rows[value - 1][1]; canidate++) {
        if (permutation[canidate] === undefined) {
          fieldList.push(canidate);
        }
      }
    });
    return fieldList;
  }
  private static generateRandomPermutation(tiles: SetField[]) {
    const len = tiles.length;
    let inactivePool = [];
    let activePool = [];
    let permutation = [];
    if (len < 62) {
      throw new Error("len has to be at least 62");
    }

    // fill inactive Pool
    for (let j = 0; j < len; j++) {
      inactivePool.push(j);
    }

    // pick random set of 62 Tiles
    const pickRandomFromRange = (maxExcl: number) => Math.min(Math.floor(Math.random() * maxExcl), maxExcl - 1);
    for (let j = 0; j < 62; j++) {
      if (inactivePool.length <= 0) {
        throw new Error("inactivePool pool is not containing enough tiles");
      }
      const val = inactivePool.splice(pickRandomFromRange(inactivePool.length), 1)[0];
      activePool.push(val);
    }

    // try to set the tiles on to the field
    let failures: number[] = [];

    // set field-restricted Tiles
    activePool = activePool.filter((val: number, index: number) => {
      if (tiles[val].restrictField) {
        if (permutation[tiles[val].restrictField] === undefined) {
          permutation[tiles[val].restrictField] = val;
        } else {
          // mark as failure
          failures.push(val);
        }
        return false;
      } else {
        return true;
      }
    });
    // set row-restricted Tiles
    activePool = activePool.filter((val: number, index: number) => {
      if (tiles[val].restrictRing) {
        const fieldList = TileSetController.placeRowRestricted(tiles[val].restrictRing, permutation);
        // if list exists, pick a random canidate from it
        if (fieldList.length > 0) {
          const ran = pickRandomFromRange(fieldList.length);
          const target = fieldList[ran];
          permutation[target] = val;
        } else {
          // else mark as failure
          failures.push(val);
        }
        return false;
      } else {
        return true;
      }
    });

    // fill for failures
    for (let i = 0; i < failures.length; i++) {
      if (inactivePool.length <= 0) {
        // not recoverable
        return [];
      }
      const replacement = inactivePool.splice(pickRandomFromRange(inactivePool.length), 1)[0];
      if (tiles[replacement].restrictField) {
        if (permutation[tiles[replacement].restrictField] === undefined) {
          permutation[tiles[replacement].restrictField] = replacement;
        } else {
          // mark as failure
          failures.push(replacement);
        }
      } else if (tiles[replacement].restrictRing) {
        const fieldList = TileSetController.placeRowRestricted(tiles[replacement].restrictRing, permutation);
        // if list exists, pick a random canidate from it
        if (fieldList.length > 0) {
          permutation[fieldList[pickRandomFromRange(fieldList.length)]] = replacement;
        } else {
          // else mark as failure
          failures.push(replacement);
        }
      } else {
        activePool.push(replacement);
      }
    }

    // fill with unrestricted tiles
    for (let i = 1; i <= 62; i++) {
      if (permutation[i] === undefined) {
        if (activePool.length <= 0) {
          throw new Error("Unexpected, Active Pool is empty");
        } else {
          // fill empty tile with random one in active pool
          permutation[i] = activePool.splice(pickRandomFromRange(activePool.length), 1)[0];
        }
      }
    }
    return permutation;
  }
  private static generateRandomField(tiles: SetField[], boardLayoutState: BoardLayoutState) {
    // max 10 tries
    let permutation = [];
    for (let i = 0; i < 10; i++) {
      permutation = TileSetController.generateRandomPermutation(tiles);
      if (permutation.length === 63) { //62 Tiles + spot at 0 to keep correct indices for the tile position
        for (let i = 1; i <= 62; i++) {
          const boardTile = tiles[permutation[i]].boardTile;
          boardLayoutState.setTile(i, new Tile(i, boardTile.path, boardTile.name, boardTile.description));
        }
        boardLayoutState.fillEmptyTilesWithDefaults();
        boardLayoutState.setStartEnd();
        return true;
      }
    }
    console.error("Randomisation failed 10x. Now serving default.");
    this.generateDefaultField(tiles, boardLayoutState);
    return false;
  }
}

export default TileSetController;
