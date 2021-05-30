import { Request, Response, NextFunction } from 'express';
import { JwtToken, JwtUserData } from '../types/JwtToken';
import jwt from 'jsonwebtoken';
import * as hash from 'object-hash';
import { APIResponse } from '../model/APIResponse';

class Authentication {
  /** Number of salt rounds for hashing the password. */
  private static SALT_ROUNDS = 10;

  static JWT_OPTIONS: jwt.SignOptions = {
    expiresIn: 3600 * 12, // Time given in seconds.
  };

  public static async generateJwtToken(
    userData: JwtUserData,
    jwtOptions: {}
  ): Promise<string> {
    return jwt.sign(userData, process.env.JWT_SECRET, jwtOptions);
  }

  public static async verifyJwtToken(token: string): Promise<JwtToken | null> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET) as JwtToken;
    } catch (error) {
      console.warn("JWT token couldn't be verified!");
      return null;
    }
  }

  /**
   * Return the decoded JWT token from the request object. If the
   * request didn't contain a valid authorization header the
   * function will return null.
   */
  public static async getJwtToken(req: Request): Promise<JwtToken | null> {
    try {
      const jwtString: string = req.headers.authorization;
      return jwt.decode(jwtString, { json: true }) as JwtToken;
    } catch (error) {
      console.error('Error while extraction JWT token! Error: ', error);
      return null;
    }
  }

  public static hashPassword(password: string): string {
    return hash.MD5(password);
  }

  public static async verifyAccess(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const jwtToken: string = req.get('Authorization');

    // Check if a authorization header is set.
    if (jwtToken === undefined) {
      new APIResponse(res, 401, {}, [
        {
          userMessage: 'Permission not granted.',
          internalMessage: 'No JWT token was provided.',
        },
      ]).send();
      return;
    }

    // If the header exists check the JWT token.
    const validToken: JwtToken = await Authentication.verifyJwtToken(jwtToken);

    console.log(validToken, !null);

    if (validToken === null) {
      new APIResponse(res, 401, {}, [
        {
          userMessage: 'Permission not granted.',
          internalMessage: 'Wrong JWT token was provided.',
        },
      ]).send();
      return;
    }

    // If the token is valid follow the next route.
    next();
  }
}

export default Authentication;
