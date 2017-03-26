/**
 * Created by Mark on 18/03/2017.
 */
var socket = io();


socket.on('hue', function(data) {


    var lights = data.data;
    for(x in lights)
    {
        if (lights[x].state.on)
        {
            console.log(lights[x].name + " on")
        }
        else
            {
            console.log(lights[x].name + " off")
        }
    }
});

socket.on('nest', function(data) {

    nest(data);

});

function nest(data){

    var heatingClass = null;
    var heatingIcon = null;
    if(data.data.current_temperature < data.data.target_temperature)
    {
        heatingClass = "xsmall light nestHeating";
        heatingIcon = "fa fa-thermometer-three-quarters animated pulse infinite xsmall nestHeating";
    }
    else
    {
        heatingClass = "xsmall dimmed light";
        heatingIcon = "";
    }

    if(document.getElementById("nestWrapper"))
    {
        var nestWrapper = document.getElementById("nestWrapper");

        var nestCurrentTemp = document.getElementById("nestCurrentTemp");
        var nestTargetTemp = document.getElementById("nestTargetTemp");
        var nestIcon = document.getElementById("nestIcon");

        nestCurrentTemp.className = heatingClass;
        nestIcon.className = heatingIcon;

        nestCurrentTemp.innerHTML = "Nest Current : " + roundValue(data.data.current_temperature,1) + "&deg      ";
        nestTargetTemp.innerHTML = "Current : " + roundValue(data.data.target_temperature,1) + "&deg";

    }
    else
    {
        var nestWrapper = document.createElement("div");
        nestWrapper.id = "nestWrapper";

        var nestTitle = document.createElement("div");
        nestTitle.id = "nestTitle";
        nestTitle.className = "dimmed xsmall light";
        nestTitle.innerHTML = "Nest - Living Room"

        var nestIcon = document.createElement("i");
        nestIcon.id = "nestIcon";
        nestIcon.className = heatingIcon;


        var nestCurrentTemp = document.createElement("span");
        var nestTargetTemp = document.createElement("span");
        nestCurrentTemp.id = "nestCurrentTemp";
        nestCurrentTemp.className = heatingClass;
        nestTargetTemp.id = "nestTargetTemp";
        nestTargetTemp.className = "dimmed xsmall light";

        nestCurrentTemp.innerHTML = "Current : " + roundValue(data.data.current_temperature,1) + "&deg ";
        nestTargetTemp.innerHTML = "     Target : " + roundValue(data.data.target_temperature,1) + "&deg";

        nestWrapper.appendChild(nestTitle);
        nestWrapper.appendChild(nestCurrentTemp);
        nestWrapper.appendChild(nestIcon);
        nestWrapper.appendChild(nestTargetTemp);

        document.getElementById("nest").appendChild(nestWrapper);
    }
}





socket.on('alexa', function(data) {
    listening();
});

socket.on('silence', function(data) {
    notListening();
});

function listening()
{
    var recordingIcon = document.getElementById("recordingIcon");
    recordingIcon.hidden = false;
}

function notListening()
{
    var recordingIcon = document.getElementById("recordingIcon");
    recordingIcon.hidden = true;
}



socket.on('weather', function(data) {
    weather(data.message);
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
        temperature.innerHTML = " " + roundValue(data.temp,0) + "&deg;";
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


function roundValue(temperature, decimal) {
    const decimals = decimal;
    return parseFloat(temperature).toFixed(decimals);
}