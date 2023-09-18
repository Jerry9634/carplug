import createError from 'http-errors';
import express, { json, urlencoded, static as _static } from 'express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import path from 'path'; // CommonJS to ES
import dotenv from 'dotenv'; // CommonJS to ES

import cors from 'cors'; // fix cors error 
import { createServer } from 'http';

import { indexRouter, setTitle } from "./routes/index.js";
import usersRouter from "./routes/users.js";

import { GATEWAY, DASHBOARD } from "./carplug_core/options.js";

import { start as ccu_simulator_start } from "./carplug_core/ccu_simulator.js";
import { start as auto_sync_com_start } from "./carplug_core/auto_sync_com.js";
import { 
	start_server as ups_ipc_start_server,  
	start_client as ups_ipc_start_client
} from "./carplug_core/uds_ipc.js";

import { getIO, initIO } from "./carplug_ext/socketWebRTC.js";
import { initVehicleSocketIO } from "./carplug_ext/socketIO.js";


const app = express();

export function app_start() {
	// fix cors error 
	// NOTE: Jerry did this.
	app.use(cors());
	app.options('*', cors());
	// end of cors

	const __dirname = path.resolve();  // CommonJS to ES

	// view engine setup
	app.set('views', join(__dirname, 'views'));
	app.set('view engine', 'jade');

	app.use(logger('dev'));
	app.use(json());
	app.use(urlencoded({ extended: false }));
	app.use(cookieParser());
	app.use(_static(join(__dirname, 'public')));

	app.use('/', indexRouter);
	app.use('/users', usersRouter);

	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		next(createError(404));
	});

	// error handler
	app.use(function (err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.render('error');
	});


	dotenv.config();

	const settings = {
		serverLoc: DASHBOARD,
		serverAddr: "127.0.0.1", // localhost
		serverPort: process.env.AUTO_SYNC_SERVER_PORT,
		clientPort: process.env.AUTO_SYNC_CLIENT_PORT,
		trafficGen: false
	}

	const args = process.argv.slice(2);

	if (args.length != 0) {
		const loc = args[0].toLowerCase();
		if (loc === "gw" || loc === "ccu" || loc === GATEWAY) {
			settings.serverLoc = GATEWAY;

			if (args.length > 1) {
				const gen = args[1].toLowerCase();
				if (gen === "on") {
					settings.trafficGen = true;
				}
			}
		}
		else {
			settings.serverAddr = args[0];
		}
	}

	if (settings.serverLoc === GATEWAY) {
		setTitle("CarPlug Server on Gateway (CCU)");
		ccu_simulator_start(settings);

		// To be run on Android, disable this.
		ups_ipc_start_client();
		setTimeout(() => {
			ups_ipc_start_server();
		}, 1000);
	}
	else {
		setTitle("CarPlug Server on Dashboard");
		auto_sync_com_start(settings);

		// Socket IO server
		const socketIOServer = createServer(app);
		const ioPort = process.env.IO_PORT;
		initVehicleSocketIO(socketIOServer);
		socketIOServer.listen(ioPort);
		console.log("Socket.IO Vehicle Signal Server started on:", ioPort);

		// WebRTC signaling server
		const webrtcServer = createServer(app);
		const webrtcPort = process.env.WEBRTC_PORT;
		initIO(webrtcServer);
		webrtcServer.listen(webrtcPort)
		console.log("WebRTC Signaling Server started on:", webrtcPort);
		getIO();
	}
}


export default app;