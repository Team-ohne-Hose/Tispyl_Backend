import * as mariadb from 'mariadb'
import {DBUser} from "./model/DBUser";
import credentials from "./configs/credentials.json";
import {Connection, Pool, PoolConnection} from "mariadb";
import { deprecate } from 'util';

export class MariaDAO {

    private static initialized: boolean = false;
    private static pool: Pool;
    private static schemaName: string;

    static isInitialized(): boolean {
        return MariaDAO.initialized;
    }

    static setInitialized(): boolean {
        return MariaDAO.initialized = true;
    }

    static async init(config): Promise<Connection> {
        console.info(`Initializing MariaDB connection: schemaName='${config.mariaDao.schemaName}', host=${config.mariaDao.host}, connectionLimit=${config.mariaDao.connectionLimit} ...`)
        MariaDAO.schemaName = config.mariaDao.schemaName;
        MariaDAO.pool = mariadb.createPool({
            host: config.mariaDao.host,
            user: config.dev ? 'root' : credentials.mariaDao.user,
            password: config.dev ? 'root' : credentials.mariaDao.password,
            connectionLimit: config.mariaDao.connectionLimit
        })
        return await MariaDAO.pool.getConnection()
    }

    static async withConnection(f: (PoolConnection) => Promise<any>): Promise<any> {
        let conn;
        try {
            conn = await MariaDAO.pool.getConnection();
            return f(conn);
        } catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    static async getAllUsers(): Promise<any> {
        return MariaDAO.withConnection(c => c.query(`SELECT * FROM ${MariaDAO.schemaName}.User`));
    }

    static async getUserById(userId: number): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT * FROM ${MariaDAO.schemaName}.User WHERE user_id=:id`},
            {id: userId}
        ));
    }

    static async getUserByLogginName(name: string): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT * FROM ${MariaDAO.schemaName}.User WHERE login_name=:ln`},
            {ln: name}
        ));
    }

    static async removeUser(userId: number): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `DELETE FROM ${MariaDAO.schemaName}.User WHERE user_id=:id`},
            {id: userId}
        ));
    }

    static async insertUser(user: DBUser): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {
                namedPlaceholders: true,
                sql: `INSERT INTO ${MariaDAO.schemaName}.User (login_name, display_name, password_hash) VALUES (:ln, :dn, :ph)`
            },
            {ln: user.login_name, dn: user.display_name, ph: user.password_hash}
        ));
    }

    static async updateUser(user: DBUser): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {
                namedPlaceholders: true,
                sql: `UPDATE ${MariaDAO.schemaName}.User SET login_name=:ln, display_name=:dn, password_hash=:ph WHERE user_id=:id`
            },
            {ln: user.login_name, dn: user.display_name, ph: user.password_hash, id: user.user_id}
        ));
    }

    static async findLogin(login_name: string, password_hash: string): Promise<any> {
        return MariaDAO.withConnection( (c: Connection) => c.query(
            {
                namedPlaceholders: true,
                sql: `SELECT * FROM ${MariaDAO.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`
            },
            {ln: login_name, ph: password_hash}
        ));
    }

    static async setProfilePicture(login_name: string, password_hash: string, picture_path: string): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {
                namedPlaceholders: true,
                sql: `UPDATE ${MariaDAO.schemaName}.User SET profile_picture=:pp WHERE login_name=:ln AND password_hash=:ph`
            },
            {ln: login_name, ph: password_hash, pp: picture_path}
        ));
    }

    static async getProfilePicture(login_name: string): Promise<any> {
        return await this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT profile_picture FROM ${this.schemaName}.User WHERE login_name=:ln`}, //  AND password_hash=:ph
            {ln: login_name}
        ));
    }

    static async removeProfilePicture(login_name: string, password_hash: string): Promise<any> {
        const firstResult = await MariaDAO.withConnection(c => c.query(
            {
                namedPlaceholders: true,
                sql: `SELECT profile_picture FROM ${MariaDAO.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`
            },
            {ln: login_name, ph: password_hash}
        ));

        const secondResult = await MariaDAO.withConnection(c => c.query(
            {
                namedPlaceholders: true,
                sql: `UPDATE ${MariaDAO.schemaName}.User SET profile_picture=DEFAULT WHERE login_name=:ln AND password_hash=:ph`
            },
            {ln: login_name, ph: password_hash}
        ));

        return firstResult;
    }

    static async addPlaytime(login_name: string, minutes: number) {
        MariaDAO.withConnection(c => c.query(
            {
                namedPlaceholders: true,
                sql: `UPDATE ${MariaDAO.schemaName}.User SET time_played=time_played+:time WHERE login_name=:ln`
            },
            {ln: login_name, time: minutes}
        ));
    }

    static async insertGameLog(game_name: string, author: string, skin: string, randomizeTiles: boolean, startTime: string, endTime: string, maxPlayers: number, maxRound: number): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {
                namedPlaceholders: true,
                sql: `INSERT INTO ${MariaDAO.schemaName}.Games (game_name, author, skin, randomizeTiles, startTime, endTime, maxPlayers, maxRound) VALUES (:gn, :au, :sk, :rt, CONVERT(:st,datetime), CONVERT(:et,datetime), :mp, :rd)`
            },
            {
                gn: game_name,
                au: author,
                sk: skin,
                rt: randomizeTiles,
                st: startTime,
                et: endTime,
                mp: maxPlayers,
                rd: maxRound
            }
        ));
    }
}
