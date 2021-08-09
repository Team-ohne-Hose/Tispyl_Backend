import { Request, Response } from 'express';
import { APIResponse } from '../../model/APIResponse';

class MailerController {
  public static async getRequest(req: Request, res: Response) {
    const { email, text } = req.body;

    const mailjet = require('node-mailjet').connect(
      'ddebdb9124a6843d07252c8dce4662d4',
      '855b99b708fe5ab4206fc80ca7118219'
    );
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'tispyl@uber.space',
            Name: 'Tispyl',
          },
          To: [
            {
              Email: 'tispyl@uber.space',
              Name: 'Tispyl',
            },
          ],
          Subject: 'Kontaktformular',
          TextPart: 'Kontaktformular',
          HTMLPart:
            "<h3><a href='" +
            email +
            "'>" +
            email +
            '</a>sendete folgenden Text:</h3><br />' +
            text,
          CustomID: 'AppGettingStartedTest',
        },
      ],
    });
    request
      .then(() => {
        new APIResponse(res, 200, {}).send();
      })
      .catch((err) => {
        new APIResponse(res, 400, {}, [err]).send();
      });
  }
}

export default MailerController;
