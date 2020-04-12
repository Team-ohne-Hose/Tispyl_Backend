
import {Request, Response} from 'express';

export class APIResponse {

    responseBody: string;
    response: Response;

    constructor(res: Response, status: number, payload: any, errors?: any[]) {
        this.response = res;
        this.response.status(status);
        this.responseBody =
            `{"success":${errors === undefined},"payload":${JSON.stringify(payload)},"errors":${JSON.stringify(errors || [])}}`
    }

    send() {
        const prettyBody = JSON.stringify(JSON.parse(this.responseBody), null, 2);
        return this.response.send(prettyBody);
    }
}