var express = require('express');
var router = express.Router();
const indexRouter = router;

const signalDB = require('../carplug_core/signal_db');

var title = "CarPlug Server";

function setTitle(newTitle) {
	title = newTitle;
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {
		title: title,
		numberOfBus: signalDB.getBusNum(),
		numberOfECU: signalDB.getEcuNum(),
		numberOfPDU: signalDB.getPduNum(),
		numberOfSignal: signalDB.getSignalNum(),
	});
});
	
router.post('/carplug/get', function(req, res) {
	// don't have to parse: already encoded as JS Objet
	//console.log(req.body);
	const json = req.body;
	const requestedSignals = json.signals;

	const jsonResp = {
		signals: [],
	};
	
	for (const requestedSignal of requestedSignals) {
		const signal = signalDB.getSignal(requestedSignal.name);
		if (signal != null) {
			jsonResp.signals.push({
				name  : requestedSignal.name,
				value : signal.physicalValue
			});
		}
	}
	
	res.status(200).json(jsonResp);
});

router.post('/carplug/set', function(req, res) {
	// don't have to parse: already encoded as JS Objet
	//console.log(req.body);
	const json = req.body;
	const requestedSignals = json.signals;

	const jsonResp = {
		signals: [],
	};
	
	for (const requestedSignal of requestedSignals) {
		const signal = signalDB.setSignal(requestedSignal.name, requestedSignal.value);
		if (signal != null) {
			jsonResp.signals.push({
				name  : requestedSignal.name,
				value : signal.physicalValue
			});
		}
	}
	
	res.status(200).json(jsonResp);
});


const phoneList = new Map();
var keepConnectionTimer = null;

function checkConnection() {
	for (const key of phoneList.keys()) {
		const phone = phoneList.get(key);
		if (phone.aliveCounter > 0) {
			phone.aliveCounter--;
		}
	}
}

router.get('/carplug/phone/list', function(req, res) {
	const phones = [];
	for (const key of phoneList.keys()) {
		phones.push(phoneList.get(key));
	}
	res.status(200).json({
		phones: phones,
	});
});

router.post('/carplug/phone/connect', function(req, res) {
	const json = req.body;
	if (json != null) {
		if (!phoneList.has(json.user)) {
			json['aliveCounter'] = 5;
			phoneList.set(json.user, json);
		}
		else {
			phoneList.get(json.user).aliveCounter = 5;
		}
		if (keepConnectionTimer == null) {
			keepConnectionTimer = setInterval(checkConnection, 1000);
		}
		res.status(200).json({
			os: "windows",
			osVersion: "11",
			user: "Jerry",
			model: "Model Y",
		});
	}
});

const { extraDataSet } = require("../ExtraDataSet");

router.post('/carplug/ext/set', function(req, res) {
	const json = req.body;
	if (json != null) {
		//extraDataSet.time = json.time;
		//extraDataSet.latitude = json.latitude;
		//extraDataSet.longitude = json.longitude;
		Object.keys(json).map((key) => {
			extraDataSet[key] = json[key];
		});
		res.status(200).json(extraDataSet);
	}
});

router.get('/carplug/ext/get', function(req, res) {
	res.status(200).json(extraDataSet);
});

module.exports = { indexRouter, setTitle };
