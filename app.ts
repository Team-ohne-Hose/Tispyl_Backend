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
import {ErrorHandler} from "./ErrorHandler";

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
    console.log('Selected the production environment. This is tailored to be used on the uberspace setup.');
} else if (argv.env === 'dev') {
    config = backendConfigDev;
    console.log('Selected the development environment. Only use this environment on local setups.');
} else {
    console.error('No environment was selected. The script will exit now.');
    process.exit(-1);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach WebSocket Server on HTTPS Server.
let internalServer;
let serverProtocol;
if (argv.env === 'prod') {
    serverProtocol = 'https';
    internalServer = createHttpsServer({
        key: fs.readFileSync(backendConfig.tlsKey),
        cert: fs.readFileSync(backendConfig.tlsCert)
    }, app);
} else if (argv.env === 'dev') {
    serverProtocol = 'http';
    internalServer = createHttpServer(app);
}

const gameServer = new Server({
    server: internalServer,
    express: app,
    pingInterval: 0,
});

gameServer.define('game', GameRoom);

// Logging
app.use((req: Request, res, next) => {
    const now = new Date(Date.now()).toLocaleTimeString();
    const queries = JSON.stringify(req.query);
    const params = JSON.stringify(req.params);
    const body = JSON.stringify(req.body);
    console.log(`[${now}][HTTP] Got: ${req.method} at ${req.originalUrl} with query: ${queries} params: ${params} body ${body}`);
    next();
});

// Routing
app.use('/colyseus', monitor());
app.use('/api', new ApiRouter(config).router);
app.use('/', (req, res, next) => {
    res.sendFile(__dirname + "/views/index.html")
});

// Error handling
app.use(ErrorHandler.logErrors);
app.use(ErrorHandler.handleKnownError);
app.use(ErrorHandler.handleUnexpectedError);

gameServer.onShutdown(function(){
    console.log(`game server is going down.`);
});

gameServer.listen(config.port, config.host);
console.log(`Listening on ${ serverProtocol }://${ config.host }:${ config.port }`);
