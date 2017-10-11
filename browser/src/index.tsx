/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

/// <reference path="./../../definitions/Oni.d.ts" />

import { ipcRenderer, remote } from "electron"
import * as minimist from "minimist"
import * as Log from "./Log"
import { PluginManager } from "./Plugins/PluginManager"

import { commandManager } from "./Services/CommandManager"
import { configuration, IConfigurationValues } from "./Services/Configuration"

import * as UI from "./UI/index"

const start = (args: string[]) => {

    const parsedArgs = minimist(args)

    let loadInitVim: boolean = false
    let maximizeScreenOnStart: boolean = false

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal
    require("./overlay.less")

    const pluginManager = new PluginManager()

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

        document.body.style.fontFamily = configuration.getValue("editor.fontFamily")
        document.body.style.fontSize = configuration.getValue("editor.fontSize")
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

    UI.events.on("completion-item-selected", (item: any) => {
        pluginManager.notifyCompletionItemSelected(item)
    })

    UI.init(pluginManager, parsedArgs._)

    ipcRenderer.on("execute-command", (_evt: any, command: string) => {
        commandManager.executeCommand(command, null)
    })
}

ipcRenderer.on("init", (_evt: any, message: any) => {
    process.chdir(message.workingDirectory)
    start(message.args)
})
