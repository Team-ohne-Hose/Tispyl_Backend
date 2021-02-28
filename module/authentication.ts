import { Request, Response, NextFunction } from "express";
import { JwtToken, JwtUserData } from "../types/JwtToken"
import jwt from "jsonwebtoken";
import * as hash from 'object-hash';

class Authorization {

    /** Number of salt rounds for hashing the password. */
    private static SALT_ROUNDS: number = 10

    private static JWT_OPTIONS: jwt.SignOptions = {
        expiresIn: 3600 // Time given in seconds.
    }

    public static async generateJwtToken(userData: JwtUserData): Promise<string> {
        return jwt.sign(userData, process.env.JWT_SECRET, Authorization.JWT_OPTIONS);
    }

    public static async verifyJwtToken(token: string): Promise<JwtToken | null> {
        try {
            return jwt.verify(token, process.env.JTW_SECRET) as JwtToken
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
            console.error("Error while extraction JWT token! Error: ", error);
            return null;
        }
    }

    public static hashPassword(password: string): string {
        return hash.MD5(password)
    }

    public static async verifyAccess(req: Request, res: Response, next: NextFunction): Promise<any> {
        const jwtToken: string = req.get("Authorization");

        // Check if a authorization header is set.
        if (jwtToken === undefined) {
            return res.status(401).send({
                status: "unauthorized"
            });
        }

        // If the header exists check the JWT token.
        const validToken: JwtToken = await Authorization.verifyJwtToken(jwtToken);

        if (!validToken) {
            return res.status(401).send({status: "unauthorized"});
        }

        // If the token is valid follow the next route.
        next();
    }

}

export default Authorization;