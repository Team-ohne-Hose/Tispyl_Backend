import { APIResponse } from '../model/APIResponse';
import multer from 'multer';

export class ErrorHandler {
  static logErrors(err, req, res, next): void {
    const now = new Date(Date.now()).toLocaleTimeString();
    console.error(
      `[${now}][HTTP][${req.method}] (${err.message})\n${err.stack}`
    );
    next(err);
  }

  static handleKnownError(err, req, res, next): void {
    if (err instanceof multer.MulterError) {
      new APIResponse(res, 500, 'Form data issue: ' + err.code, [
        err.message,
      ]).send();
    } else if (err.name === 'MULTER_FILTER_REJECTION') {
      new APIResponse(res, 415, 'Invalid file format', [err.message]).send();
    } else {
      next(err);
    }
  }

  static handleUnexpectedError(err: Error, req, res, next): void {
    new APIResponse(
      res,
      500,
      'Unexpected Error, Something went really wrong!',
      [err.message]
    ).send();
  }
}
