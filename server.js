
const https = require('https');
const fs = require('fs');
const request = require('request');

const options = {
    // Private Key
    key: fs.readFileSync('./ssl/server.key'),

    // SSL Certificate
    cert: fs.readFileSync('./ssl/server.crt'),

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


//================================================================================
// Database
//================================================================================

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./mirror.db');


function insertToDb(temp, humidity, source){
    db.serialize(function() {

        db.run("CREATE TABLE if not exists sensor_info (temp, humidity, source, time)");
        var stmt = db.prepare("INSERT INTO sensor_info VALUES (?, ?, ?, ?)");
        stmt.run(temp,humidity,source, new Date());
        stmt.finalize();

        db.each("SELECT * FROM sensor_info", function(err, row) {
            // console.log(row);
        });
    });
}



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
        io.emit('mirrorsilence', { message: "silence"});
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
    file: 'resources/crown.pmdl',
    sensitivity: '0.5',
    hotwords : 'mirror'
});
models.add({
    file: 'resources/Wakeup.pmdl',
    sensitivity: '0.5',
    hotwords : 'wake up'
});
// models.add({
//     file: 'resources/turnonlamp.pmdl',
//     sensitivity: '0.5',
//     hotwords : 'lamp on'
// });
// models.add({
//     file: 'resources/turnofflamp.pmdl',
//     sensitivity: '0.5',
//     hotwords : 'lamp off'
// });
models.add({
    file: 'resources/turnoffplug.pmdl',
    sensitivity: '0.5',
    hotwords : 'plug off'
});

models.add({
    file: 'resources/enableplug.pmdl',
    sensitivity: '0.5',
    hotwords : 'plug on'
});
models.add({
    file: 'resources/togglelamp.pmdl',
    sensitivity: '0.5',
    hotwords : 'Lamp'
});
models.add({
    file: 'resources/togglelivingroom.pmdl',
    sensitivity: '0.5',
    hotwords : 'Living Room'
});
models.add({
    file: 'resources/toggleplug.pmdl',
    sensitivity: '0.5',
    hotwords : 'Plug'
});models.add({
    file: 'resources/togglekettle.pmdl',
    sensitivity: '0.5',
    hotwords : 'Kettle'
});
models.add({
    file: 'resources/whatcanisay.pmdl',
    sensitivity: '0.5',
    hotwords : 'Help'
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
        else if (hotword == "plug on") {
            plugOne.setPowerState(true);
            plugStatus(plugOne);
        }
        else if (hotword == "plug off") {
            plugOne.setPowerState(false);
            plugStatus(plugOne);
        }
        else if (hotword == "Lamp")
        {
            toggleLight(hotword);
            hueStatus();
        }
        else if (hotword == "Living Room")
        {
            toggleLight(hotword);
            hueStatus();
        }
        else if (hotword == "Plug")
        {
            togglePlug(hotword);
        }
        else if (hotword == "Kettle")
        {
            togglePlug(hotword);
        }
        else if (hotword =="Help")
        {
            io.emit("help");
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

hue.getBridges()
    .then(function(bridges){
        console.log(bridges);
        var bridge = bridges[0];
        console.log("bridge: "+bridge);
        hue.bridge = bridge;
        return hue.auth(bridge);
    })
    .then(function(username){
        console.log("username: "+username);
        hue.username = username;
        hue.light(1).on();
    })
    .catch(function(err){
        console.error(err.stack || err);
    });

// var hue = new Hue;
// hue.bridge = "192.168.1.105";
// hue.username = "0a3aLBQJGtbsjSmqYOFmFyEMcr350cY5c3ZIQVlr";
// hue.bridge = "192.168.1.100";
// hue.username = "oDK2bk8zUVFmLAWMjNVo6nHgzmVbus5WKqnA-xVk";

const hueStatus = function() {
    try{
        hue.getLights()
            .then(function(lights){
                io.emit('hue', { data: lights});
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

const toggleLight = function(target) {
    try {
        hue.getLights()
            .then(function (lights) {

                for (const x in lights) {
                    if (lights[x].name == target) {
                        if (lights[x].state.on) {
                            hue.light(x).off();
                            hueStatus();
                        }
                        else {
                            hue.light(x).on();
                            hueStatus();
                        }
                    }
                }
            })
            .catch(function (err) {
                console.error(err.stack || err);
            });
    }
    catch (err) {
        console.log(err.message);
        return 1;
    }
}


io.on('connection', function(socket) {

    socket.on('lightOn', function (data) {

        hue.getLights()
            .then(function (lights) {
                console.log(data.data);
                if (lights[data.data].state.on) {
                    hue.light(data.data).off();
                    hueStatus();
                }
                else {
                    hue.light(data.data).on();
                    hueStatus();
                }
            });
    });


    socket.on('plugOn', function (data) {
        console.log(data.data);
        togglePlug(data.data);
    });
});



//================================================================================
// Nest
//================================================================================


const nestStatus = function() {
    try{
        nestApi.login(function(data) {

            nestApi.get(function (data) {
                // console.log(data);
                io.emit('nest', {data: data});

                // console.log('Currently ' + shared.current_temperature + ' degrees celcius');
                // console.log('Target is ' + shared.target_temperature + ' degrees celcius');
            });
        });
    }
    catch (err){
        console.log(err);
    }

}

//NEST
var NestApi = require('nest-api');
var nestApi = new NestApi('soh002@gmail.com', '$1xB6fNU');

nestApi.login(function(data) {

    try{
        nestApi.get(function (data) {
            io.emit('nest', {data: data});
            var temp = data.shared[Object.keys(data.schedule)[0]].current_temperature;
            var humidity = data.device[Object.keys(data.schedule)[0]].current_humidity;
            insertToDb(temp, humidity, "Nest - Living Room");
            setInterval(nestStatus, 30000);
        });

    }
    catch (err){
        console.log(err);
    }
});




//================================================================================
// TP-LINK KASA
//================================================================================
const Hs100Api = require('hs100-api');

const client = new Hs100Api.Client();
const plugs = [];

const plugStatus = function () {

    for(plug in plugs)
    {
        plugs[plug].getInfo().then(function(data){
            io.emit("plugFound", {data: data});
        });
    }
}

const togglePlug = function(plugName){
    for(plug in plugs){
        var alias = plugs[plug].sysInfo.alias;
        var state = (plugs[plug].sysInfo.relay_state === 1);

        console.log(state);
        console.log(alias);

        if(alias == plugName)
        {
            if(state)
            {
                plugs[plug].setPowerState(false);
                plugs[plug].sysInfo.relay_state = 0;
                plugStatus();
            }
            else
            {
                plugs[plug].sysInfo.relay_state = 0;
                plugs[plug].setPowerState(true);
                plugStatus();
            }
        }
    }
}

var plugStatusStarted = false;

client.startDiscovery().on('plug-new', (plug) => {
    plug.getInfo().then(function(data){
        io.emit("plugFound", {data: data});
    });
    plugs.push(plug);

    if (!plugStatusStarted)
    {
        plugStatusStarted = true;
        setInterval(plugStatus, 10000);
    }
});


//================================================================================
// Serial Port DHT22 SENSOR
//================================================================================
// try{
//     var SerialPort = require("serialport");
//     var serialport = new SerialPort("/dev/cu.usbmodem1421", {
//         baudRate: 9600
//     });
//     serialport.on('open', function(){
//         console.log('Serial Port Opened');
//         serialport.on('data', function(data){
//             console.log(data);
//         });
//     });
// }
// catch (error)
// {
//     console.log(error);
// }




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