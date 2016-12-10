const electron = require('electron')
const path = require("path")
// Module to control application life.

const app = electron.app
const ipcMain = electron.ipcMain

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

ipcMain.on("cross-browser-ipc", (event, arg) => {
    const destinationId = arg.meta.destinationId
    const destinationWindow = BrowserWindow.fromId(destinationId)
    // console.log(`sending message to destinationId: ${destinationId}`)
    destinationWindow.webContents.send("cross-browser-ipc", arg)
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = []

function createWindow(commandLineArguments) {
    // Create the browser window.
    let mainWindow = new BrowserWindow({ width: 800, height: 600, icon: path.join(__dirname, "images", "Oni_128.png") })

    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("init", {
            args: commandLineArguments
        })
    })

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`)

    // Open the DevTools.
    if (process.env.NODE_ENV === "development")
        mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    windows.push(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow(process.argv.slice(2))
})

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows.length === 0) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
