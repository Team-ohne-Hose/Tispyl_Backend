/**
 * This class wraps all environment values in order to provide typesafe access to the .env file.
 * Issues loading the .env file will result in an error.
 */
class Environment {

    public static isLoaded: boolean = false;

    /** META */
    public static NODE_ENV: string = '';

    /** ALL DATABASE VARIABLES. */

    /** The database host to connect to. */
    public static DB_HOST: string = '';

    /** The database port. */
    public static DB_PORT: number = 0;

    /** The database user. */
    public static DB_USER: string = '';

    /** The name of the database. */
    public static DB_NAME: string = '';

    /** The port the running server will listen on. */
    public static SERVER_PORT: number = 25670;

    /**
     * The development variable which prevents to trigger external
     * api calls during development.
     */
    public static DEVELOPMENT: boolean = process.env.NODE_ENV === "development";

    /** All SECRETS. */

    /** The database password. */
    public static DB_SECRET: string = null;

    /** The JWT secret key. */
    public static JWT_SECRET: string = null;

    /** Fetches the current $PROJECT_ROOT/.env file*/
    public static loadEnv(): void {
        if (process.env.NODE_ENV !== undefined) {
            Environment.isLoaded = true;

            Environment.NODE_ENV = process.env.NODE_ENV;

            Environment.DB_HOST = process.env.DB_HOST;
            Environment.DB_USER = process.env.DB_USER;
            Environment.DB_NAME = process.env.DB_NAME;
            Environment.DB_PORT = Number(process.env.DB_PORT);

            Environment.SERVER_PORT = Number(process.env.SERVER_PORT);

            Environment.JWT_SECRET = process.env.JWT_SECRET;
            Environment.DB_SECRET = process.env.DB_SECRET;
        } else {
            console.error("Failed to load .env file")
        }
    }
}

export default Environment