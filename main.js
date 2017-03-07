/**
 * Created by Mark on 15/02/2017.
 */



const electron = require('electron');



const {app, BrowserWindow} = electron;
const path = require('path');
const url = require('url');
const clock = require(__dirname + "/clock.js");
const server = require(__dirname + "/server.js");


let window;

function createBrowserWindow()
{
    var options = {
        width:800,
        height:600,
        darkTheme:true,
        fullscreen:true,
        autoHideMenuBar:true
    }

    var electronOptions = Object.assign({}, options)

    window = new BrowserWindow(electronOptions)
    window.loadURL('file:' + __dirname +'/index.html')
    window.webContents.openDevTools()


}




app.on('ready', () => {

    createBrowserWindow();

    // let window = new BrowserWindow({width:800, height:600})
    // window.loadURL('file:' + __dirname +'/index.html')
    // window.webContents.openDevTools()
})


// exports.openWindow = () => {
//     let window = new BrowserWindow({width:400, height:200})
//     window.loadURL('file://' + __dirname + '/bear.html')
// }