
const https = require('https');
const fs = require('fs');
const request = require('request');

const options = {
    // Private Key
    key: fs.readFileSync('./ssl/server.key'),

    // SSL Certificate
    cert: fs.readFileSync('./ssl/server.crt'),

    // Make sure an error is not emitted on connection when the server certificate verification against the list of supplied CAs fails.
    rejectUnauthorized: false
};

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const qs = require('qs');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 9745;

const server = https.createServer(options, app);
const io = require('socket.io')(server);


 var sqlite3 = require('sqlite3');
// var db = sqlite3.Database('mirror.db');
//
// db.run("select * from sensor").then(console.log);
//
//
// // db.serialize(function() {
// //
// //     var stmt = db.prepare("INSERT INTO SENSOR VALUES ()");
// //
// //     stmt.finalize();
// //
// //     db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
// //         console.log(row.id + ": " + row.info);
// //     });
// // });
//
// db.close();

//================================================================================
// Weather
// Open Weather
//================================================================================

const weather = require("Openweather-Node");
weather.setAPPID("fc95ca7a3fa739623373a2c2a9fe1198");
weather.setCulture("ie");
// weather.setForecastType("daily");

const currentWeather = function() {
    try{
        weather.now("DublinCity", function (err, aData) {
            io.emit('weather', { message: aData});
        });
    }
    catch(err) {
        console.log(err.message);
        return 1;
    }
    // WeatherForeCast();
}
setInterval(currentWeather, 5000)

const WeatherForeCast = function(){
    try{
        weather.forecast("DublinCity", function (err, aData) {
            console.log(aData);

            //io.emit('weather', { message: aData});
        });
    }
    catch(err) {
        console.log(err.message);
        return 1;
    }
}



//================================================================================
// Wake Word and Voice Activity Detection
//================================================================================
const record = require('node-record-lpcm16');
const Detector = require('./node_modules/snowboy').Detector;
const Models = require('./node_modules/snowboy').Models;
const models = new Models();

var self = this;
this.listening = false;
this.mirrorListening = false;
this.timeout = null;
this.mirrorTimeout =null;

this._clearTimeout = function(){
    if(self.timeout){
        clearTimeout(self.timeout);
    }
};

this._onVoiceStop = function(){
    if(self.listening){
        self.listening = false;
        self._clearTimeout();
        io.emit('silence', { message: "silence"});
    }
    else if(self.mirrorListening)
    {
        self.mirrorListening = false;
        if(self.mirrorTimeout) {
            clearTimeout(self.mirrorTimeout);
        }
        io.emit('silence', { message: "silence"});
    }
}

models.add({
    file: 'resources/mirrormirroronthewall.pmdl',
    sensitivity: '0.5',
    hotwords : 'mirror mirror'
});
models.add({
    file: 'resources/alexa.umdl',
    sensitivity: '0.5',
    hotwords : 'alexa'
});
models.add({
    file: 'resources/mirror.pmdl',
    sensitivity: '0.5',
    hotwords : 'mirror'
});
models.add({
    file: 'resources/snowboy.umdl',
    sensitivity: '0.5',
    hotwords : 'mirror'
});
models.add({
    file: 'resources/Wakeup.pmdl',
    sensitivity: '0.5',
    hotwords : 'wake up'
});
models.add({
    file: 'resources/turnonkitchenlight.pmdl',
    sensitivity: '0.5',
    hotwords : 'kitchen light on'
});
models.add({
    file: 'resources/turnoffkitchenlight.pmdl',
    sensitivity: '0.5',
    hotwords : 'kitchen light off'
});
models.add({
    file: 'resources/turnonlamp.pmdl',
    sensitivity: '0.5',
    hotwords : 'lamp on'
});
models.add({
    file: 'resources/turnofflamp.pmdl',
    sensitivity: '0.5',
    hotwords : 'lamp off'
});


const detector = new Detector({
    resource: "resources/common.res",
    models: models,
    audioGain: 0.0
});

detector.on('silence', function () {

    if(self.listening)
    {
        self.timeout = setTimeout(function(){
            self._onVoiceStop();
            //console.log("timeout");

        }, 3000);
    }
     // console.log('silence');
});

detector.on('sound', function () {
    if(self.listening)
    {
        self._clearTimeout();
    }
     // console.log('sound');
});

detector.on('error', function () {
    console.log('error');
});

detector.on('hotword', function (index, hotword) {
    console.log('hotword', index, hotword);

    if(hotword =="mirror")
    {
        io.emit('mirror', { message: "mirror"});

        self.mirrorListening = true;
        self.mirrorTimeout = setTimeout(function(){
            self._onVoiceStop();
        }, 3000);
    }

    if(self.mirrorListening) {

        if (hotword == "lamp on") {
            hue.light(1).on();
            hueStatus();
        }
        else if (hotword == "lamp off") {
            hue.light(1).off();
            hueStatus();
        }
    }

    if(hotword == "stop")
    {
        io.emit('stop', {message: "stop"});
    }

    if(hotword == "alexa")
    {
        self.listening = true;
        io.emit('alexa', { message: "alexa"});
    }

    if(hotword == "mirror mirror")
    {
        io.emit('mirrormirror',{message: "mirrormirror"});
    }
});

const mic = record.start({
    threshold: 0,
    verbose: false
});

mic.pipe(detector);


//================================================================================
// HUE
//================================================================================
var Hue = require('philips-hue');

var hue = new Hue;
hue.devicetype = 'my-hue-app';

// hue.getBridges()
//     .then(function(bridges){
//         console.log(bridges);
//         var bridge = bridges[0];
//         console.log("bridge: "+bridge);
//         return hue.auth(bridge);
//     })
//     .then(function(username){
//         console.log("username: "+username);
//         hue.light(1).on();
//     })
//     .catch(function(err){
//         console.error(err.stack || err);
//     });

var hue = new Hue;
hue.bridge = "192.168.1.105";
hue.username = "0a3aLBQJGtbsjSmqYOFmFyEMcr350cY5c3ZIQVlr";
console.log(hue);


const hueStatus = function() {
    try{
        hue.getLights()
            .then(function(lights){
                // console.log(lights);

                io.emit('hue', { data: lights});

                // for( x in lights)
                // {
                //     console.log(lights[x].state.on);
                // }

            })
            .catch(function(err){
                console.error(err.stack || err);
            });
    }
    catch(err) {
        console.log(err.message);
        return 1;
    }
}
setInterval(hueStatus, 10000);


//================================================================================
// Nest
//================================================================================


const nestStatus = function() {
    nestApi.login(function(data) {
        nestApi.get(function (data) {
             // console.log(data);
            var shared = data.shared[Object.keys(data.schedule)[0]];
            io.emit('nest', {data: shared});

            // console.log('Currently ' + shared.current_temperature + ' degrees celcius');
            // console.log('Target is ' + shared.target_temperature + ' degrees celcius');
        });
    });
}

//NEST
var NestApi = require('nest-api');
var nestApi = new NestApi('soh002@gmail.com', '$1xB6fNU');

nestApi.login(function(data) {

    nestApi.get(function (data) {
        var shared = data.shared[Object.keys(data.schedule)[0]];
        io.emit('nest', {data: data});
        setInterval(nestStatus, 30000);
    });
});

//================================================================================
// TP-LINK KASA
//================================================================================
const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
const plugs = [];
var plugsInfo =[];
const plugOne = client.getPlug({host: '192.168.1.100',port: '9999'});
const plugTwo = client.getPlug({host: '192.168.1.101',port: '9999'});

var info = plugOne.getInfo("123123",function (data) {
    console.log(data);
});

// plugs.push(plugOne);
// plugs.push(plugTwo);


// const plugStatus = function () {
//
//     plugsInfo = [];
//     // console.log(plugs);
//
//     for(plug in plugs) {
//         // console.log("SETSETASDFA");
//         // console.log(plugs[plug]);
//
//         // plugs[plug].getInfo().then(console.log);
//
//         // plugs[plug].setPowerState(true);
//         // plugs[0].getInfo(function (data) {
//         //     console.log(data);
//         //     plugsInfo.push(data);
//         // });
//     }
//     // console.log(plugsInfo);
// }

// setInterval(plugStatus, 10000);

// console.log(plugs);
// plugs[1].getInfo().then(console.log);
// plug.getInfo().then(console.log);
// //console.log(plug);
// plug.setPowerState(false);

// DISCOVERY Look for plugs, log to console, and turn them on
// client.startDiscovery().on('plug-new', (plug) => {
//     plug.getInfo().then(console.log);
//     plugs.push(plug);
//     plug.setPowerState(false);
//     console.log(plugs);
// });



//================================================================================
// Server
//================================================================================

app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json());
app.use(cors());

app.use('/', express.static(__dirname));

app.get('/authresponse', (req, res) => {
    res.redirect(301, `/?${qs.stringify(req.query)}`);
});

app.post('/audio', upload.single('data'), (req, res) => {
    res.json(req.file);
});

app.get('/parse-m3u', (req, res) => {
    const m3uUrl = req.query.url;
    console.log(m3uUrl);

    if (!m3uUrl) {
        return res.json([]);
    }

    const urls = [];
    request(m3uUrl, function(error, response, bodyResponse) {
        console.log(bodyResponse, m3uUrl);
        if (bodyResponse) {
            urls.push(bodyResponse);
        }
        res.json(urls);
    });
});


server.listen(port, "0.0.0.0", function() {
    console.log('server up and running at %s port', port);
});


module.exports = app;