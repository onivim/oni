import * as minimist from "minimist"
import * as path from "path"

import { app, BrowserWindow, ipcMain, Menu } from "electron"

import * as PersistentSettings from "electron-settings"

import addDevExtensions from "./installDevTools"
import * as Log from "./Log"
import { buildDockMenu, buildMenu } from "./menu"
import { makeSingleInstance } from "./ProcessLifecycle"
import { moveToNextOniInstance } from "./WindowManager"

global["getLogs"] = Log.getAllLogs // tslint:disable-line no-string-literal

const processArgs = process.argv || []
const isAutomation = processArgs.find(f => f.indexOf("--test-type=webdriver") >= 0)
const isDevelopment = process.env.NODE_ENV === "development" || process.env.ONI_WEBPACK_LOAD === "1"
const isDebug = process.argv.filter(arg => arg.indexOf("--debug") >= 0).length > 0

// We want to check for the 'help' flag before initializing electron
const argv = minimist(process.argv.slice(1))
const version = require(path.join(__dirname, "..", "..", "..", "package.json")).version // tslint:disable-line no-var-requires
if (argv.help || argv.h) {
    process.stdout.write("ONI: Modern Modal Editing - powered by Neovim\n")
    process.stdout.write(` version: ${version}\n`)
    process.stdout.write("\nUsage:\n oni [FILE]\t\tEdit file\n")
    process.stdout.write("\nhttps://github.com/onivim/oni\n")
    process.exit(0)
}

interface IWindowState {
    bounds?: {
        x: number
        y: number
        height: number
        width: number
    }
    isMaximized?: boolean
}

let windowState: IWindowState = {
    bounds: {
        x: null,
        y: null,
        height: 600,
        width: 800,
    },
    isMaximized: false,
}

function storeWindowState(main) {
    if (!main) {
        return
    }
    windowState.isMaximized = main.isMaximized()

    if (!windowState.isMaximized) {
        // only update bounds if window isn't maximized
        windowState.bounds = main.getBounds()
    }
    try {
        PersistentSettings.set("_internal.windowState", windowState as any)
    } catch (e) {
        Log.info(`error setting window state: ${e.message}`)
    }
}

ipcMain.on("focus-next-instance", () => {
    Log.info("focus-next-instance")
    focusNextInstance(1)
})

ipcMain.on("focus-previous-instance", () => {
    Log.info("focus-previous-instance")
    focusNextInstance(-1)
})

ipcMain.on("move-to-next-oni-instance", (event, direction: string) => {
    Log.info(`Attempting to swap to Oni instance on the ${direction}.`)
    moveToNextOniInstance(windows, direction)
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows: BrowserWindow[] = []
const activeWindow = () => {
    return windows.filter(w => w.isFocused())[0] || null
}

// Only enable 'single-instance' mode when we're not in the hot-reload mode
// Otherwise, all other open instances will also pick up the webpack bundle
if (!isDevelopment && !isDebug && !isAutomation) {
    const currentOptions = {
        args: processArgs,
        workingDirectory: process.env["ONI_CWD"] || process.cwd(), // tslint:disable-line no-string-literal
    }

    Log.info("Making single instance...")
    makeSingleInstance(currentOptions, options => {
        Log.info("Creating single instance")
        loadFileFromArguments(process.platform, options.args, options.workingDirectory)
    })
} else {
    // If running from spectron, ignore the arguments
    let argsToUse = processArgs
    if (isAutomation) {
        Log.warn("Clearing arguments because running from automation!")
        argsToUse = []
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", async () => {
        if (!isAutomation) {
            await addDevExtensions()
        }
        loadFileFromArguments(process.platform, argsToUse, process.env.ONI_CWD || process.cwd())
    })
}

export interface IDelayedEvent {
    evt: string
    cmd: Array<string | string[]>
}

export function createWindow(
    commandLineArguments,
    workingDirectory,
    delayedEvent: IDelayedEvent = null,
) {
    Log.info(
        `Creating window with arguments: ${commandLineArguments} and working directory: ${workingDirectory}`,
    )
    const webPreferences = {
        blinkFeatures: "ResizeObserver,Accelerated2dCanvas,Canvas2dFixedRenderingMode",
    }

    const backgroundColor =
        (PersistentSettings.get("_internal.lastBackgroundColor") as string) || "#1E2127"

    try {
        const internalWindowState = PersistentSettings.get("_internal.windowState") as IWindowState
        if (
            internalWindowState &&
            (internalWindowState.bounds || internalWindowState.isMaximized)
        ) {
            windowState = internalWindowState
        }
    } catch (e) {
        Log.info(`error getting window state: ${e.message}`)
    }

    const rootPath = path.join(__dirname, "..", "..", "..")
    const iconPath = path.join(rootPath, "images", "oni.ico")
    const indexPath = path.join(rootPath, "index.html?react_perf")
    // Create the browser window.
    // TODO: Do we need to use non-ico for other platforms?
    let currentWindow = new BrowserWindow({
        icon: iconPath,
        webPreferences,
        backgroundColor,
        titleBarStyle: "hidden",
        x: windowState.bounds.x,
        y: windowState.bounds.y,
        height: windowState.bounds.height,
        width: windowState.bounds.width,
    })

    if (windowState.isMaximized) {
        currentWindow.maximize()
    }

    updateMenu(currentWindow, false)
    currentWindow.webContents.on("did-finish-load", () => {
        currentWindow.webContents.send("init", {
            args: commandLineArguments,
            workingDirectory,
        })
    })

    ipcMain.once("Oni.started", evt => {
        Log.info("Oni started")

        if (delayedEvent) {
            currentWindow.webContents.send(delayedEvent.evt, ...delayedEvent.cmd)
        }
    })

    ipcMain.on("rebuild-menu", (_evt, loadInit) => {
        // ipcMain is a singleton so if there are multiple Oni instances
        // we may receive an event from a different instance
        if (currentWindow) {
            updateMenu(currentWindow, loadInit)
        }
    })

    // and load the index.html of the app.
    currentWindow.loadURL(`file://${indexPath}`)

    // Open the DevTools.
    if (process.env.NODE_ENV === "development" || commandLineArguments.indexOf("--debug") >= 0) {
        currentWindow.webContents.openDevTools()
    }

    currentWindow.on("move", () => {
        storeWindowState(currentWindow)
    })
    currentWindow.on("resize", () => {
        storeWindowState(currentWindow)
    })
    currentWindow.on("close", () => {
        storeWindowState(currentWindow)
    })

    // Emitted when the window is closed.
    currentWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        windows = windows.filter(m => m !== currentWindow)
        currentWindow = null
    })

    windows.push(currentWindow)

    return currentWindow
}

app.on("open-file", (event, filePath) => {
    event.preventDefault()
    Log.info(`filePath to open: ${filePath}`)
    if (activeWindow()) {
        activeWindow().webContents.send("open-file", filePath)
    } else if (process.platform.includes("darwin")) {
        const argsToUse = [...process.argv, filePath]
        createWindow(argsToUse, process.cwd())
    }
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin" || isAutomation) {
        app.quit()
    }
})

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!windows.length) {
        createWindow([], process.cwd())
    }
    if (activeWindow()) {
        activeWindow().show()
    }
})

function updateMenu(browserWindow, loadInit) {
    const menu = buildMenu(browserWindow, loadInit)
    if (process.platform === "darwin") {
        // all osx windows share the same menu
        Menu.setApplicationMenu(menu)
        const dockMenu = buildDockMenu(browserWindow, loadInit)
        app.dock.setMenu(dockMenu)
    } else {
        // on windows and linux, set menu per window
        browserWindow.setMenu(menu)
    }
}

function focusNextInstance(direction) {
    const currentFocusedWindows = windows.filter(f => f.isFocused())

    if (currentFocusedWindows.length === 0) {
        Log.info("No window currently focused")
        return
    }

    const currentFocusedWindow = currentFocusedWindows[0]
    const currentWindowIdx = windows.indexOf(currentFocusedWindow)
    let newFocusWindowIdx = (currentWindowIdx + direction) % windows.length

    if (newFocusWindowIdx < 0) {
        newFocusWindowIdx = windows.length - 1
    }

    Log.info(`Focusing index: ${newFocusWindowIdx}`)
    windows[newFocusWindowIdx].focus()
}

function loadFileFromArguments(platform, args, workingDirectory) {
    const localOni = "LOCAL_ONI"
    if (!process.env[localOni]) {
        createWindow(args.slice(1), workingDirectory)
    } else {
        createWindow(args.slice(2), workingDirectory)
    }
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
