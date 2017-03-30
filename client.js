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
    var lightClassOff = "fa fa-lightbulb-o normal bright";
    var lightClassUnreachable = "fa fa-times-circle medium normal";

    var lightNameClassOn = "medium bright regular";
    var lightNameClassOff = "medium normal regular";

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
    nestStatus(data.data);

});

function nestStatus(data){

    var shared = data.shared[Object.keys(data.schedule)[0]];
    var device = data.device[Object.keys(data.schedule)[0]];

    var heatingClass = null;
    var heatingIcon = null;
    if(roundValue(shared.current_temperature,1) < roundValue(shared.target_temperature,1))
    {
        heatingClass = "medium regular nestHeating";
        heatingIcon = "fa fa-thermometer-three-quarters animated pulse infinite medium nestHeating";
    }
    else
    {
        heatingClass = "bright medium regular";
        heatingIcon = "";
    }

    if(document.getElementById("nestWrapper"))
    {
        var nestWrapper = document.getElementById("nestWrapper");

        var nestCurrentTemp = document.getElementById("nestCurrentTemp");
        var nestTargetTemp = document.getElementById("nestTargetTemp");
        var nestIcon = document.getElementById("nestIcon");
        var nestHumidity = document.getElementById("nestHumidity");


        nestCurrentTemp.className = heatingClass;
        nestIcon.className = heatingIcon;

        nestCurrentTemp.innerHTML = "Current : " + roundValue(shared.current_temperature,1) + "&deg      ";
        nestTargetTemp.innerHTML = " Target : " + roundValue(shared.target_temperature,1) + "&deg";
        nestHumidity.innerHTML = "Humidity : " + device.current_humidity;
    }
    else
    {
        var nestWrapper = document.createElement("div");
        nestWrapper.id = "nestWrapper";
        nestWrapper.className = "bright medium regular"

        var nestTitle = document.createElement("div");
        nestTitle.id = "nestTitle";
        nestTitle.innerHTML = "Nest - Living Room"

        var nestIcon = document.createElement("i");
        nestIcon.id = "nestIcon";
        nestIcon.className = heatingIcon;


        var nestCurrentTemp = document.createElement("div");
        var nestTargetTemp = document.createElement("div");
        nestCurrentTemp.id = "nestCurrentTemp";
        nestCurrentTemp.className = heatingClass;
        nestTargetTemp.id = "nestTargetTemp";

        var nestHumidity = document.createElement("div");
        nestHumidity.id = "nestHumidity";



        nestWrapper.appendChild(nestTitle);
        nestWrapper.appendChild(nestCurrentTemp);
        nestWrapper.appendChild(nestIcon);
        nestWrapper.appendChild(nestTargetTemp);
        nestWrapper.appendChild(nestHumidity);

        document.getElementById("nest").appendChild(nestWrapper);

        nestStatus(data);
    }
}



//================================================================================
// Alexa Listening Icon
//================================================================================
socket.on('alexa', function(data) {
    listening();
});

socket.on('mirror',function(data){
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
    // console.log(data);
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

    var weatherDescription = data.weather[0].description;
    var weatherIconDescription = data.weather[0].icon;

    weatherIconDescription = getWeatherIcon(weatherIconDescription);


    if(document.getElementById("weatherWrapper") === null)
    {
        var wrapper = document.createElement("div");
        wrapper.id = "weatherWrapper";
        wrapper.className = "large regular debug align-left";

        var sun = document.createElement("div");
        sun.id="sunContainer";
        sun.className="bright medium regular align-left";

        var sunriseSpan = document.createElement("span");
        sunriseSpan.id="sunriseSpan";
        //sunriseSpan.innerHTML = sunriseTime + " ";

        var sunriseIcon = document.createElement("i");
        sunriseIcon.id = "sunriseIcon";
        sunriseIcon.className = "wi wi-sunrise";

        var sunsetSpan = document.createElement("span");
        sunsetSpan.id="sunsetSpan";
        //sunsetSpan.innerHTML = " " + sunsetTime + " ";

        var sunsetIcon = document.createElement("i");
        sunsetIcon.id = "sunsetIcon";
        sunsetIcon.className = "wi wi-sunset";

        sun.appendChild(sunriseSpan);
        sun.appendChild(sunriseIcon);
        sun.appendChild(sunsetSpan);
        sun.appendChild(sunsetIcon);

        wrapper.appendChild(sun);

        var weatherIcon = document.createElement("i");
        //weatherIcon.className = "wi " + weatherIconDescription;
        weatherIcon.id = "weatherIcon";
        wrapper.appendChild(weatherIcon);

        var temperature = document.createElement("span");
        temperature.className = "bright";
        temperature.id = "temperature";
        //temperature.innerHTML = " " + temp + "&deg;";
        wrapper.appendChild(temperature);

        var wDescription = document.createElement("div");
        wDescription.className = "small light bright aligh-left";
        wDescription.id = "weatherDescription";
        //wDescription.innerHTML = weatherDescription;

        wrapper.appendChild(wDescription);

        var extraInfo = document.createElement("div");
        extraInfo.id = "extraInfo";
        extraInfo.className="medium light bright align-left";
        //extraInfo.innerHTML = "Humidity: " + humidity + " <br />Wind: " + windSpeed + " <br />Direction: " + windDirection;
        wrapper.appendChild(extraInfo);

        document.getElementById("weather").appendChild(wrapper);

        weather(data);
    }
    else
    {
        var wrapper = document.getElementById("weatherWrapper");
        var sunriseSpan = document.getElementById("sunriseSpan");
        var sunsetSpan = document.getElementById("sunsetSpan");
        var weatherIcon = document.getElementById("weatherIcon");
        var temperature = document.getElementById("temperature");
        var wDescription = document.getElementById("weatherDescription");
        var extraInfo = document.getElementById("extraInfo");

        sunriseSpan.innerHTML = sunriseTime + " ";
        sunsetSpan.innerHTML = " " + sunsetTime + " ";
        weatherIcon.className = "wi " + weatherIconDescription;
        temperature.innerHTML = " " + temp + "&deg;";
        wDescription.innerHTML = weatherDescription;
        extraInfo.innerHTML = "Humidity: " + humidity + " <br />Wind: " + windSpeed + " <br />Direction: " + windDirection;

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

socket.on('mirrormirror', function(data){
   document.body.className = "animated hinge";
});