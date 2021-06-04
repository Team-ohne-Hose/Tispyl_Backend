import { Router } from 'express';
import TileSetController from '../controller/tileSet.controller';

const gameboardRouter: Router = Router({ mergeParams: true });

gameboardRouter.get('/tileset/', TileSetController.getAllRoute);
gameboardRouter.get('/tileset/:id', TileSetController.getByIdRoute);

export default gameboardRouter;
