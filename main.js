/**
 * Created by Mark on 15/02/2017.
 */
const electron = require('electron');

const Server = require(__dirname + "/server.js");

const application = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
    var options = {
        width:800,
        height:600,
        darkTheme:true,
        fullscreen:true,
        autoHideMenuBar:true
    }

    var electronOptions = Object.assign({}, options);


    mainWindow = new BrowserWindow(electronOptions);
    // mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.loadURL("https://localhost:9745/");
    mainWindow.webContents.openDevTools()

    mainWindow.on("closed", function() {
        mainWindow = null;
    });
}

application.commandLine.appendSwitch('client-certificate',
    __dirname + 'ssl/server.crt');

application.on("ready", function() {
    console.log("Launching application.");
    createWindow();
});

application.on("mainWindow-all-closed", function() {
    createWindow();
});

application.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // Verification logic.
    event.preventDefault()
    callback(true)

});

// exports.openWindow = () => {
//     let mainWindow = new BrowserWindow({width:400, height:200})
//     mainWindow.loadURL('file://' + __dirname + '/bear.html')
// }

// core.start( function () {
// });