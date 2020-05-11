
import * as mariadb from 'mariadb'
import {DBUser} from "./model/DBUser";
import credentials from "./configs/credentials.json";

export class MariaDAO {

    private static pool;
    private static schemaName;

    static init(config) {
        MariaDAO.schemaName = config.mariaDao.schemaName;
        MariaDAO.pool = mariadb.createPool({
            host: config.mariaDao.host,
            user: config.dev ? 'root' : credentials.mariaDao.user,
            password: config.dev ? 'root' : credentials.mariaDao.password,
            connectionLimit: config.mariaDao.connectionLimit
        })
    }

    static async withConnection(f: (PoolConnection) => Promise<any>): Promise<any> {
        let conn;
        try {
            conn = await MariaDAO.pool.getConnection();
            return f(conn);
        }  catch (err) {
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
                {namedPlaceholders: true, sql: `INSERT INTO ${MariaDAO.schemaName}.User (login_name, display_name, password_hash) VALUES (:ln, :dn, :ph)`},
                {ln: user.login_name, dn: user.display_name, ph: user.password_hash}
                ));
    }

    static async updateUser(user: DBUser): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `UPDATE ${MariaDAO.schemaName}.User SET login_name=:ln, display_name=:dn, password_hash=:ph WHERE user_id=:id`},
            {ln: user.login_name, dn: user.display_name, ph: user.password_hash, id: user.user_id}
        ));
    }

    static async findLogin(login_name: string, password_hash: string): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT * FROM ${MariaDAO.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash}
        ));
    }

    static async setProfilePicture(login_name: string, password_hash: string, picture_path: string): Promise<any> {
        return MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `UPDATE ${MariaDAO.schemaName}.User SET profile_picture=:pp WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash, pp: picture_path}
        ));
    }

    static async getProfilePicture(login_name: string, password_hash: string): Promise<any> {
        return await MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT profile_picture FROM ${MariaDAO.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash}
        ));
    }

    static async removeProfilePicture(login_name: string, password_hash: string): Promise<any> {
        const firstResult = await MariaDAO.withConnection(c => c.query(
                {namedPlaceholders: true, sql: `SELECT profile_picture FROM ${MariaDAO.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`},
                {ln: login_name, ph: password_hash}
            ));

        const secondResult = await MariaDAO.withConnection( c => c.query(
            {namedPlaceholders: true, sql: `UPDATE ${MariaDAO.schemaName}.User SET profile_picture=DEFAULT WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash}
        ));

        return firstResult;
    }

    static async addPlaytime(login_name: string, minutes: number) {
        MariaDAO.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `UPDATE ${MariaDAO.schemaName}.User SET time_played=time_played+:time WHERE login_name=:ln`},
            {ln: login_name, time: minutes}
        ));
    }
}
