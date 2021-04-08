import {Router} from 'express'
import LanguageController from '../controller/LanguageController';

const languageRouter: Router = Router({mergeParams: true});

languageRouter.get("/", LanguageController.getAll);
languageRouter.get("/:id", LanguageController.getOneById)
languageRouter.post("/", LanguageController.createLanguage);
languageRouter.delete("/:id", LanguageController.deleteLanguage);

export default languageRouter;