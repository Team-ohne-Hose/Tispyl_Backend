import { Request, Response } from 'express';
import { APIResponse } from "../../model/APIResponse";
import { MIMETYPES } from "./mimeTypes";
import fs from "fs";
import Environment from "../../module/environment";

class NewsController {

    private static storagePath = Environment.NEWS_PATH;

    public static async getAvailableContent(req: Request, res: Response): Promise<void> {
        const payload = fs.readdirSync(NewsController.storagePath).filter( s => s.endsWith('.md') );
        new APIResponse(res, 200, payload).send();
    }

    public static async getSingleNews(req: Request, res: Response): Promise<void> {
        const path = NewsController.storagePath + req.params.md;
        if (req.params.md !== undefined) {
            try {
                if (fs.existsSync(path)) {
                    const stream = fs.createReadStream(path);
                    stream.on('open', () => {
                        res.set('Content-Type', MIMETYPES.md);
                        stream.pipe(res);
                    });
                } else {
                    new APIResponse(res, 404, {}, ['File not found']).send();
                }
            } catch (e) {
                new APIResponse(res, 500, {},['File access error'] ).send();
            }
        } else {
            new APIResponse(res, 400, {}, ['Undefined news parameter']).send();
        }
    }

}

export default NewsController