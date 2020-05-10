
import * as mariadb from 'mariadb'
import {DBUser} from "./model/DBUser";
import credentials from "./configs/credentials.json";

export class MariaDAO {

    private pool;
    private readonly schemaName;

    constructor(config) {
        this.schemaName = config.mariaDao.schemaName;
        this.pool = mariadb.createPool({
            host: config.mariaDao.host,
            user: config.dev ? 'root' : credentials.mariaDao.user,
            password: config.dev ? 'root' : credentials.mariaDao.password,
            connectionLimit: config.mariaDao.connectionLimit
        })
    }

    async withConnection(f: (PoolConnection) => Promise<any>): Promise<any> {
        let conn;
        try {
            conn = await this.pool.getConnection();
            return f(conn);
        }  catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async getAllUsers(): Promise<any> {
        return this.withConnection(c => c.query(`SELECT * FROM ${this.schemaName}.User`));
    }

    async getUserById(userId: number): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT * FROM ${this.schemaName}.User WHERE user_id=:id`},
            {id: userId}
        ));
    }

    async getUserByLogginName(name: string): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT * FROM ${this.schemaName}.User WHERE login_name=:ln`},
            {ln: name}
        ));
    }

    async removeUser(userId: number): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `DELETE FROM ${this.schemaName}.User WHERE user_id=:id`},
            {id: userId}
            ));
    }

    async insertUser(user: DBUser): Promise<any> {
        return this.withConnection(c => c.query(
                {namedPlaceholders: true, sql: `INSERT INTO ${this.schemaName}.User (login_name, display_name, password_hash) VALUES (:ln, :dn, :ph)`},
                {ln: user.login_name, dn: user.display_name, ph: user.password_hash}
                ));
    }

    async updateUser(user: DBUser): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `UPDATE ${this.schemaName}.User SET login_name=:ln, display_name=:dn, password_hash=:ph WHERE user_id=:id`},
            {ln: user.login_name, dn: user.display_name, ph: user.password_hash, id: user.user_id}
        ));
    }

    async findLogin(login_name: string, password_hash: string): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT * FROM ${this.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash}
        ));
    }

    async setProfilePicture(login_name: string, password_hash: string, picture_path: string): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `UPDATE ${this.schemaName}.User SET profile_picture=:pp WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash, pp: picture_path}
        ));
    }

    async getProfilePicture(login_name: string, password_hash: string): Promise<any> {
        return await this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: `SELECT profile_picture FROM ${this.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash}
        ));
    }

    async removeProfilePicture(login_name: string, password_hash: string): Promise<any> {
        const firstResult = await this.withConnection(c => c.query(
                {namedPlaceholders: true, sql: `SELECT profile_picture FROM ${this.schemaName}.User WHERE login_name=:ln AND password_hash=:ph`},
                {ln: login_name, ph: password_hash}
            ));

        const secondResult = await this.withConnection( c => c.query(
            {namedPlaceholders: true, sql: `UPDATE ${this.schemaName}.User SET profile_picture=DEFAULT WHERE login_name=:ln AND password_hash=:ph`},
            {ln: login_name, ph: password_hash}
        ));

        return firstResult;
    }
}
