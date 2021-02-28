import { getRepository, Repository } from "typeorm"
import express, { Request, Response } from 'express';
import User from "../entities/user"
import { LoginOptions } from "../types/LoginOptions";
import Authorization from "../module/authentication";

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

    public static async deleteUser(req: Request, res: Response): Promise<void> {
        //TODO: JWT-Token

        const user_id: number = Number(req.params.user_id)
        const userRepository: Repository<User> = getRepository(User);

        let user: User = null;

        try {
            user = await userRepository.findOneOrFail(user_id)
        } catch (error) {
            console.error(
                "Couldn't find the requested user. Error: ", error
            );
            res.status(404).send({
                status: "not_found",
                error: "Couldn't find a user with the user id: " + user_id + "!"
            });
            return;
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
        const jwtToken: string = await Authorization.generateJwtToken({
            id: user.user_id,
            username: user.login_name
        });

        res.send({ status: "ok", data: jwtToken });

    }
}

export default UserController