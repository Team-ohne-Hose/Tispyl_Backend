/**
 * This class wraps all environment values in order to provide typesafe access to the .env file.
 * Issues loading the .env file will result in an error.
 */
class Environment {
  public static isLoaded = false;

  /** META */
  public static NODE_ENV = '';

  /** ALL DATABASE VARIABLES. */
  /** The database host to connect to. */
  public static DB_HOST = '';
  /** The database port. */
  public static DB_PORT = 0;
  /** The database user. */
  public static DB_USER = '';
  /** The name of the database. */
  public static DB_NAME = '';

  /** The port the running server will listen on. */
  public static SERVER_PORT = 25670;

  /**
   * The development variable which prevents to trigger external
   * api calls during development.
   */
  public static DEVELOPMENT: boolean = process.env.NODE_ENV === 'development';

  /** HTTPS */
  public static TLS_KEY: string = null;
  public static TLS_CRT: string = null;

  /** All SECRETS. */
  public static DB_SECRET: string = null;
  public static JWT_SECRET: string = null;

  /** PROJECT STRUCTURE */
  public static LOGGING_PATH: string = null;
  public static IMAGE_PATH: string = null;
  public static NEWS_PATH: string = null;

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

      Environment.TLS_KEY = process.env.TLS_KEY;
      Environment.TLS_CRT = process.env.TLS_CRT;

      Environment.LOGGING_PATH = process.env.LOGGING_PATH;
      Environment.IMAGE_PATH = process.env.IMAGE_PATH;
      Environment.NEWS_PATH = process.env.NEWS_PATH;
    } else {
      console.error('Failed to load .env file');
    }
  }
}

export default Environment;
