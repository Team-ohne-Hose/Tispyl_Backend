import { getRepository, Repository } from "typeorm"
import express, { Request, Response } from 'express';
import { validate, ValidationError } from "class-validator";
import User from "../entities/user"
import { LoginOptions } from "../types/LoginOptions";
import Authentication from "../module/authentication";
import { JwtToken } from "../types/JwtToken";
import { RegisterOptions } from "../types/RegisterOptions";

class UserController {

    public static async getAllUsers(req: Request, res: Response): Promise<void> {
        const userRepository: Repository<User> = getRepository(User);

        let users: User[] = null;

        try {
            users = await userRepository.find()
        } catch (error) {
            console.error("Error while requesting the database. Error: ", error);
            res.status(500).send({
                status: "internal_server_error",
                error: "Error while requesting the database."
            });
            return;
        }

        // Delete passwords from response for each user.
        users.forEach((user: User) => {
            delete user.password_hash;
        });

        res.send({ status: "ok", data: users });
    }

    public static async getSingleUser(req: Request, res: Response): Promise<void> {
        const loginName = req.params.login_name
        const userRepository: Repository<User> = getRepository(User)

        let user: User = null;

        try {
            user = await userRepository.findOneOrFail({ where: [{ login_name: loginName }] })
        } catch (error) {
            console.log("There is no user with login_name" + loginName)
            res.status(404).send({
                status: "not_found",
                error: "No user found."
            });
            return;
        }
        
        // Delete the hashed password from the response.
        delete user.password_hash;
        res.send({ status: "ok", data: user });
    }

    public static async createUser(req: Request, res: Response): Promise<void> {
        const registerOptions: RegisterOptions = req.body;
        const userRepository: Repository<User> = getRepository(User)

        let user = await userRepository.findOne({ where: [{ login_name: registerOptions.username }] })

        /** 
         * Check if user with given loginname already exists. Send a bad
         * request (400) if the validation fails.
         */
        if (user) {
            res.status(400).send({
                status: 'bad_request',
                error: 'The username is already in use.'
            });
            return;
        }

        /** 
         * Validate if given parameters are all given. Send a bad
         * request (400) if the validation fails.
         */
        if (!registerOptions.displayname || !registerOptions.password || !registerOptions.username) {
            res.status(400).send({
                status: 'bad_request',
                error: 'The request body is missing some attributes.'
            });
            return;
        }

        const hashedPassword: string = await Authentication.hashPassword(registerOptions.password);

        user = new User(registerOptions.username, registerOptions.displayname, hashedPassword)

        /** 
         * Validate if the new user object is correct. Send a bad
         * request (400) if the validation fails.
         */
        const validationErrors: ValidationError[] = await validate(user)
        if (validationErrors.length > 0) {
            // Delete unnecessary error information.
            delete validationErrors[0].target;

            console.error("Validation failed. Errors: ", validationErrors);
            res.status(400).send({
                status: "bad_request",
                errors: validationErrors
            });
            return;
        }

        /**
         * Try to save the user inside the database. Send a internal
         * server error (500) if something goes wrong.
         */
        try {
            await userRepository.save(user);
        } catch (error) {
            console.error("Data couldn't be saved into the database. Error: ", error);
            res.status(500).send({
                status: "internal_server_error",
                error: "Error while saving the user inside the database."
            });
            return;
        }

        // Delete the hashed password from the response.
        delete user.password_hash;

        res.send({ status: "ok", data: user });

    }

    public static async deleteUser(req: Request, res: Response): Promise<void> {

        const jwtToken: JwtToken = await Authentication.getJwtToken(req)

        const user_id: number = Number(req.params.user_id)
        const userRepository: Repository<User> = getRepository(User);

        let user: User = null;

        try {
            user = await userRepository.findOneOrFail(user_id)
        } catch (error) {
            console.error("Couldn't find the requested user. Error: ", error);
            res.status(404).send({
                status: "not_found",
                error: "Couldn't find a user with the user id: " + user_id + "!"
            });
            return;
        }

        /** 
         * Validate the owner of the jwt-token. Send a forbidden
         * (403) if the validation fails.
         */
        if (user.user_id !== jwtToken.id) {
            res.status(403).send({
                status: 'forbidden',
                error: 'Wrong JWT token was provided.'
            })
        }

        //TODO: Delete Avatar

        res.send({ status: "ok" });
    }

    public static async loginUser(req: Request, res: Response): Promise<void> {
        const userRepository: Repository<User> = getRepository(User);
        let user: User = null;

        let loginOptions: LoginOptions = req.body


        try {
            user = await userRepository.findOneOrFail({
                select: ["user_id", "display_name", "login_name", "password_hash"],
                where: { login_name: loginOptions.username }
            });

        } catch (error) {
            console.error("Couldn't find a user with the following username: " + loginOptions.username + "\n" + "Error: ", error);

            res.status(404).send({
                status: "not_found",
                error: "Couldn't find a user with the provided username."
            });
            return;
        }

        //TODO: Password validation

        // Create JwtToken
        console.log(user)
        const jwtToken: string = await Authentication.generateJwtToken({
            id: user.user_id,
            username: user.login_name
        });

        res.send({ status: "ok", data: jwtToken });

    }
}

export default UserController