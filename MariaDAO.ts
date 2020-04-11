
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

    async simpleQuery(queryString: string): Promise<any> {
        let conn;
        try {
            conn = await this.pool.getConnection();
            return conn.query(queryString);
        }  catch (err) {
            throw err;
        } finally {
            if (conn) conn.end();
        }
    }

    async getAllUsers(): Promise<any> {
        const connection = await this.pool.getConnection();
        return connection.query('SELECT * FROM BrettSpiel.User');
    }

    async getUser(userId: number): Promise<any> {
        const connection = await this.pool.getConnection();
        return connection.query(
            {namedPlaceholders: true, sql: 'SELECT * FROM BrettSpiel.User WHERE user_id=:id'},
            {id: userId}
        );
    }

    async removeUser(userId: number): Promise<any> {
        const connection = await this.pool.getConnection();
        return connection.query(
            {namedPlaceholders: true, sql: 'DELETE FROM BrettSpiel.User WHERE user_id=:id'},
            {id: userId}
            );
    }

    async insertUser(user: DBUser): Promise<any> {
        const connection = await this.pool.getConnection();
        return connection.query(
                {namedPlaceholders: true, sql: 'INSERT INTO BrettSpiel.User (login_name, display_name, password_hash) VALUES (:ln, :dn, :ph)'},
                {ln: user.login_name, dn: user.display_name, ph: user.password_hash}
                );
    }

    async updateUser(user: DBUser): Promise<any> {
        const connection = await this.pool.getConnection();
        return connection.query(
            {namedPlaceholders: true, sql: 'UPDATE BrettSpiel.User SET login_name=:ln, display_name=:dn, password_hash=:ph WHERE user_id=:id'},
            {ln: user.login_name, dn: user.display_name, ph: user.password_hash, id: user.user_id}
        );
    }
}