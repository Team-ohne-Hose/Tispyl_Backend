import {Router} from 'express'
import UserController from '../controller/user.controller'
import Authentication from '../module/authentication';

const userRouter: Router = Router({mergeParams: true});

/** ALL USER ROUTES. */

userRouter.get("/", UserController.getSingleUser);
userRouter.get("/all", Authentication.verifyAccess, UserController.getAllUsers);
userRouter.post("/", UserController.createUser);
userRouter.patch("/", UserController.updateUser);

userRouter.delete("/:userId", UserController.deleteUser);
userRouter.post("/token", UserController.loginUser);

export default userRouter;