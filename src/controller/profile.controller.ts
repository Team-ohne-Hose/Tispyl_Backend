import { Request, Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import User from '../entity/User';
import * as path from 'path';
import * as fs from 'fs';
import { ImagePreparer } from '../helpers/ImagePreparer';
import multer from 'multer';
import { APIResponse } from '../model/APIResponse';
import Environment from '../module/environment';

class ProfileController {
  static MIMETYPES = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript',
  };

  static DEFAULT_IMAGE_PATH = `${Environment.IMAGE_PATH}/default_image.jpg`;

  public static async getProfilePicture(
    req: Request,
    res: Response
  ): Promise<void> {
    const loginName = req.query.login_name;
    const userRepository: Repository<User> = getRepository(User);

    let picturePath = '';

    try {
      const user: User = await userRepository.findOneOrFail({
        where: [{ login_name: loginName }],
      });
      picturePath = fs.existsSync(user.profile_picture)
        ? user.profile_picture
        : `${Environment.IMAGE_PATH}/default_image.jpg`;
    } catch (error) {
      console.log('There is no user with login_name' + loginName);
      res.status(404).send({
        status: 'not_found',
        error: 'No user found.',
      });
      return;
    }

    const mimeType =
      ProfileController.MIMETYPES[
        path.extname(picturePath).slice(1).toLowerCase()
      ] || 'text/plain';

    const stream = fs.createReadStream(picturePath);
    stream.on('open', () => {
      res.set('Content-Type', mimeType);
      stream.pipe(res);
    });
  }

  public static async updateProfilePicture(
    req: Request,
    res: Response
  ): Promise<void> {
    const loginName = req.body.login_name;

    const userRepository: Repository<User> = getRepository(User);

    let user: User = null;

    try {
      user = await userRepository.findOneOrFail({
        where: [{ login_name: loginName }],
      });
    } catch (error) {
      console.error("Couldn't find the requested user. Error: ", error);
      new APIResponse(res, 404, {}, [
        "Couldn't find a user with the username: " + loginName + '!',
      ]).send();
      return;
    }

    ImagePreparer.prepare(req.file.path).then((preparedImagePath: string) => {
      if (user?.profile_picture) {
        fs.unlink(user.profile_picture, () => {
          return;
        });
      }

      user.profile_picture = preparedImagePath;
      delete user.password_hash;

      userRepository
        .save(user)
        .then(() => new APIResponse(res, 200, user).send())
        .catch((error) => {
          fs.unlink(req.file.path, () => {
            return;
          });
          console.error(
            "User couldn't be saved into the database. Error: ",
            error
          );
          res.status(500).send({
            status: 'internal_server_error',
            error: "User couldn't be saved into the database.",
          });
        });
    });
  }

  public static async deleteProfilePicture(
    req: Request,
    res: Response
  ): Promise<void> {
    const loginName = req.query.login_name;
    const userRepository: Repository<User> = getRepository(User);

    // TODO: JwtToken eval

    let user: User = null;

    if (loginName !== undefined) {
      try {
        user = await userRepository.findOneOrFail({
          where: [{ login_name: loginName }],
        });
      } catch (error) {
        console.error("Couldn't find the requested user. Error: ", error);
        res.status(404).send({
          status: 'not_found',
          error: "Couldn't find a user with the username: " + loginName + '!',
        });
        return;
      }
    }
    try {
      // Delete all the user content (e.g. the avatar).
      await userRepository.remove(user);
    } catch (error) {
      console.error(
        'Error while deleting user: ' + user.login_name + '\n' + 'Error: ',
        error
      );
      res.status(500).send({
        status: 'internal_server_error',
        error: 'Error while deleting the user!',
      });
      return;
    }
    res.send({ status: 'ok' });
  }

  private static multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${Environment.IMAGE_PATH}`);
    },
    filename: (req, file, cb) => {
      cb(
        null,
        file.fieldname + '_' + Date.now() + path.extname(file.originalname)
      );
    },
  });

  private static multerLimits = {
    fileSize: 1 * 1024 * 1024,
    files: 5,
    parts: 10,
  };

  private static multerFileFilter = (req, file, cb): void => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error(
        'Invalid format. Allowed formats are: .png, .jpg and .jpeg'
      );
      err.name = 'MULTER_FILTER_REJECTION';
      return cb(err);
    }
  };

  public static multipartData = multer({
    storage: ProfileController.multerStorage,
    limits: ProfileController.multerLimits,
    fileFilter: ProfileController.multerFileFilter,
  });
}
export default ProfileController;
