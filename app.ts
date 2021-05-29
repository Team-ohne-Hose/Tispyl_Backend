import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { createServer as createHttpsServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { GameRoom } from "./GameRoom";
import backendConfig from "./configs/backend-config.json";
import { ErrorHandler } from "./helpers/ErrorHandler";
import betterLogging from 'better-logging';
import {Connection, createConnection} from "typeorm";
import globalRouter from './src/router/global.router';
import Environment from "./module/environment";

require('dotenv').config();

betterLogging(console, {
    saveToFile: __dirname + `/logs/${Date.now()}.log`,
});

/**
 * Establishes the database connection using TypeORM and runs actions to prepare the database for later use.
 * @Note:   Since TypeORM seems to incorrectly handle promise exceptions, handling them is omitted.
 *          This is done explicitly to receive some kind of stack trace via the 'UnhandledPromiseRejectionWarning'
 *          in case an error occurs.
 */
async function connectToDataBase(): Promise<Connection> {
    const con: Connection = await createConnection();

    console.log("Running open migrations (if present)")
    await con.runMigrations();

    if (Environment.NODE_ENV === 'development') {
        console.info("[DEV] Synchronizing database model to Entities")
        await con.synchronize();
    }

    return;
}

/** Builds an http server that hosts the actual application depending on the current environment */
function buildHTTPServer(expressApp): { server, protocol } {
    if (Environment.NODE_ENV === 'production') {
        let s = createHttpsServer({
            key: fs.readFileSync(backendConfig.tlsKey),
            cert: fs.readFileSync(backendConfig.tlsCert)
        }, expressApp)
        return { server: s, protocol: 'https' };
    } else if (Environment.NODE_ENV === 'development') {
        return { server: createHttpServer(expressApp), protocol: 'http' };
    }
}

/** Main entrypoint for the server startup */
async function run() {

    if (!Environment.isLoaded) {
        console.error("Environment was not loaded. Aborting server startup.")
        return;
    }
    const requestHandler: express.Application = express();

    /** Configure express */
    requestHandler.use(express.json());
    requestHandler.use(cookieParser());
    requestHandler.use(express.urlencoded({ extended: true }));
    requestHandler.use(cors());
    requestHandler.use("/api", globalRouter);
    requestHandler.use('/colyseus', monitor());
    requestHandler.use('/', (req, res, next) => { res.sendFile(__dirname + "/views/index.html") });

    /** Configure error handling for express*/
    requestHandler.use(ErrorHandler.logErrors);
    requestHandler.use(ErrorHandler.handleKnownError);
    requestHandler.use(ErrorHandler.handleUnexpectedError);

    console.info(`Connecting to DB at ${Environment.DB_HOST}:${Environment.DB_PORT}`)
    await connectToDataBase();

    console.log("Building HTTP server.")
    const { server, protocol } = buildHTTPServer(requestHandler);

    console.info(`Instantiating Colyseus Server.`);
    const colyseus = new Server({ noServer: true });
    colyseus.define('game', GameRoom);
    colyseus.onShutdown(function () {
        console.info(`Game server is going down.`);
    });

    server.on("error", err => {
        if (err.code === 'EADDRINUSE') {
            console.error(`Failed to start the internal server. PORT: ${Environment.SERVER_PORT} is already in use.`);
            console.error("Please ensure the specified port is not used by a different service or a second instance of the Brettspiel_Backend.");
            console.error("Original issue:", { err })
        } else {
            console.error("The HTTP server encountered an unspecified error", { err }, err.code);
        }
        server.close();
    });

    server.once("listening", () => {
        colyseus.attach({ server: server });
        console.info(`Listening for [${protocol}] on port: [${Environment.SERVER_PORT}]`);
    });

    server.listen(Environment.SERVER_PORT);
}

if (require.main === module) {
    Environment.loadEnv();
    run().then(r => console.info("Server shut down."));
}