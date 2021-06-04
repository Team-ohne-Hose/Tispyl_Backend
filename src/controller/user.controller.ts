import { getRepository, Repository } from 'typeorm';
import express, { Request, Response } from 'express';
import { validate, ValidationError } from 'class-validator';
import User from '../entity/User';
import { LoginOptions } from '../../types/LoginOptions';
import Authentication from '../../module/authentication';
import { JwtToken } from '../../types/JwtToken';
import { RegisterOptions } from '../../types/RegisterOptions';
import { APIResponse } from '../../model/APIResponse';

class UserController {
  public static async getAllUsers(req: Request, res: Response): Promise<void> {
    const userRepository: Repository<User> = getRepository(User);

    let users: User[] = null;

    try {
      users = await userRepository.find();
    } catch (error) {
      console.error('Error while requesting the database. Error: ', error);
      res.status(500).send({
        status: 'internal_server_error',
        error: 'Error while requesting the database.',
      });
      return;
    }

    // Delete passwords from response for each user.
    users.forEach((user: User) => {
      delete user.password_hash;
    });

    res.send({ status: 'ok', data: users });
  }

  public static async getSingleUser(
    req: Request,
    res: Response
  ): Promise<void> {
    const loginName = req.query.login_name;
    const userRepository: Repository<User> = getRepository(User);

    let user: User = null;

    try {
      user = await userRepository.findOneOrFail({
        where: [{ login_name: loginName }],
      });
    } catch (error) {
      console.log('There is no user with login_name' + loginName);
      new APIResponse(res, 404, {}, [
        'There is no user with given username.',
      ]).send();
      return;
    }

    // Delete the hashed password from the response.
    delete user.password_hash;

    new APIResponse(res, 200, user).send();
  }

  public static async getSingleUserbyId(
    req: Request,
    res: Response
  ): Promise<void> {
    const userId = Number(req.query?.userId);
    const userRepository: Repository<User> = getRepository(User);

    let user: User = null;

    console.log(userId);

    try {
      user = await userRepository.findOneOrFail({
        where: [{ id: userId }],
      });
    } catch (error) {
      console.log('There is no user with id ' + userId);
      new APIResponse(res, 404, {}, [
        'There is no user with given username.',
      ]).send();
      return;
    }

    // Delete the hashed password from the response.
    delete user.password_hash;

    new APIResponse(res, 200, user).send();
  }

  public static async createUser(req: Request, res: Response): Promise<void> {
    const registerOptions: RegisterOptions = req.body;
    const userRepository: Repository<User> = getRepository(User);

    /**
     * Validate if given parameters are all given. Send a bad
     * request (400) if the validation fails.
     */
    if (
      !registerOptions.displayname ||
      !registerOptions.password ||
      !registerOptions.username
    ) {
      new APIResponse(res, 400, {}, ['Invalid request body.']).send();
      return;
    }

    let user = await userRepository.findOne({
      where: [{ login_name: registerOptions.username }],
    });

    /**
     * Check if user with given loginname already exists. Send a bad
     * request (400) if the validation fails.
     */
    if (user) {
      new APIResponse(res, 400, {}, [
        'The given username is already in use.',
      ]).send();
      return;
    }

    const hashedPassword: string = Authentication.hashPassword(
      registerOptions.password
    );

    user = new User(
      registerOptions.username,
      registerOptions.displayname,
      hashedPassword
    );

    /**
     * Validate if the new user object is correct. Send a bad
     * request (400) if the validation fails.
     */
    const validationErrors: ValidationError[] = await validate(user);
    if (validationErrors.length > 0) {
      // Delete unnecessary error information.
      delete validationErrors[0].target;

      console.error('Validation failed. Errors: ', validationErrors);
      new APIResponse(res, 400, {}, validationErrors).send();

      return;
    }

    /**
     * Try to save the user inside the database. Send a internal
     * server error (500) if something goes wrong.
     */
    try {
      await userRepository.save(user);
    } catch (error) {
      console.error("User couldn't be saved into the database. Error: ", error);
      new APIResponse(res, 500, {}, [
        'Error while saving the user to the database.',
      ]).send();
      return;
    }

    // Delete the hashed password from the response.
    delete user.password_hash;

    new APIResponse(res, 200, user).send();
  }

  public static async updateUser(req: Request, res: Response): Promise<void> {
    const jwtToken: JwtToken = await Authentication.getJwtToken(req);
    const loginName = String(req.query.login_name);
    const userRepository: Repository<User> = getRepository(User);

    let user: User = null;

    try {
      user = await userRepository.findOneOrFail({
        where: { login_name: loginName },
      });
    } catch (error) {
      console.log(`Couldn't find the requested user. Error: ${error}`);
      new APIResponse(res, 404, {}, [
        {
          userMessage: 'Sorry, the requested resource does not exist',
          internalMessage: 'No user found in the database',
        },
      ]).send();
      return;
    }

    if (!jwtToken || !UserController.verifyUser(req, user)) {
      new APIResponse(res, 403, {}, [
        {
          userMessage: 'Permission not granted.',
          internalMessage: 'Wrong JWT token was provided.',
        },
      ]).send();
      return;
    }

    const { display_name, last_figure } = req.body;

    if (display_name !== undefined) user.display_name = display_name;

    if (last_figure !== undefined) user.last_figure = last_figure;

    try {
      await userRepository.save(user);
    } catch (error) {
      console.error("User couldn't be saved into the database. Error: ", error);
      new APIResponse(res, 500, {}, [
        {
          userMessage: 'Save user is not possible.',
          internalMessage: 'User can not save into the database.',
        },
      ]).send();
      return;
    }

    delete user.password_hash;
    new APIResponse(res, 200, { user: user }).send();
  }

  //TODO: Delete User

  public static async deleteUser(req: Request, res: Response): Promise<void> {
    const user_id = Number(req.params.user_id);
    const userRepository: Repository<User> = getRepository(User);

    let user: User = null;

    try {
      user = await userRepository.findOneOrFail(user_id);
    } catch (error) {
      console.error("Couldn't find the requested user. Error: ", error);
      new APIResponse(res, 404, {}, [
        "Couldn't find a user with given id.",
      ]).send();
      return;
    }

    if (!UserController.verifyUser(req, user)) {
      new APIResponse(res, 403, {}, [
        {
          userMessage: 'Permission not granted.',
          internalMessage: 'Wrong JWT token was provided.',
        },
      ]).send();
      return;
    }

    //TODO: Delete Avatar

    new APIResponse(res, 200, {}).send();
  }

  public static async loginUser(req: Request, res: Response): Promise<void> {
    const userRepository: Repository<User> = getRepository(User);
    let user: User = null;

    const loginOptions: LoginOptions = req.body;

    try {
      user = await userRepository.findOneOrFail({
        select: ['id', 'display_name', 'login_name', 'password_hash'],
        where: {
          login_name: loginOptions.username,
          password_hash: loginOptions.password,
        },
      });
    } catch (error) {
      if (error.name === 'EntityNotFound') {
        console.log(
          '(EntityNotFound) Couldn\'t find User: "' +
            loginOptions.username +
            '" with Password_hash: "' +
            loginOptions.password +
            '"'
        );
        new APIResponse(res, 404, {}, [
          'Username and Password did not match.',
        ]).send();
      } else {
        console.error(
          error.name +
            "Couldn't find a user with the following username: " +
            loginOptions.username +
            '\nError: ',
          error
        );
        new APIResponse(res, 404, {}, ['Failed to look up user.']).send();
      }
      return;
    }

    // Create JwtToken
    const jwtToken: string = await Authentication.generateJwtToken(
      {
        id: user.id,
        username: user.login_name,
      },
      Authentication.JWT_OPTIONS
    );

    res.cookie('SESSIONID', jwtToken, { httpOnly: true, secure: true });

    new APIResponse(res, 200, {
      jwtToken: jwtToken,
      expiresIn: Authentication.JWT_OPTIONS.expiresIn,
    }).send();
    console.info('User:', user.login_name, '\t', 'Token:', jwtToken);
  }

  /**
   *
   * @param login_name
   * @param minutes
   */
  public static async addPlaytime(
    login_name: string,
    minutes: number
  ): Promise<void> {
    const userRepository: Repository<User> = getRepository(User);
    try {
      const userToUpdate = await userRepository.findOne({
        where: [{ login_name: login_name }],
      });
      userToUpdate.time_played += minutes;
      await userRepository.save(userToUpdate);
    } catch (error) {
      console.log('Error:', error);
    }
  }

  private static async verifyUser(req: Request, user: User) {
    const jwtToken: JwtToken = await Authentication.getJwtToken(req);
    return user.id === jwtToken.id;
  }

  public static async getUserEntity(loginname: string): Promise<User | null> {
    const userRepository: Repository<User> = getRepository(User);
    return (
      (await userRepository.findOne({ where: [{ login_name: loginname }] })) ??
      null
    );
  }
}

export default UserController;
