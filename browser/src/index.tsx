/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

/// <reference path="./../../definitions/Oni.d.ts" />

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

import { Startup } from "./Lifecycle/Startup"

import * as UI from "./UI/index"

const checkConfig = async (): Promise<void> => {
    const initialConfigParsingError = configuration.getParsingError()
    if (initialConfigParsingError) {
        Log.error(initialConfigParsingError)
    }
}

const listenForConfigChanges = async(): Promise<void> => {
    let loadInitVim: boolean = false
    let maximizeScreenOnStart: boolean = false

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

    configChange(configuration.getValues()) // initialize values
    configuration.onConfigurationChanged.subscribe(configChange)
}

const startUI = (args?: any) => async (): Promise<void> => {
    UI.init(pluginManager, args)
}

const startPlugins = async (): Promise<void> => {
    const api = pluginManager.startPlugins()
    configuration.activate(api)
    AutoClosingPairs.activate(configuration, editorManager, inputManager, languageManager)
}

const start = async (args: string[]) => {

    const parsedArgs = minimist(args)
    const startup = new Startup()

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal
    require("./overlay.less")

    startup.enqueueTask("CheckConfigForErrors", checkConfig)
    startup.enqueueTask("ListenForConfigChanges", listenForConfigChanges)
    startup.enqueueTask("StartUI", startUI(parsedArgs._))

    ipcRenderer.on("execute-command", (_evt: any, command: string) => {
        commandManager.executeCommand(command, null)
    })

    startup.enqueueTask("CreateLanguageClients", async () => createLanguageClientsFromConfiguration(configuration.getValues()))

    startup.enqueueTask("StartPluginsAndActivateConfiguration", startPlugins)

    await startup.start()

    // TODO:
    // UI.Actions.setLoadingComplete()

    // Checking for updates isn't on the critical path for startup,
    // so it doesn't need ot be queued
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
