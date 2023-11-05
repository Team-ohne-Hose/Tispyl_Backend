import express, { Router } from 'express';
import AssetsController from '../controller/assets.controller';
import path from 'path';
import { Authentication } from '../module/authentication';

const assetsRouter: Router = Router({ mergeParams: true });

assetsRouter.get('/texture', AssetsController.getTextures);
assetsRouter.put('/texture', Authentication.grantDevAccess, AssetsController.multipartData.single('asset'), AssetsController.uploadTexture);

assetsRouter.get('/gltf', AssetsController.getGltf);
assetsRouter.put('/gltf', Authentication.grantDevAccess, AssetsController.multipartGltfData.single('asset'), AssetsController.uploadGltf);

assetsRouter.post('/cubemap', Authentication.grantDevAccess, AssetsController.defineCubeMap);
assetsRouter.get('/cubemap', AssetsController.getCubeMaps);

assetsRouter.use('/static', express.static(path.join(__dirname, '../../storage/dynamicAssets')));

export default assetsRouter;
