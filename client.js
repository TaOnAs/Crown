/**
 * Created by Mark on 18/03/2017.
 */
var socket = io();

socket.on('welcome', function(data) {
    addMessage(data.message);

    // Respond with a message including this clients' id sent from the server
    socket.emit('i am client', {data: 'foo!', id: data.id});
});
socket.on('weather', function(data) {
    weather(data.message);
    // addMessage(data.message.temp);
});

socket.on('error', console.error.bind(console));
socket.on('message', console.log.bind(console));

function addMessage(message) {
    var location = document.getElementById('location');
    var text = document.createTextNode(message),
        el = document.createElement('li'),
        messages = document.getElementById('messages');

    el.appendChild(text);
    location.appendChild(el);
}


function weather(data){

    if(document.getElementById("temperature") === null)
    {
        var wrapper = document.createElement("div");

        var large = document.createElement("div");
        large.className = "large light";

        // var weatherIcon = document.createElement("span");
        // weatherIcon.className = "wi weathericon " + this.weatherType;
        // large.appendChild(weatherIcon);

        var temperature = document.createElement("span");
        temperature.className = "bright";
        temperature.id = "temperature";
        temperature.innerHTML = " " + roundValue(data.temp) + "&deg;";
        large.appendChild(temperature);

        wrapper.appendChild(large);
        document.getElementById("weather").appendChild(wrapper);
    }
    else
    {
        var temperature = document.getElementById("temperature");
        temperature.innerHTML = " " + roundValue(data.temp) + "&deg;";
    }

    return wrapper;
}

function roundValue(temperature) {
    const decimals = 0;
    return parseFloat(temperature).toFixed(decimals);
}