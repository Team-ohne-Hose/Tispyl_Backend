import { Request, Response } from 'express';
import { APIResponse } from '../model/APIResponse';
import { MIMETYPES } from './mimeTypes';
import fs from 'fs';
import Environment from '../module/environment';

class NewsController {
  public static async getAvailableContent(
    req: Request,
    res: Response
  ): Promise<void> {
    const payload = fs
      .readdirSync(Environment.NEWS_PATH)
      .filter((s) => s.endsWith('.md'));
    new APIResponse(res, 200, payload).send();
  }

  public static async getSingleNews(
    req: Request,
    res: Response
  ): Promise<void> {
    if (req.params.md === undefined || req.params.md === null)
      new APIResponse(res, 400, {}, ['Undefined news parameter']).send();

    const path = `${Environment.NEWS_PATH}/${req.params.md}`;

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
      new APIResponse(res, 500, {}, ['File access error']).send();
    }
  }

  public static async rawMedia(req: Request, res: Response): Promise<void> {
    const path = Environment.NEWS_PATH + '/' + req.params.fileName;
    if (path !== undefined && path !== null) {
      try {
        if (fs.existsSync(path)) {
          const stream = fs.createReadStream(path);
          stream.on('open', () => {
            stream.pipe(res);
          });
        } else {
          new APIResponse(res, 404, {}, ['File not found']).send();
        }
      } catch (e) {
        new APIResponse(res, 500, {}, ['File access error']).send();
      }
    } else {
      new APIResponse(res, 400, {}, ['Undefined fileName parameter']).send();
    }
  }

  private static firstLineFs(fileName: string): Promise<string> {
    const stream = fs.createReadStream(fileName);
    let acc = '';
    let pos = 0;
    let index;
    return new Promise<string>((resolve, reject) => {
      stream
        .on('data', (chunk) => {
          index = chunk.indexOf('\n');
          acc += chunk;
          index !== -1 ? stream.close() : (pos += chunk.length);
        })
        .on('close', () => {
          resolve(acc.slice(0, pos + index));
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  private static async buildNewsHeadMapping(): Promise<[string, string][]> {
    const newsFiles = fs
      .readdirSync(Environment.NEWS_PATH)
      .filter((s) => s.endsWith('.md'));
    const mapping_p: Promise<[string, string]>[] = newsFiles.map(
      async (fileName: string) => {
        const pair: Promise<[string, string]> = NewsController.firstLineFs(
          Environment.NEWS_PATH + '/' + fileName
        ).then((head) => [fileName, head]);
        return pair;
      }
    );
    return Promise.all(mapping_p);
  }

  public static async getNewsMapping(
    req: Request,
    res: Response
  ): Promise<void> {
    const newsMap = await NewsController.buildNewsHeadMapping();
    new APIResponse(res, 200, newsMap).send();
  }

  public static async getNewsHead(req: Request, res: Response): Promise<void> {
    const path = Environment.NEWS_PATH + '/' + req.params.md;
    if (path !== undefined && path !== null) {
      try {
        if (fs.existsSync(path)) {
          const line = await NewsController.firstLineFs(path);
          new APIResponse(res, 200, line).send();
        } else {
          new APIResponse(res, 404, {}, ['File not found']).send();
        }
      } catch (e) {
        new APIResponse(res, 500, {}, ['File access error']).send();
      }
    } else {
      new APIResponse(res, 400, {}, ['Undefined news parameter']).send();
    }
  }
}

export default NewsController;
