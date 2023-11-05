import { Request, Response } from 'express';
import { Repository, getRepository } from 'typeorm';
import { extname } from 'path';
import fs from 'fs';
import multer from 'multer';
import { APIResponse } from '../model/APIResponse';
import Environment from '../module/environment';
import * as crypto from 'crypto';
import { TextureFile } from '../entity/TextureFile';
import { CubeTexture, SendableCubeTexture } from '../entity/CubeTexture';
import { GltfFile } from '../entity/GltfFile';

class AssetsController {
  static readonly supportedTextureFiles = ['png', 'jpg', 'jpeg'];

  static readonly supportedModelFiles = ['glb', 'gltf'];

  static hash(contents: string): string {
    return crypto.createHash('md5').update(contents).digest('hex');
  }

  static async ensureValidity(tex, texRepo: Repository<TextureFile>): Promise<TextureFile> {
    const query = { where: { name: tex.name, asset_file: tex.asset_file } };
    const tex_0 = await texRepo.findOne(query);
    if (tex_0 !== undefined) {
      return tex_0;
    } else {
      throw new Error('Failed to validate texture in DB: ' + JSON.stringify(tex));
    }
  }

  public static async getTextures(req: Request, res: Response): Promise<void> {
    const textureRepository: Repository<TextureFile> = getRepository(TextureFile);
    textureRepository
      .find()
      .then((textures) => {
        const knownTextureFiles: string[] = fs.readdirSync(Environment.ASSETS_PATH).filter((fname) => {
          return AssetsController.supportedTextureFiles.indexOf(fname.split('.')[1]) !== -1;
        });

        // Messy but i dont know how to cleanly move this to a private function
        // Calculates data discrepancies on the backend
        const orphanedAssetFiles = knownTextureFiles.filter((af) => {
          return textures.find((t) => t.asset_file === af) === undefined;
        });
        const missingAssetFiles = textures
          .filter((t) => {
            return knownTextureFiles.find((af) => t.asset_file === af) === undefined;
          })
          .map((tf) => {
            return { name: tf.name, asset_file: tf.asset_file, contribution: tf.contribution };
          });
        const verifiedTextures = textures
          .filter((t) => {
            return knownTextureFiles.find((af) => t.asset_file === af) !== undefined;
          })
          .map((tf) => {
            return { name: tf.name, asset_file: tf.asset_file, contribution: tf.contribution };
          });
        const payload = {
          orphanedAssetFiles: orphanedAssetFiles,
          missingAssetFiles: missingAssetFiles,
          verifiedTextures: verifiedTextures,
        };
        new APIResponse(res, 200, payload).send();
      })
      .catch((err) => {
        new APIResponse(res, 500, {}, [JSON.stringify(err)]).send();
      });
  }

  public static async uploadTexture(req: Request, res: Response): Promise<void> {
    const textureRepository: Repository<TextureFile> = getRepository(TextureFile);
    const new_tex: TextureFile = new TextureFile(req.body.name, req['diskname'], req.body.contribution);
    textureRepository
      .save(new_tex)
      .then((tex) => {
        new APIResponse(res, 200, `DB_id: ${tex.id} | Name: ${tex.name} | Asset_file: ${tex.asset_file}`).send();
      })
      .catch((err) => {
        new APIResponse(res, 500, {}, [JSON.stringify(err)]).send();
      });
  }

  public static async getGltf(req: Request, res: Response): Promise<void> {
    const gltfFileRepository: Repository<GltfFile> = getRepository(GltfFile);
    gltfFileRepository
      .find()
      .then((gltf) => {
        const knownAssetFiles: string[] = fs.readdirSync(Environment.ASSETS_PATH).filter((fname) => {
          return AssetsController.supportedModelFiles.indexOf(fname.split('.')[1]) !== -1;
        });

        // Messy but i dont know how to cleanly move this to a private function
        // Calculates data discrepancies on the backend
        const orphanedAssetFiles = knownAssetFiles.filter((af) => {
          return gltf.find((g) => g.asset_file === af) === undefined;
        });
        const missingAssetFiles = gltf
          .filter((g) => {
            return knownAssetFiles.find((af) => g.asset_file === af) === undefined;
          })
          .map((gf) => {
            return { name: gf.name, asset_file: gf.asset_file, contribution: gf.contribution };
          });
        const verifiedGltf = gltf
          .filter((g) => {
            return knownAssetFiles.find((af) => g.asset_file === af) !== undefined;
          })
          .map((gf) => {
            return { name: gf.name, asset_file: gf.asset_file, contribution: gf.contribution };
          });

        const payload = {
          orphanedAssetFiles: orphanedAssetFiles,
          missingAssetFiles: missingAssetFiles,
          verifiedGltfs: verifiedGltf,
        };
        new APIResponse(res, 200, payload).send();
      })
      .catch((err) => {
        new APIResponse(res, 500, {}, [JSON.stringify(err)]).send();
      });
  }

  public static async uploadGltf(req: Request, res: Response): Promise<void> {
    const gltfFileRepository: Repository<GltfFile> = getRepository(GltfFile);
    const new_tex: GltfFile = new GltfFile(req.body.name, req['diskname'], req.body.contribution);
    gltfFileRepository
      .save(new_tex)
      .then((gltf) => {
        new APIResponse(res, 200, `DB_id: ${gltf.id} | Name: ${gltf.name} | Asset_file: ${gltf.asset_file}`).send();
      })
      .catch((err) => {
        new APIResponse(res, 500, {}, [JSON.stringify(err)]).send();
      });
  }

  public static async getCubeMaps(req: Request, res: Response): Promise<void> {
    const cubeTextureRepository: Repository<CubeTexture> = getRepository(CubeTexture);
    cubeTextureRepository
      .find()
      .then((ct) => {
        const payload = ct.map((cm) => new SendableCubeTexture(cm));
        new APIResponse(res, 200, payload).send();
      })
      .catch((err) => {
        new APIResponse(res, 500, {}, [JSON.stringify(err)]).send();
      });
  }

  public static async defineCubeMap(req: Request, res: Response): Promise<void> {
    const textureRepository: Repository<TextureFile> = getRepository(TextureFile);
    const cubeTextureRepository: Repository<CubeTexture> = getRepository(CubeTexture);

    const x_pos = await AssetsController.ensureValidity(req.body.texture_pos_x, textureRepository);
    const y_pos = await AssetsController.ensureValidity(req.body.texture_pos_y, textureRepository);
    const z_pos = await AssetsController.ensureValidity(req.body.texture_pos_z, textureRepository);
    const x_neg = await AssetsController.ensureValidity(req.body.texture_neg_x, textureRepository);
    const y_neg = await AssetsController.ensureValidity(req.body.texture_neg_y, textureRepository);
    const z_neg = await AssetsController.ensureValidity(req.body.texture_neg_z, textureRepository);

    const cm = new CubeTexture(req.body.name, x_pos, y_pos, z_pos, x_neg, y_neg, z_neg);
    cubeTextureRepository
      .save(cm)
      .then((suc) => {
        new APIResponse(res, 200, `Successfully set cube map.`).send();
      })
      .catch((err) => {
        new APIResponse(res, 500, {}, [JSON.stringify(err)]).send();
      });
  }

  private static multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${Environment.ASSETS_PATH}`);
    },
    filename: (req, file, cb) => {
      const diskname = AssetsController.hash(file.originalname + Date.now()) + extname(file.originalname);
      req['diskname'] = diskname;
      cb(null, diskname);
    },
  });

  private static multerLimits = {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
    parts: 10,
  };

  private static multerFileFilter = (req, file, cb): void => {
    if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Invalid format. Allowed formats are: .png, .jpg and .jpeg');
      err.name = 'MULTER_FILTER_REJECTION';
      return cb(err);
    }
  };

  private static multerFileGltfFilter = (req, file, cb): void => {
    if (file.mimetype == 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error('Invalid format. Allowed formats are: .gltf and .glb, provided mime type was: ' + file.mimetype);
      err.name = 'MULTER_FILTER_REJECTION';
      return cb(err);
    }
  };

  public static multipartData = multer({
    storage: AssetsController.multerStorage,
    limits: AssetsController.multerLimits,
    fileFilter: AssetsController.multerFileFilter,
  });

  public static multipartGltfData = multer({
    storage: AssetsController.multerStorage,
    limits: AssetsController.multerLimits,
    fileFilter: AssetsController.multerFileGltfFilter,
  });
}
export default AssetsController;
