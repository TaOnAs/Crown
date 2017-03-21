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

setInterval(currentWeather, 1000);


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
    file: 'resources/alexa.umdl',
    sensitivity: '1',
    hotwords : 'mirror'
});

const detector = new Detector({
    resource: "resources/common.res",
    models: models,
    audioGain: 0.0
});

detector.on('silence', function () {
    console.log(self.listening);
    if(self.listening)
    {
        self.timeout = setTimeout(function(){
            console.log("timeout");
            self._onVoiceStop();
        }, 3000);
    }
    console.log('silence');
});

detector.on('sound', function () {
    if(self.listening)
    {
        self._clearTimeout();
    }
    console.log('sound');
});

detector.on('error', function () {
    console.log('error');
});

detector.on('hotword', function (index, hotword) {
    console.log('hotword', index, hotword);
    self.listening = true;
    console.log(self.listening);
    io.emit('alexa', { message: "alexa"});

});

const mic = record.start({
    threshold: 0,
    verbose: true
});

mic.pipe(detector);








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
io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });

    socket.on('i am client', console.log);
});





server.listen(port, "0.0.0.0", function() {
    console.log('server up and running at %s port', port);
});


module.exports = app;