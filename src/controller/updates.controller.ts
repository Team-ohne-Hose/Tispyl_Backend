import { Request, Response } from 'express';
import { MarkdownController, MARKDOWN_DOMAIN } from './markdown.controller';

class UpdatesController {
    public static async getAvailableContent(
        req: Request,
        res: Response
    ): Promise<void> {
        return MarkdownController.availableFilesRequest(req, res, MARKDOWN_DOMAIN.UPDATES);
    }

    public static async getSingleNews(req: Request, res: Response): Promise<void> {
        return MarkdownController.fileRequest(req, res, MARKDOWN_DOMAIN.UPDATES);
    }

    public static async rawMedia(req: Request, res: Response): Promise<void> {
        return MarkdownController.mediaRequest(req, res, MARKDOWN_DOMAIN.UPDATES);
    }

    public static async getNewsMapping(req: Request, res: Response): Promise<void> {
        return MarkdownController.newsMappingRequest(req, res, MARKDOWN_DOMAIN.UPDATES)
    }

    public static async getNewsHead(req: Request, res: Response): Promise<void> {
        return MarkdownController.newsHeadRequest(req, res, MARKDOWN_DOMAIN.UPDATES);
    }
}

export default UpdatesController;