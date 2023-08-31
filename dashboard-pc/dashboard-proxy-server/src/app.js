const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const middlewares = require('./middlewares');
//const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
    ip: serverAddress
  });
});

app.get('/kor-radio/openapi.do?', async (req, res) => {
  searchRadioStations(req.url, (error, data) => {
    if (error) {
      res.send(error);
    } else {
      res.send(data);
    }
  });
});

app.get('/*.pls', async (req, res) => {
  searchRadioStreamingURLs(req.url, (error, data) => {
    if (error) {
      res.send(error);
    } else {
      res.send(data);
    }
  });
});

const fetch = require('node-fetch');

const searchRadioStations = async (url, callback) => {
  var newURL = String(url).replace("/kor-radio", "https://www.spectrummap.kr");
  //console.log(newURL);
  await fetch(newURL,{method: 'GET'})
    .then((res)=>res.text())
    .then((data)=>{ 
      callback(undefined, data);
    })
    .catch((error) => {
    callback(error);
  });
}

const searchRadioStreamingURLs = async (url, callback) => {
  var newURL = String(url);
  if (newURL.includes("/internet-radio")) {
    newURL = newURL.replace("/internet-radio", "http://serpent0.duckdns.org:8088");
  }
  else {
    //newURL = "http://wsdownload.bbc.co.uk" + newURL;
    newURL = "http://open.live.bbc.co.uk" + newURL;
  }
  //console.log(newURL);
  await fetch(newURL,{method: 'GET'})
    .then((res)=>res.text())
    .then((data)=>{ 
      //console.log(data);
      callback(undefined, data);
    })
    .catch((error) => {
    callback(error);
  });
}

//app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const dgram = require('node:dgram');
const { Buffer } = require('node:buffer');
const udpClient = dgram.createSocket('udp4');

var serverAddress = null;

function findServerIP() {
  const message = Buffer.from("Hello!");

  udpClient.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    udpClient.close();
  });
  
  udpClient.on('listening', () => {
    udpClient.setBroadcast(true);
    const address = udpClient.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });
  
  udpClient.bind(process.env.AUTO_SYNC_SERVER_PORT);
  
  udpClient.send(message, process.env.AUTO_SYNC_CLIENT_PORT, "255.255.255.255", (err) => {
    if (err != null) {
      console.log(err);
    }
  });
  
  udpClient.on('message', (msg, rinfo) => {
    if (msg.length > 0) {
      //console.log(rinfo.address);
      serverAddress = rinfo.address;
    }
  });
}

function getServerIP() {
  return serverAddress;
}

module.exports = {
  app,
  findServerIP,
  getServerIP
};
