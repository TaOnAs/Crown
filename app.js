/**
 * Created by Mark on 23/02/2017.
 */

var fs = require("fs");
var Server = require(__dirname + "/server.js");
var Weather = require(__dirname + "/weather.js");
// var Alexa = require(__dirname + "/alexa.js");
var path = require("path");



var App = function()
{

    this.start = function(callback){

        var server = new Server( function(){
            console.log("Server Started")
        });

        // var alexa = new Alexa( function(){
        //     console.log("Alexa Started")
        // });

        var weather = new Weather( function(){
            console.log("Weather Started")
        });
    }
};

module.exports = new App();
