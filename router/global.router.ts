import { Router } from "express";
import userRouter from "./user.router";

const globalRouter: Router = Router({mergeParams: true});

globalRouter.use('/user', userRouter);

export default globalRouter;