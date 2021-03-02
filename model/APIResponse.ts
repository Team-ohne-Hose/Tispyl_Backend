
import { Request, Response } from 'express';

export class APIResponse {

    responseBody: {};
    response: Response;

    constructor(res: Response, status: number, payload: any, errors?: any[]) {
        this.response = res;
        this.response.status(status);
        this.responseBody = { "success": errors === undefined, "payload": payload, "errors": errors || [] }
    }

    send() { this.response.send(this.responseBody); }
}