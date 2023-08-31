var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { createServer } = require('http');
const { getIO, initIO } = require('./socketWebRTC');
const { initVehicleSocketIO } = require('./socketIO');

const { indexRouter, setTitle } = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// fix cors error 
// NOTE: Jerry did this.
const cors = require('cors');
app.use(cors());
app.options('*', cors());
//app.get('/', (req, res) => {
//	res.send('Hello, World!');
//});
// end of cors

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const { GATEWAY, DASHBOARD } = require("./carplug_core/options");

require('dotenv').config();

const settings = {
	serverLoc  : DASHBOARD,
	serverAddr : "127.0.0.1", // localhost
	serverPort : process.env.AUTO_SYNC_SERVER_PORT,
	clientPort : process.env.AUTO_SYNC_CLIENT_PORT,
	trafficGen : false
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
	const ccu_simulator = require("./carplug_core/ccu_simulator");
	ccu_simulator.start(settings);

	// To be run on Android, disable this.
	//setTimeout(() => {
	//	const uds_ipc = require("./carplug_core/uds_ipc");
	//	uds_ipc.start();
	//}, 1000);
}
else {
	setTitle("CarPlug Server on Dashboard");
	const auto_sync_com = require("./carplug_core/auto_sync_com");
	auto_sync_com.start(settings);

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

module.exports = app;
