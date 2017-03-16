/**
 * Created by Mark on 09/03/2017.
 */

const weather = require("Openweather-Node");
weather.setAPPID("fc95ca7a3fa739623373a2c2a9fe1198");
weather.setCulture("ie");
weather.setForecastType("daily");


var Weather = function(callback) {


weather.now("Dublin", function (err, aData) {
    if (err) console.log(err);
    else {
        this.temp = null;

        var data = aData.getDegreeTemp();

        console.log(roundValue(data.temp) + " Degrees");
        console.log(data.temp_min);
        console.log(data.temp_max);


        // console.log(temp);
    }
    start_weather(data)

});


}

function start_weather(temp) {

    console.log(temp);
    var wrapper = document.createElement("div");
    var weatherWrapper = document.createElement("div");
    weatherWrapper.className = "bright large light";
    weatherWrapper.id = "timeWrapper";

    weatherWrapper.innerHTML = aData.getDegreeTemp();

    wrapper.appendChild(weatherWrapper);
    document.getElementById("weather").appendChild(wrapper);
 }




function roundValue(temperature) {
    const decimals = 0;
    return parseFloat(temperature).toFixed(decimals);
}

module.exports = Weather;

