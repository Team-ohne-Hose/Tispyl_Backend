import express from 'express';
import {Request, Response} from 'express';
import cors from 'cors';
import fs from 'fs';
import { createServer as createHttpsServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';
import { GameRoom} from "./GameRoom";
import { ApiRouter} from "./ApiRouter";
import backendConfig from "./configs/backend-config.json";
import backendConfigDev from "./configs/backend-config-dev.json";
import * as yargs from "yargs";
import {ErrorHandler} from "./helpers/ErrorHandler";
import {MariaDAO} from "./MariaDAO";
import * as http from "http";
import {Connection} from "mariadb";
import betterLogging, {expressMiddleware} from 'better-logging';

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
function buildHTTPServer(config, expressApp): {server, protocol} {
    if (config.env === 'prod') {
        console.info(`Instantiating HTTPS Server on top of the Express base. (Cert: ${backendConfig.tlsKey}, Key: ${backendConfig.tlsCert}).`);
        let s = createHttpsServer({
            key: fs.readFileSync(backendConfig.tlsKey),
            cert: fs.readFileSync(backendConfig.tlsCert)
        }, expressApp)
        return { server: s, protocol: 'https'};
    } else if (config.env === 'dev') {
        console.info(`Instantiating HTTP Server on top of the Express base. DEVELOPMENT ONLY!`);
        return { server: createHttpServer(expressApp), protocol: 'http' };
    }
}

/** Configures the express framework for handling http requests, routing and multipart body parsing. */
function configureExpressApplication() {
    const express_app = express();
    express_app.use(cors());
    express_app.use(express.json());
    express_app.use(express.urlencoded({ extended: true }));

    console.log("Attaching logging callback to HTTP(S) requests on Express.");
    const chalk = require('chalk');
    express_app.use(expressMiddleware(console, {
        method: {
            show: true,
            color: chalk.grey,
            order: 1,
        },
        ip: {
            show: true,
            color: chalk.grey,
            order: 2,
        },
        path: {
            show: true,
            color: chalk.reset,
            order: 3,
        },
        body: {
            show: true,
            color: chalk.reset,
            order: 4,
        },
        header: {
            show: false,
            color: chalk.reset,
            order: 5,
        }
    }));

    console.log("Attaching Express routes for:\n\t/colyseus\n\t/api\n\t/");
    express_app.use('/colyseus', monitor());
    express_app.use('/api', new ApiRouter().router);
    express_app.use('/', (req, res, next) => { res.sendFile(__dirname + "/views/index.html") });

    console.log("Attaching Express fallback error handlers.");
    express_app.use(ErrorHandler.logErrors);
    express_app.use(ErrorHandler.handleKnownError);
    express_app.use(ErrorHandler.handleUnexpectedError);

    return express_app;
}

/** Establishes the connection between the static MariaDAO object and the database under the configured address.
 * This includes waiting for potential timeouts if the database is not reachable.
 *
 * @param config object including parameters for the database access.
 */
async function connectToMariaDB(config) {
    let c: Connection;
    try {
        c = await MariaDAO.init(config);
        MariaDAO.setInitialized();
    } catch (e) {
        console.error(`Failed to establish MariaDB connection (code: ${e.code}). Please ensure a running database is available under the expected address. Original Issue:`, { e });
        process.exit(1);
    } finally {
        if (c) await c.end();
    }
}

/** Driver code and entry point to start the backend */
async function run() {
    const config = fetchConfig();

    await connectToMariaDB(config)

    const app = configureExpressApplication();

    const { server, protocol } = buildHTTPServer(config, app);

    /* Building the colyseus server without the express app provided to its constructor. This is a workaround
     * to allow us to correctly deal with startup exceptions of the server.
     *
     * @see https://github.com/colyseus/colyseus/issues/313
     */
    console.log(`Instantiating Colyseus Server.`);
    const colyseus = new Server({noServer: true});
    colyseus.define('game', GameRoom);
    colyseus.onShutdown(function(){
        console.info(`game server is going down.`);
    });

    server.on("error", err => {
        if ( err.code === 'EADDRINUSE') {
            console.error(`Failed to start the internal server. PORT: ${ config.port } is already in use.`);
            console.error("Please ensure the specified port is not used by a different service or a second instance of the Brettspiel_Backend.");
            console.error("Original issue:", { err })
        } else {
            console.error("The HTTP server encountered an unspecified error", { err }, err.code);
        }
        server.close();
    });

    server.once("listening", () => {
        colyseus.attach( server );
        console.info(`Listening on ${ protocol }://${ config.host }:${ config.port }`);
    });

    server.listen(config.port);
}

run();