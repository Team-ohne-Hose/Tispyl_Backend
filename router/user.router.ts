import {Router} from 'express'
import UserController from '../controller/user.controller'

const userRouter: Router = Router({mergeParams: true});


/** ALL USER ROUTES. */

userRouter.get("/", UserController.getAllUsers);
userRouter.delete("/:userId", UserController.deleteUser)
userRouter.post("/token", UserController.loginUser)

export default userRouter;