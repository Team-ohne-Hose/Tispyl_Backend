import {Router} from 'express'
import ProfileController from '../controller/profile.controller';

const profileRouter: Router = Router({mergeParams: true});

profileRouter.get("/", ProfileController.getProfilePicture);
profileRouter.post("/", ProfileController.multipartData.single('img'), ProfileController.updateProfilePicture);

export default profileRouter;