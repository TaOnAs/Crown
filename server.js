// const Weather = require(__dirname + '/weather.js');

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


//WEATHER

//OPEN WEATHER
this.openWeather = true;

if(this.openWeather)
{
    const weather = require("Openweather-Node");
    weather.setAPPID("fc95ca7a3fa739623373a2c2a9fe1198");
    weather.setCulture("ie");
    weather.setForecastType("daily");

    const currentWeather = function() {
        try{
            weather.now("DublinCity", function (err, aData) {
                io.emit('weather', { message: aData.getDegreeTemp()});
            });
        }
        catch(err) {
            console.log(err.message);
            return 1;
        }
    }
    setInterval(currentWeather, 5000);
}
else
{
    const accuweather = require('node-accuweather')()("ANQd9hWkrIvl0DXh8Xl2fIGQvh5unJIF");

    accuweather.getCurrentConditions("Dublin")
        .then(function(result) {
            console.log(result);
        });
}



//ACCUWEATHER


//WAKE WORD
const record = require('node-record-lpcm16');
const Detector = require('./node_modules/snowboy').Detector;
const Models = require('./node_modules/snowboy').Models;
const models = new Models();

var self = this;
this.listening = false;
this.timeout = null;

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
}

models.add({
    file: 'resources/mirror.pmdl',
    sensitivity: '0.5',
    hotwords : 'alexa'
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
    self.listening = true;


    io.emit('alexa', { message: "alexa"});

});

const mic = record.start({
    threshold: 0,
    verbose: false
});

mic.pipe(detector);


//Philips Hue
var Hue = require('philips-hue');
//var Hue = require('../');

// var hue = new Hue;
// hue.devicetype = 'my-hue-app';
//
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
// hue.light(1).off();


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
setInterval(hueStatus, 30000);


const nestStatus = function() {
    nestApi.login(function(data) {

        nestApi.get(function (data) {
            console.log(data);
            var shared = data.shared[Object.keys(data.schedule)[0]];
            // console.log(data.shared);
            io.emit('nest', {data: shared});

            console.log('Currently ' + shared.current_temperature + ' degrees celcius');
            console.log('Target is ' + shared.target_temperature + ' degrees celcius');
        });
    });
}

//NEST
var NestApi = require('nest-api');
var nestApi = new NestApi('soh002@gmail.com', '$1xB6fNU');

nestApi.login(function(data) {
    console.log("logged in");
    // console.log(data);
    nestApi.get(function (data) {
        console.log(data);
        var shared = data.shared[Object.keys(data.schedule)[0]];
        // console.log(data.shared);
        io.emit('nest', {data: shared});

        console.log('Currently ' + shared.current_temperature + ' degrees celcius');
        console.log('Target is ' + shared.target_temperature + ' degrees celcius');
        setInterval(nestStatus, 30000);

    });

    // nestApi.get(function(data) {
    //     var shared = data.shared[Object.keys(data.schedule)[0]];
    //     // console.log(data.shared);
    //     console.log('Currently ' + shared.current_temperature + ' degrees celcius');
    //     console.log('Target is ' + shared.target_temperature + ' degrees celcius');
    // });
});



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



// Emit welcome message on connection
// io.on('connection', function(socket) {
//     // Use socket to communicate with this particular client only, sending it it's own id
//     socket.emit('welcome', { message: 'Welcome!', id: socket.id });
//
//     socket.on('i am client', console.log);
// });





server.listen(port, "0.0.0.0", function() {
    console.log('server up and running at %s port', port);
});


module.exports = app;