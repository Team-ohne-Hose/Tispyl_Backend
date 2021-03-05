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
import backendConfigDev from "./configs/backend-config-dev.json";
import * as yargs from "yargs";
import { ErrorHandler } from "./helpers/ErrorHandler";
import betterLogging from 'better-logging';
import DatabaseConnection from './module/database';
import { Connection } from 'typeorm';
import Environment from './module/environment';
import globalRouter from './router/global.router';

require('dotenv').config();

betterLogging(console, {
    saveToFile: __dirname + `/logs/${Date.now()}.log`,
});


function fetchConfig() {
    const argv = yargs.options({
        env: {
            alias: 'e',
            choices: ['dev', 'prod'],
            demandOption: true,
            description: 'app environment'
        }
    }).argv;

    let config;
    if (argv.env === 'prod') {
        config = backendConfig;
        config.env = 'prod'
        console.log('Selected the production environment. This is tailored to be used on the uberspace setup.');
    } else if (argv.env === 'dev') {
        config = backendConfigDev;
        config.env = 'dev'
        console.log('Selected the development environment. Only use this environment on local setups.');
    } else {
        console.error('No environment was selected. The script will exit now.');
        process.exit(-1);
    }

    return config
}

/** Builds an http server that hosts the actual application depending on the current environment */
function buildHTTPServer(config, expressApp): { server, protocol } {
    if (process.env.NODE_ENV === 'production') {
        let s = createHttpsServer({
            key: fs.readFileSync(backendConfig.tlsKey),
            cert: fs.readFileSync(backendConfig.tlsCert)
        }, expressApp)
        return { server: s, protocol: 'https' };
    } else if (process.env.NODE_ENV === 'development') {
        return { server: createHttpServer(expressApp), protocol: 'http' };
    }
}

const startServer = () => {

    const config = fetchConfig();

    // The express object which provides all server functionalities.
    const requestHandler: express.Application = express();

    // USEFULL MIDDLEWARE

    requestHandler.use(express.json());
    requestHandler.use(cookieParser());
    requestHandler.use(express.urlencoded({ extended: true }));
    requestHandler.use(cors());
    requestHandler.use("/api", globalRouter);
    requestHandler.use('/colyseus', monitor());
    requestHandler.use('/', (req, res, next) => { res.sendFile(__dirname + "/views/index.html") });

    // FALLBACK ERROR HANDLERS

    requestHandler.use(ErrorHandler.logErrors);
    requestHandler.use(ErrorHandler.handleKnownError);
    requestHandler.use(ErrorHandler.handleUnexpectedError);

    DatabaseConnection.connect()
    .then((connection: Connection) => {

        console.info("Connected to the database.");
        const { server, protocol } = buildHTTPServer(config, requestHandler);   

        console.info(`Instantiating Colyseus Server.`);
        const colyseus = new Server({ noServer: true });
        colyseus.define('game', GameRoom);
        colyseus.onShutdown(function () {
            console.info(`Game server is going down.`);
        });
    
        server.on("error", err => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Failed to start the internal server. PORT: ${config.port} is already in use.`);
                console.error("Please ensure the specified port is not used by a different service or a second instance of the Brettspiel_Backend.");
                console.error("Original issue:", { err })
            } else {
                console.error("The HTTP server encountered an unspecified error", { err }, err.code);
            }
            server.close();
        });
    
        server.once("listening", () => {
            colyseus.attach({ server: server });
            console.info(`Listening on ${protocol}://${config.host}:${config.port}`);
        });
    
        server.listen(config.port);
    })
    .catch((error: Error) => {
        console.error(error);
    }
    );
}

if (require.main === module) {
    //Environment.setup(); //TODO: Need some more attention
    startServer();
}