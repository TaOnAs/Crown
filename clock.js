
function start_date_time(id)
{
    var wrapper = document.createElement("div");
    var dateWrapper = document.createElement("div");
    var timeWrapper = document.createElement("div");
    var lineBreak = document.createElement("hr");
    dateWrapper.className = "normal medium";
    dateWrapper.id = "dateWrapper";
    timeWrapper.className = "bright large light";
    timeWrapper.id = "timeWrapper";

    wrapper.appendChild(dateWrapper);
    wrapper.appendChild(lineBreak);
    wrapper.appendChild(timeWrapper);
    document.getElementById(id).appendChild(wrapper);

}


function date_time()
{
    date = new Date;
    year = date.getFullYear();
    month = date.getMonth();
    months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'Jully', 'August', 'September', 'October', 'November', 'December');
    d = date.getDate();
    day = date.getDay();
    days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    h = date.getHours();
    if(h<10)
    {
        h = "0"+h;
    }
    m = date.getMinutes();
    if(m<10)
    {
        m = "0"+m;
    }
    s = date.getSeconds();
    if(s<10)
    {
        s = "0"+s;
    }

    date = ''+days[day]+' '+months[month]+' '+d+' '+year;
    time = h+':'+m+':'+s;

    dateWrapper = document.getElementById('dateWrapper');
    timeWrapper = document.getElementById('timeWrapper');

    dateWrapper.innerHTML = date;
    timeWrapper.innerHTML = time;

    setTimeout('date_time();','1000');

    return true;
}


