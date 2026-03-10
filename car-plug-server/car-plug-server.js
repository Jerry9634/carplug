#!/usr/bin/env node

/**
 * Module dependencies.
 */
import express from 'express';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import cors from 'cors'; // fix cors error
import dotenv from 'dotenv';
import debug from 'debug';
import http from 'node:http';

import { initIO as initVehicleSocketIO } from './src/socketIO.js';
import { initIO as initWebrtcSocketIO } from './src/socketWebRTC.js';


debug('car-plug-server:server');

const app = express();

// fix cors error 
// NOTE: Jerry did this.
app.use(cors());
app.options('*', cors());
// end of cors

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'public')));

dotenv.config();

// Socket IO server
const socketIOServer = http.createServer(app);
const ioPort = process.env.IO_PORT;
const coipPort = process.env.COIP_PORT;
initVehicleSocketIO(socketIOServer, coipPort);

// HTTP server
const httpServer = socketIOServer;
const httpPort = normalizePort(ioPort);
app.set('port', httpPort);
httpServer.listen(httpPort);
console.log("Socket.IO Vehicle Signal Server started on:", httpPort);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

// WebRTC signaling server
const webrtcServer = http.createServer(app);
const webrtcPort = process.env.WEBRTC_PORT;
initWebrtcSocketIO(webrtcServer);
webrtcServer.listen(webrtcPort);
console.log("WebRTC Signaling Server started on:", webrtcPort);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const portNo = parseInt(val, 10);

    if (isNaN(portNo)) {
        // named pipe
        return val;
    }

    if (portNo >= 0) {
        // port number
        return portNo;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof httpPort === 'string'
        ? 'Pipe ' + httpPort
        : 'Port ' + httpPort;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = httpServer.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
