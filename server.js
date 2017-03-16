
var express = require('express');
var app = require("express")();

var bodyParser = require('body-parser');
var cors = require('cors');
var qs = require('qs');
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var http = require("http").Server(app);
const https = require('https');

var fs = require('fs');
var request = require('request');


var port = 9745;

const options = {
    key: fs.readFileSync('./ssl/server.key'),

    cert: fs.readFileSync('./ssl/server.crt'),

    rejectUnauthorized: false
};

var Server = function(callback) {

    https.createServer(options, app).listen(port, () => {
        console.log(`Express server listening on port ${port}`);
    });

    app.use(bodyParser.urlencoded({extended: true}));
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

        request(m3uUrl, function (error, response, bodyResponse) {
            console.log(bodyResponse, m3uUrl);
            if (bodyResponse) {
                urls.push(bodyResponse);
            }

            res.json(urls);
        });
    });

};

module.exports = Server;
