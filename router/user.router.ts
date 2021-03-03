import { Router } from 'express'
import UserController from '../controller/user.controller'
import Authentication from '../module/authentication';

const userRouter: Router = Router({ mergeParams: true });

/** ALL USER ROUTES. */

userRouter.get("/", Authentication.verifyAccess, UserController.getSingleUser);
userRouter.get("/all", Authentication.verifyAccess, UserController.getAllUsers);
userRouter.post("/", Authentication.verifyAccess, UserController.createUser);
userRouter.patch("/", Authentication.verifyAccess, UserController.updateUser);

userRouter.delete("/:userId", Authentication.verifyAccess, UserController.deleteUser);
userRouter.post("/token", UserController.loginUser);

export default userRouter;