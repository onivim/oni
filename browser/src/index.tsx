/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

import { ipcRenderer, remote } from "electron"
import * as minimist from "minimist"
import * as Log from "./Log"
import { pluginManager } from "./Plugins/PluginManager"

import * as AutoClosingPairs from "./Services/AutoClosingPairs"
import { autoUpdater, constructFeedUrl } from "./Services/AutoUpdate"
import { commandManager } from "./Services/CommandManager"
import { configuration, IConfigurationValues } from "./Services/Configuration"
import { editorManager } from "./Services/EditorManager"
import { inputManager } from "./Services/InputManager"
import { languageManager } from "./Services/Language"

import { createLanguageClientsFromConfiguration } from "./Services/Language"

import * as UI from "./UI/index"

const start = (args: string[]) => {

    const parsedArgs = minimist(args)

    let loadInitVim: boolean = false
    let maximizeScreenOnStart: boolean = false

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal
    require("./overlay.less")

    const initialConfigParsingError = configuration.getParsingError()
    if (initialConfigParsingError) {
        Log.error(initialConfigParsingError)
    }

    const browserWindow = remote.getCurrentWindow()

    const configChange = (newConfigValues: Partial<IConfigurationValues>) => {
        let prop: keyof IConfigurationValues
        for (prop in newConfigValues) {
            UI.Actions.setConfigValue(prop, newConfigValues[prop])
        }

        document.body.style.fontFamily = configuration.getValue("ui.fontFamily")
        document.body.style.fontSize = configuration.getValue("ui.fontSize")
        document.body.style.fontVariant = configuration.getValue("editor.fontLigatures") ? "normal" : "none"

        const hideMenu: boolean = configuration.getValue("oni.hideMenu")
        browserWindow.setAutoHideMenuBar(hideMenu)
        browserWindow.setMenuBarVisibility(!hideMenu)

        const loadInit: boolean = configuration.getValue("oni.loadInitVim")
        if (loadInit !== loadInitVim) {
            ipcRenderer.send("rebuild-menu", loadInit)
            // don't rebuild menu unless oni.loadInitVim actually changed
            loadInitVim = loadInit
        }

        const maximizeScreen: boolean = configuration.getValue("editor.maximizeScreenOnStart")
        if (maximizeScreen !== maximizeScreenOnStart) {
            browserWindow.maximize()
        }

        browserWindow.setFullScreen(configuration.getValue("editor.fullScreenOnStart"))
    }

    configuration.start()
    configChange(configuration.getValues()) // initialize values
    configuration.onConfigurationChanged.subscribe(configChange)

    performance.mark("NeovimInstance.Plugins.Start")
    const api = pluginManager.startPlugins()
    performance.mark("NeovimInstance.Plugins.End")

    configuration.activate(api)

    UI.init(pluginManager, parsedArgs._)

    ipcRenderer.on("execute-command", (_evt: any, command: string) => {
        commandManager.executeCommand(command, null)
    })

    createLanguageClientsFromConfiguration(configuration.getValues())

    AutoClosingPairs.activate(configuration, editorManager, inputManager, languageManager)

    checkForUpdates()
}

ipcRenderer.on("init", (_evt: any, message: any) => {
    process.chdir(message.workingDirectory)
    start(message.args)
})

const checkForUpdates = async () => {
    const feedUrl = await constructFeedUrl("https://api.onivim.io/v1/update")

    autoUpdater.onUpdateAvailable.subscribe(() => Log.info("Update available."))
    autoUpdater.onUpdateNotAvailable.subscribe(() => Log.info("Update not available."))

    autoUpdater.checkForUpdates(feedUrl)
}
