import { getRepository, Repository } from 'typeorm';
import { Request, Response } from 'express';
import Language from '../entity/Language';
import { APIResponse } from '../model/APIResponse';

class LanguageController {
  public static async getAll(req: Request, res: Response): Promise<void> {
    const languageRepo: Repository<Language> = getRepository(Language);

    let languages: Language[] = null;

    try {
      languages = await languageRepo.find();
    } catch (error) {
      console.error(error);
      new APIResponse(res, 500, {}, ['internal_server_error']).send();
      return;
    }
    new APIResponse(res, 200, languages).send();
  }

  public static async getOneById(req: Request, res: Response): Promise<void> {
    const languageRepo: Repository<Language> = getRepository(Language);
    const languageId = req.query.languageId;

    let language: Language = null;

    try {
      language = await languageRepo.findOneOrFail({
        where: [{ id: languageId }],
      });
    } catch (error) {
      console.error(error);
      new APIResponse(res, 404, ['There is no language with given id.']).send();
      return;
    }

    new APIResponse(res, 200, language).send();
  }

  public static async createLanguage(
    req: Request,
    res: Response
  ): Promise<void> {
    const languageRepo: Repository<Language> = getRepository(Language);
    const { name } = req.body;

    let language = await languageRepo.findOne({ where: [{ name: name }] });

    if (language) {
      console.error(`Language ${name} already exists.`);
      new APIResponse(res, 400, {}, ['This language already exists.']).send();
      return;
    }

    language = new Language(name);

    try {
      console.log(language);
      await languageRepo.save(language);
    } catch (error) {
      new APIResponse(res, 500, {}, [
        'Error while saving language to the database.',
        error,
      ]).send();
      return;
    }

    new APIResponse(res, 200, language).send();
  }

  public static async deleteLanguage(
    req: Request,
    res: Response
  ): Promise<void> {
    const languageId = Number(req.params.id);
    const languageRepo: Repository<Language> = getRepository(Language);

    console.log(languageId);

    let language: Language = null;

    try {
      language = await languageRepo.findOneOrFail(languageId);
      await languageRepo.delete(languageId);
    } catch (error) {
      console.error("Couldn't find the requested user. Error: ", error);
      new APIResponse(res, 404, {}, [
        "Couldn't find a language with given id.",
      ]).send();
      return;
    }
    new APIResponse(res, 200, {}).send();
  }
}

export default LanguageController;
