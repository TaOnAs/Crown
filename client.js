/**
 * Created by Mark on 18/03/2017.
 */
var socket = io();


//================================================================================
// HUE
//================================================================================

socket.on('hue', function(data) {


    var lights = data.data;
    hueStatus(lights);
    console.log(lights);
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

function hueStatus(lights) {

    var hueWrapper = null;
    var created = false;
    var lightClassOn = "fa fa-lightbulb-o medium bright animated pulse infinite";
    var lightClassOff = "fa fa-lightbulb-o medium dimmed";
    var lightClassUnreachable = "fa fa-times-circle xsmall dimmed";

    var lightNameClassOn = "xsmall bright regular";
    var lightNameClassOff = "xsmall dimmed regular";

    var currentLight;

    if(document.getElementById("hueWrapper"))
    {
        hueWrapper = document.getElementById("hueWrapper");
    }
    else
    {
        hueWrapper = document.createElement("div");
        hueWrapper.className = "align-left";
        hueWrapper.id = "hueWrapper";
    }

    for(light in lights)
    {
        if(document.getElementById(lights[light].name+"wrapper"))
        {
            var lightName = document.getElementById(lights[light].name);
            var lightIcon = document.getElementById(lights[light].name + "Icon");

            if(lights[light].state.on)
            {
                lightIcon.className = lightClassOn;
                lightName.className = lightNameClassOn;
            }
            else
            {
                lightIcon.className = lightClassOff;
                lightName.className = lightNameClassOff;
            }

            if(! lights[light].state.reachable)
            {
                lightIcon.className = lightClassUnreachable;
            }
        }
        else
        {
            created = true;
            currentLight = document.createElement("div");
            currentLight.id = lights[light].name+"wrapper";

            var lightName = document.createElement("span");
            lightName.id = lights[light].name;
            lightName.innerHTML = lights[light].name + "     ";

            var lightIcon = document.createElement("i");
            lightIcon.id = lights[light].name + "Icon";

            currentLight.appendChild(lightName);
            currentLight.appendChild(lightIcon);
            hueWrapper.appendChild(currentLight);
            document.getElementById("hue").appendChild(hueWrapper);
        }
    }
    if(created)
        hueStatus(lights);

}

//================================================================================
// NEST
//================================================================================
socket.on('nest', function(data) {

    nestStatus(data);

});

function nestStatus(data){

    var heatingClass = null;
    var heatingIcon = null;
    if(data.data.current_temperature < data.data.target_temperature)
    {
        heatingClass = "xsmall light nestHeating";
        heatingIcon = "fa fa-thermometer-three-quarters animated pulse infinite xsmall nestHeating";
    }
    else
    {
        heatingClass = "dimmed xsmall regular";
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
        nestTargetTemp.innerHTML = "Target : " + roundValue(data.data.target_temperature,1) + "&deg";
    }
    else
    {
        var nestWrapper = document.createElement("div");
        nestWrapper.id = "nestWrapper";
        nestWrapper.className = "dimmed xsmall regular"

        var nestTitle = document.createElement("div");
        nestTitle.id = "nestTitle";
        nestTitle.innerHTML = "Nest - Living Room"

        var nestIcon = document.createElement("i");
        nestIcon.id = "nestIcon";
        nestIcon.className = heatingIcon;


        var nestCurrentTemp = document.createElement("span");
        var nestTargetTemp = document.createElement("span");
        nestCurrentTemp.id = "nestCurrentTemp";
        nestCurrentTemp.className = heatingClass;
        nestTargetTemp.id = "nestTargetTemp";

        nestCurrentTemp.innerHTML = "Current : " + roundValue(data.data.current_temperature,1) + "&deg ";
        nestTargetTemp.innerHTML = "     Target : " + roundValue(data.data.target_temperature,1) + "&deg";

        nestWrapper.appendChild(nestTitle);
        nestWrapper.appendChild(nestCurrentTemp);
        nestWrapper.appendChild(nestIcon);
        nestWrapper.appendChild(nestTargetTemp);

        document.getElementById("nest").appendChild(nestWrapper);
    }
}



//================================================================================
// Alexa Listening Icon
//================================================================================
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
    console.log(data.message.values);
    weather(data.message.values);
});



//================================================================================
// Weather
//================================================================================


function weather(data){

    var temp = roundValue(toDegree(data.main.temp),1);
    var humidity = data.main.humidity+"%";
    var pressure = data.main.pressure+" hpa";

    var windDegree =  data.wind.deg;
    var windSpeed =  data.wind.speed+"m/s";
    var windDirection = getWindDirection(windDegree);

    var sunrise = data.sys.sunrise * 1000;
    var sunset = data.sys.sunset * 1000;

    var sunriseDate = new Date(sunrise);
    var sunriseHour = sunriseDate.getHours();
    var sunriseMinute = checkTime(sunriseDate.getMinutes());
    var sunriseTime = sunriseHour+":"+sunriseMinute;

    var sunsetDate = new Date(sunset);
    var sunsetHour = sunsetDate.getHours();
    var sunsetMinute = checkTime(sunsetDate.getMinutes());;
    var sunsetTime = sunsetHour+":"+sunsetMinute;

    console.log(sunriseTime);
    console.log(sunsetTime);

    console.log(temp);
    console.log(humidity);
    console.log(pressure);
    console.log(windDegree);
    console.log(windSpeed);

    var weatherDescription = data.weather[0].description;
    var weatherIconDescription = data.weather[0].icon;
    console.log(weatherIconDescription);

    weatherIconDescription = getWeatherIcon(weatherIconDescription);
    console.log(weatherIconDescription);



    if(document.getElementById("temperature") === null)
    {
        var wrapper = document.createElement("div");
        wrapper.className = "large regular";

        var sun = document.createElement("div");
        sun.id="sunContainer";
        sun.className="normal small regular align-left";

        var sunriseSpan = document.createElement("span");
        sunriseSpan.id="sunriseSpan";
        sunriseSpan.innerHTML = sunriseTime + " ";

        var sunriseIcon = document.createElement("i");
        sunriseIcon.className = "wi wi-sunrise";

        var sunsetSpan = document.createElement("span");
        sunsetSpan.id="sunsetSpan";
        sunsetSpan.innerHTML = " " + sunsetTime + " ";

        var sunsetIcon = document.createElement("i");
        sunsetIcon.className = "wi wi-sunset";

        sun.appendChild(sunriseSpan);
        sun.appendChild(sunriseIcon);
        sun.appendChild(sunsetSpan);
        sun.appendChild(sunsetIcon);

        wrapper.appendChild(sun);

        var weatherIcon = document.createElement("i");
        weatherIcon.className = "wi " + weatherIconDescription;
        wrapper.appendChild(weatherIcon);

        var temperature = document.createElement("span");
        temperature.className = "bright";
        temperature.id = "temperature";
        temperature.innerHTML = " " + temp + "&deg;";
        wrapper.appendChild(temperature);

        var wDescription = document.createElement("div");
        wDescription.className = "small light dimmed align-left";
        wDescription.id = "WeatherDescription";
        wDescription.innerHTML = weatherDescription;

        wrapper.appendChild(wDescription);

        var extraInfo = document.createElement("div");
        extraInfo.id = "extraInfo";
        extraInfo.className="xsmall light dimmed align-left";
        extraInfo.innerHTML = "Humidity: " + humidity + " Wind: " + windSpeed + " " + windDirection;
        wrapper.appendChild(extraInfo);

        document.getElementById("weather").appendChild(wrapper);
    }
    else
    {
        var temperature = document.getElementById("temperature");
        temperature.innerHTML = " " + temp + "&deg;";
    }

    return wrapper;
}

function roundValue(temperature, decimal) {
    const decimals = decimal;
    return parseFloat(temperature).toFixed(decimals);
}

function toDegree(temp)
{
    return(temp -273.15);
}

function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}

function getWeatherIcon(weatherDescription) {

    var iconMapping = {
            "01d": "wi-day-sunny",
            "02d": "wi-day-cloudy",
            "03d": "wi-cloudy",
            "04d": "wi-cloudy-windy",
            "09d": "wi-showers",
            "10d": "wi-rain",
            "11d": "wi-thunderstorm",
            "13d": "wi-snow",
            "50d": "wi-fog",
            "01n": "wi-night-clear",
            "02n": "wi-night-cloudy",
            "03n": "wi-night-cloudy",
            "04n": "wi-night-cloudy",
            "09n": "wi-night-showers",
            "10n": "wi-night-rain",
            "11n": "wi-night-thunderstorm",
            "13n": "wi-night-snow",
            "50n": "wi-night-alt-cloudy-windy"
    };

    return iconMapping[weatherDescription];
}

function getWindDirection(windDegree) {
        if (windDegree>11.25 && windDegree<=33.75){
            return "NNE";
        } else if (windDegree > 33.75 && windDegree <= 56.25) {
            return "NE";
        } else if (windDegree > 56.25 && windDegree <= 78.75) {
            return "ENE";
        } else if (windDegree > 78.75 && windDegree <= 101.25) {
            return "E";
        } else if (windDegree > 101.25 && windDegree <= 123.75) {
            return "ESE";
        } else if (windDegree > 123.75 && windDegree <= 146.25) {
            return "SE";
        } else if (windDegree > 146.25 && windDegree <= 168.75) {
            return "SSE";
        } else if (windDegree > 168.75 && windDegree <= 191.25) {
            return "S";
        } else if (windDegree > 191.25 && windDegree <= 213.75) {
            return "SSW";
        } else if (windDegree > 213.75 && windDegree <= 236.25) {
            return "SW";
        } else if (windDegree > 236.25 && windDegree <= 258.75) {
            return "WSW";
        } else if (windDegree > 258.75 && windDegree <= 281.25) {
            return "W";
        } else if (windDegree > 281.25 && windDegree <= 303.75) {
            return "WNW";
        } else if (windDegree > 303.75 && windDegree <= 326.25) {
            return "NW";
        } else if (windDegree > 326.25 && windDegree <= 348.75) {
            return "NNW";
        } else {
            return "N";
        }
}

//================================================================================
//
//================================================================================

socket.on('error', console.error.bind(console));
socket.on('message', console.log.bind(console));