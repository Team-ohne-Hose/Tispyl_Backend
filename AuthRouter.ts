import * as express from "express";
import {DBUser} from "./model/DBUser";
import {MariaDAO} from "./MariaDAO";
import {APIResponse} from "./model/APIResponse";
import * as hash from 'object-hash';
import {ActiveAccountsManager} from "./helpers/CustomAuthMiddleware";


export class AuthRouter {

    router;

    constructor() {
        this.router = express.Router();

        this.router.post('/register', async (req, res) => {
            if (req.body.hasOwnProperty('login_name') &&
                req.body.hasOwnProperty('display_name') &&
                req.body.hasOwnProperty('password')) {

                let usr: DBUser = new DBUser(req.body.login_name, req.body.display_name, hash.MD5(req.body.password));
                MariaDAO.insertUser(usr).then( suc => {
                    new APIResponse(res, 201, suc).send();
                }, err => {
                    if ( err.code === 'ER_DUP_ENTRY' ) {
                        new APIResponse(res, 408, { expectedFailure: "NAME_ALREADY_TAKEN" }).send();
                        console.info(`User creation unsuccessful, login_name: '${req.body.login_name}' was already taken.`);
                    } else {
                        new APIResponse(res, 500, {}, [err]).send();
                        console.warn(err);
                    }
                });

            } else {
                new APIResponse(res, 408, {}, ['Registration failed. Body did not conform to expected values']).send();
            }
        });

        this.router.post('/authenticate', async (req, res) => {
            if (req.body.hasOwnProperty('login_name') &&
                req.body.hasOwnProperty('password_hash')) {

                let usr: any[];
                try {
                    usr = await MariaDAO.findLogin(req.body.login_name, req.body.password_hash);
                } catch (e) {
                    new APIResponse(res, 500, {}, [e]).send();
                    console.error(e);
                }

                if (usr.length === 0) {
                    new APIResponse(res, 404, {expectedFailure: "CREDENTIALS_DID_NOT_MATCH"}).send();
                } else if (usr.length === 1) {

                    const clientSecret = hash.MD5(`${req.body.login_name}${req.body.password_hash}${new Date()}`);
                    const loginHash = hash.MD5(req.body.login_name);
                    const expirationDate = ActiveAccountsManager.loginAccount(loginHash, clientSecret);

                    res.cookie("login_token", clientSecret, {expires: expirationDate});
                    res.cookie("login_hash", loginHash, {expires: expirationDate});

                    new APIResponse(res, 200, usr).send();

                } else {
                    new APIResponse(res, 500, {}, ['FATAL: More than one user found for login. This should NEVER happen.']).send();
                    console.error(`Found multiple users for: ${req.body.login_name}. This needs to be corrected immediately.`)
                }

            } else {
                new APIResponse(res, 408, {}, ['Authentication failed. Body did not conform to expected values']).send();
            }
        });

        this.router.get('/amILoggedIn', async (req, res) => {
            let login_token = req.cookies['login_token'];
            let login_hash = req.cookies['login_hash'];
            new APIResponse(res, 200, ActiveAccountsManager.isActive(login_hash, login_token)).send();
        });
    }
}