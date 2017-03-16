/**
 * Created by Mark on 15/02/2017.
 */
const electron = require('electron');
const core = require(__dirname + "/app.js");

// const Server = require(__dirname + "/server.js");
// const Clock = require(__dirname + "/clock.js");

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
    mainWindow.loadURL("https://localhost:9745/");
    console.log(process.versions.electron);
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

// exports.openWindow = () => {
//     let mainWindow = new BrowserWindow({width:400, height:200})
//     mainWindow.loadURL('file://' + __dirname + '/bear.html')
// }

core.start( function () {
});