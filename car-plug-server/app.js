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

const settings = {
	serverLoc  : DASHBOARD,
	serverAddr : "127.0.0.1", // localhost
	serverPort : 41234,
	clientPort : 41235,
	trafficGen : false
}

const args = process.argv.slice(2);

if (args.length != 0) {
	const loc = args[0];
	if (loc === "gw" || loc === "GW" || loc === "CCU" || loc === GATEWAY) {
		settings.serverLoc = GATEWAY;

		if (args.length > 1) {
			const gen = args[1];
			if (gen === "on" || gen === "ON" || gen === "On") {
				settings.trafficGen = true;
			}
			else if (gen === "off" || gen === "OFF" || gen === "Off") {
				settings.trafficGen = false;
			}
		}

		setTitle("Gateway Simulator (CCU)");
		const ccu_simulator = require("./carplug_core/ccu_simulator");
		ccu_simulator.start(settings);
	
		// To be run on Android, disable this.
		//setTimeout(() => {
		//	const uds_ipc = require("./carplug_core/uds_ipc");
		//	uds_ipc.start();
		//}, 1000);
	
		// WebRTC signaling server
		const httpServer = createServer(app);
		let ioPort = process.env.PORT || 3500;
		initIO(httpServer);
		httpServer.listen(ioPort)
		console.log("WebRTC Signaling Server started on ", ioPort);
		getIO();
		// End of WebRTC
	
		const socketIOServer = createServer(app);
		initVehicleSocketIO(socketIOServer);
		socketIOServer.listen(3501);
		console.log("Vehicle Signal Socket.IO Server started on ", 3501);
	}
}

if (settings.serverLoc !== GATEWAY) {
	settings.serverLoc = DASHBOARD;

	if (args.length > 1) {
		settings.serverAddr = args[1];
	}

	setTitle("CarPlug Server on Car");
	const auto_sync_com = require("./carplug_core/auto_sync_com");
	auto_sync_com.start(settings);
}

module.exports = app;
