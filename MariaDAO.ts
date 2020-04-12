
import * as mariadb from 'mariadb'
import {DBUser} from "./model/DBUser";

export class MariaDAO {

    private pool;

    constructor() {
        this.pool = mariadb.createPool({
            host: '127.0.0.1',
            user: 'root',
            password: 'root',
            connectionLimit: 5
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
        return this.withConnection(c => c.query('SELECT * FROM BrettSpiel.User'));
    }

    async getUserById(userId: number): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: 'SELECT * FROM BrettSpiel.User WHERE user_id=:id'},
            {id: userId}
        ));
    }

    async getUserByLogginName(name: string): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: 'SELECT * FROM BrettSpiel.User WHERE login_name=:ln'},
            {ln: name}
        ));
    }

    async removeUser(userId: number): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: 'DELETE FROM BrettSpiel.User WHERE user_id=:id'},
            {id: userId}
            ));
    }

    async insertUser(user: DBUser): Promise<any> {
        return this.withConnection(c => c.query(
                {namedPlaceholders: true, sql: 'INSERT INTO BrettSpiel.User (login_name, display_name, password_hash) VALUES (:ln, :dn, :ph)'},
                {ln: user.login_name, dn: user.display_name, ph: user.password_hash}
                ));
    }

    async updateUser(user: DBUser): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: 'UPDATE BrettSpiel.User SET login_name=:ln, display_name=:dn, password_hash=:ph WHERE user_id=:id'},
            {ln: user.login_name, dn: user.display_name, ph: user.password_hash, id: user.user_id}
        ));
    }

    async findLogin(login_name: string, password_hash: string): Promise<any> {
        return this.withConnection(c => c.query(
            {namedPlaceholders: true, sql: 'SELECT * FROM BrettSpiel.User WHERE login_name=:ln AND password_hash=:ph'},
            {ln: login_name, ph: password_hash}
        ));
    }
}