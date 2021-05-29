import { Router } from "express";
import languageRouter from "./LanguageRouter";
import profileRouter from "./profile.router";
import userRouter from "./user.router";
import gameboardRouter from "./gameboard.router";
import newsRouter from "./news.router";

const globalRouter: Router = Router({ mergeParams: true });

globalRouter.use('/user', userRouter);
globalRouter.use('/news', newsRouter);
globalRouter.use('/profile', profileRouter);
globalRouter.use('/language', languageRouter);
globalRouter.use('/gameboard', gameboardRouter);


export default globalRouter;
