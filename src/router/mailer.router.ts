import { Router } from 'express';
import MailerController from '../controller/MailerController';

const mailerRouter: Router = Router({ mergeParams: true });

mailerRouter.post('/submit', MailerController.getRequest);

export default mailerRouter;
