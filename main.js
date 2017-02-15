const electron = require('electron')
const path = require("path")
// Module to control application life.
const defaultMenu = require('electron-default-menu');
const { Menu, app, shell, dialog } = electron;
const os = require('os');

const ipcMain = electron.ipcMain

const isDevelopment = process.env.NODE_ENV === "development" 

const isVerbose = process.argv.filter(arg => arg.indexOf("--verbose") >= 0).length > 0
const isDebug = process.argv.filter(arg => arg.indexOf("--debug") >= 0).length >0

// import * as derp from "./installDevTools"

if (isDebug || isDevelopment) {
    require("./installDevTools")
}

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const webContents = electron.webContents

ipcMain.on("cross-browser-ipc", (event, arg) => {
    const destinationId = arg.meta.destinationId
    const destinationWebContents = webContents.fromId(destinationId)

    log(`sending message to destinationId: ${destinationId}`)
    destinationWebContents.send("cross-browser-ipc", arg)
})

ipcMain.on("focus-next-instance", () => {
    log("focus-next-instance")
    focusNextInstance(1)
})

ipcMain.on("focus-previous-instance", () => {
    log("focus-previous-instance")
    focusNextInstance(-1)
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = []

// Only enable 'single-instance' mode when we're not in the hot-reload mode
// Otherwise, all other open instances will also pick up the webpack bundle
if (!isDevelopment && !isDebug) {
    const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
        createWindow(commandLine.slice(2), workingDirectory)
    })

    if (shouldQuit) {
        app.quit()
    }
}

function createWindow(commandLineArguments, workingDirectory) {
    log(`Creating window with arguments: ${commandLineArguments} and working directory: ${workingDirectory}`)

    // Create the browser window.
    let mainWindow = new BrowserWindow({ width: 800, height: 600, icon: path.join(__dirname, "images", "Oni_128.png") })
    let menu = defaultMenu(app, shell);

    let firstMenu = os.platform() == "win32" ? 'File' : 'Oni';
    menu.unshift({
        label: firstMenu,
        submenu: [
            {
                label: 'Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":e " + name)
                        }
                    })
                }
            },
            {
                label: 'Split Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":sp " + name)
                        }
                    })
                }
            },
            {
                label: 'Tab Open...',
                click: (item, focusedWindow) => {
                    dialog.showOpenDialog(mainWindow, ['openFile'], (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":tabnew " + name)
                        }
                    })
                }
            },
            {
                label: 'New',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":enew")
                }
            },
            {
                label: 'Close',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":close")
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Save',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":w")
                }
            },
            {
                label: 'Save As...',
                click: (item, focusedWindow) => {
                    dialog.showSaveDialog(mainWindow, {}, (name) => {
                        if (name) {
                            mainWindow.webContents.send("menu-item-click", ":save " + name)
                        }
                    })
                }
            },
            {
                label: 'Save All',
                click: (item, focusedWindow) => {
                    mainWindow.webContents.send("menu-item-click", ":wall")
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                click: (item, focusedWindow) => {
                    app.quit()
                }
            }
        ]
    })

    // Edit menu
    menu[1].submenu = [
       {
           label: 'Undo',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "u")
           }
       },
       {
           label: 'Redo',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-r>")
           }
       },
       {
           label: 'Repeat',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", ".")
           }
       },
       {
           type: 'separator'
       },
       {
           label: 'Cut',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", '\\"+x')
           }
       },
       {
           label: 'Copy',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", '\\"+y')
           }
       },
       {
           label: 'Paste',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", '\\"+gP')
           }
       },
       {
           label: 'Put Before',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "[p")
           }
       },
       {
           label: 'Put After',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "]p")
           }
       },
       {
           label: 'Select All',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "ggVG")
           }
       }
    ]

    // Window menu
    menu[3].submenu = [
        {
           label: 'New',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>n")
           }
        },
        {
           label: 'Split',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>s")
           }
        },
        {
           label: 'Split Vertically',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>v")
           }
        },
        {
           label: 'Split File Explorer',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", ":Lexplore | vertical resize 30")
           }
        },
        {
            type: 'separator'
        },
        {
           label: 'Close',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>c")
           }
        },
        {
           label: 'Close Other(s)',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>o")
           }
        },
        {
            type: 'separator'
        },
        {
           label: 'Rotate Up',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>R")
           }
        },
        {
           label: 'Rotate Down',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>r")
           }
        },
        {
            type: 'separator'
        },
        {
           label: 'Equal Size',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>=")
           }
        },
        {
           label: 'Max Height',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>_")
           }
        },
        {
           label: 'Min Height',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>1_")
           }
        },
        {
           label: 'Max Width',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>|")
           }
        },
        {
           label: 'Min Width',
           click: (item, focusedWindow) => {
               mainWindow.webContents.send("menu-item-click", "\\<C-w>1|")
           }
        }
    ]

    // Help menu
    menu[4].submenu = [
        {
            label: 'Learn more',
            click: (item, focusedWindow) => {
                shell.openExternal('https://github.com/extr0py/oni#introduction');
            }
        },
        {
            label: 'Issues',
            click: (item, focusedWindow) => {
                shell.openExternal('https://github.com/extr0py/oni/issues');
            }
        },
        {
            label: 'Github',
            click: (item, focusedWindow) => {
                shell.openExternal('https://github.com/extr0py/oni');
            }
        }
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.webContents.send("init", {
            args: commandLineArguments,
            workingDirectory: workingDirectory
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
        windows = windows.filter(m => m !== mainWindow)
        mainWindow = null

    })

    windows.push(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow(process.argv.slice(2), process.cwd())
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

function focusNextInstance(direction) {
    const currentFocusedWindows = windows.filter(f => f.isFocused())

    if (currentFocusedWindows.length === 0) {
        log("No window currently focused")
        return
    }

    const currentFocusedWindow = currentFocusedWindows[0]
    const currentWindowIdx = windows.indexOf(currentFocusedWindow)
    let newFocusWindowIdx = (currentWindowIdx + direction) % windows.length

    if (newFocusWindowIdx < 0)
        newFocusWindowIdx = windows.length - 1

    log(`Focusing index: ${newFocusWindowIdx}`)
    windows[newFocusWindowIdx].focus()
}

function log(message) {
    if (isVerbose) {
        console.log(message)
    }
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
