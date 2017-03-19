/**
 * Created by Mark on 18/03/2017.
 */
var socket = io();

socket.on('welcome', function(data) {
    addMessage(data.message);

    // Respond with a message including this clients' id sent from the server
    socket.emit('i am client', {data: 'foo!', id: data.id});
});
socket.on('time', function(data) {
    console.log(data.message);
    addMessage(data.message.temp);
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