import { Router } from "express";
import languageRouter from "./LanguageRouter";
import profileRouter from "./profile.router";
import userRouter from "./user.router";

const globalRouter: Router = Router({ mergeParams: true });

globalRouter.use('/user', userRouter);
globalRouter.use('/profile', profileRouter);
globalRouter.use('/language', languageRouter);


export default globalRouter;