import { Router } from 'express';
import UpdatesController from '../controller/updates.controller';

const updatesRouter: Router = Router({ mergeParams: true });

/** ALL NEWS ROUTES. */

updatesRouter.get('/:md/head', UpdatesController.getNewsHead);
updatesRouter.get('/headmapping', UpdatesController.getNewsMapping);
updatesRouter.get('/:md', UpdatesController.getSingleNews);
updatesRouter.get('/', UpdatesController.getAvailableContent);
updatesRouter.get('/media/:fileName', UpdatesController.rawMedia);

export default updatesRouter;
