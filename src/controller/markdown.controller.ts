import fs from 'fs';
import { Request, Response } from 'express';
import { APIResponse } from '../model/APIResponse';
import Environment from '../module/environment';
import { MIMETYPES } from './mimeTypes';
import { marked } from 'marked';
import { Console } from 'console';

export enum MARKDOWN_DOMAIN {
  NEWS,
  UPDATES
}

export class MarkdownController {

  private static getPathForDomain(domain: MARKDOWN_DOMAIN) {
    switch (domain) {
      case MARKDOWN_DOMAIN.NEWS: return Environment.NEWS_PATH;
      case MARKDOWN_DOMAIN.UPDATES: return Environment.UPDATES_PATH;
    }
  }
  static getAvailableFiles(domain: MARKDOWN_DOMAIN): string[] {
    return fs.readdirSync(MarkdownController.getPathForDomain(domain)).filter((s) => s.endsWith('.md'));
  }
  static getFile(path: string): fs.ReadStream | null {
    if (fs.existsSync(path)) {
      return fs.createReadStream(path);
    }
    return null;
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
  private static async buildNewsHeadMapping(domain: MARKDOWN_DOMAIN): Promise<[string, string][]> {
    const newsFiles = MarkdownController.getAvailableFiles(domain);
    const mapping_p: Promise<[string, string]>[] = newsFiles.map(
      async (fileName: string) => {
        const pair: Promise<[string, string]> = MarkdownController.firstLineFs(
          MarkdownController.getPathForDomain(domain) + '/' + fileName
        ).then((head) => [fileName, head]);
        return pair;
      }
    );
    return Promise.all(mapping_p);
  }
  private static isFnameSafe(fname: string): boolean {
    return !(fname.includes('/') ||
      fname.includes('..') ||
      fname.includes('~') ||
      fname.includes('\\') ||
      fname.includes('*'));
  }

  static async availableFilesRequest(req: Request, res: Response, domain: MARKDOWN_DOMAIN): Promise<void> {
    const payload = MarkdownController.getAvailableFiles(domain);
    new APIResponse(res, 200, payload).send();
  }
  static async fileRequest(req: Request, res: Response, domain: MARKDOWN_DOMAIN): Promise<void> {
    if (!MarkdownController.isFnameSafe(req.params.md)) {
      new APIResponse(res, 403, {}, ['Forbidden']).send();
      return;
    }
    if (req.params.md === undefined || req.params.md === null)
      new APIResponse(res, 400, {}, ['Undefined news parameter']).send();

    const path = `${MarkdownController.getPathForDomain(domain)}/${req.params.md}`;

    try {
      if (fs.existsSync(path)) {
        const fileContents: Buffer = fs.readFileSync(path);
        const parsedHTML: string = marked.parse(fileContents.toString());
        res.set('Content-Type', MIMETYPES.md);
        res.send(parsedHTML);
      } else {
        new APIResponse(res, 404, {}, ['File not found']).send();
      }
    } catch (e) {
      console.error("[MarkDown FileReader] Could not read file: ", e);

      new APIResponse(res, 500, {}, ['File access error']).send();
    }
  }
  static async mediaRequest(req: Request, res: Response, domain: MARKDOWN_DOMAIN): Promise<void> {
    if (!MarkdownController.isFnameSafe(req.params.fileName)) {
      new APIResponse(res, 403, {}, ['Forbidden']).send();
      return;
    }
    const path = MarkdownController.getPathForDomain(domain) + '/' + req.params.fileName;
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
  static async newsHeadRequest(req: Request, res: Response, domain: MARKDOWN_DOMAIN): Promise<void> {
    if (!MarkdownController.isFnameSafe(req.params.md)) {
      new APIResponse(res, 403, {}, ['Forbidden']).send();
      return;
    }
    const path = MarkdownController.getPathForDomain(domain) + '/' + req.params.md;
    if (path) {
      try {
        if (fs.existsSync(path)) {
          const line = await MarkdownController.firstLineFs(path);
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
  static async newsMappingRequest(req: Request, res: Response, domain: MARKDOWN_DOMAIN): Promise<void> {
    try {
      const newsMap = await MarkdownController.buildNewsHeadMapping(domain);
      new APIResponse(res, 200, newsMap).send();
    } catch (e) {
      new APIResponse(res, 500, {}, ['Internal error']).send();
    }
  }
}