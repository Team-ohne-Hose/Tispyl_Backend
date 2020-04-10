"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var http_1 = require("http");
var colyseus_1 = require("colyseus");
var monitor_1 = require("@colyseus/monitor");
var port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
var app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
// Attach WebSocket Server on HTTP Server.
var gameServer = new colyseus_1.Server({
    server: http_1.createServer(app),
    express: app,
    pingInterval: 0,
});
// (optional) attach web monitoring panel
app.use('/colyseus', monitor_1.monitor());
gameServer.onShutdown(function () {
    console.log("game server is going down.");
});
gameServer.listen(port);
console.log("Listening on http://localhost:" + port);
