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

const weather = require("Openweather-Node");
weather.setAPPID("fc95ca7a3fa739623373a2c2a9fe1198");
weather.setCulture("ie");
weather.setForecastType("daily");


const currentWeather = function() {

    try{
        weather.now("Dublin", function (err, aData) {

            console.log(aData.getDegreeTemp());
            io.emit('time', { message: aData.getDegreeTemp()});

            // if (err) console.log(err);
            // else {
            //     this.temp = null;
            //
            //     var data = aData.getDegreeTemp();
            //
            //     console.log(roundValue(data.temp) + " Degrees");
            //     console.log(data.temp_min);
            //     console.log(data.temp_max);
            //     console.log(data);
            //
            //     return data;
            //     // console.log(temp);
            // }
        });
    }
    catch(err) {
        console.log(err.message);
        return 1;
    }

}

function roundValue(temperature) {
    const decimals = 0;
    return parseFloat(temperature).toFixed(decimals);
}








setInterval(currentWeather, 1000);








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

function sendTime() {
    io.emit('time', { message: currentWeather()});
}


// Send current time every 10 secs
//setInterval(sendTime, 1000);

// Emit welcome message on connection
io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', { message: 'Welcome!', id: socket.id });

    socket.on('i am client', console.log);
});




server.listen(port, function() {
    console.log('server up and running at %s port', port);
});


module.exports = app;