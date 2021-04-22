import {Router} from "express";
import TileSetController from "../controller/tileSet.controller";

const gameboardRouter: Router = Router({mergeParams: true});

gameboardRouter.use('/tileSet/', TileSetController.getAllRoute);
gameboardRouter.use('/tileSet/:id', TileSetController.getByIdRoute);

export default gameboardRouter;
