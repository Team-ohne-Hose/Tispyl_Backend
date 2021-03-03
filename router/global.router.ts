import { Router } from "express";
import profileRouter from "./profile.router";
import userRouter from "./user.router";

const globalRouter: Router = Router({mergeParams: true});

globalRouter.use('/user', userRouter);
globalRouter.use('/profile', profileRouter);


export default globalRouter;