/**
 * Created by Mark on 15/02/2017.
 */
const remote = require('electron').remote
const main = remote.require('./main.js')


var button = document.createElement('button')
button.textContent = 'Open Window'
button.addEventListener('click', () => {
    main.openWindow()
}, false)
document.body.appendChild(button)