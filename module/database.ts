import Environment from './environment';
import { createConnection, Connection } from "typeorm";

class DatabaseConnection {

    public static async connect(): Promise<Connection> {
        return await createConnection({
            type: "mysql",
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),

            username: process.env.DB_USER,
            password: process.env.DB_SECRET,
            database: process.env.DB_NAME,
        
            entities: [ __dirname + '/../entities/**/*.ts'],
            //entities: [__dirname + "/../entity/*.js"],

            logging: false
        });
    }
}

export default DatabaseConnection