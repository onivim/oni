/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

/// <reference path="./../../definitions/Oni.d.ts" />

import { ipcRenderer, remote } from "electron"
import * as minimist from "minimist"
import * as Config from "./Config"
import * as Log from "./Log"
import { PluginManager } from "./Plugins/PluginManager"

import { commandManager } from "./Services/CommandManager"

import * as UI from "./UI/index"

const start = (args: string[]) => {

    const parsedArgs = minimist(args)

    let loadInitVim: boolean = false

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal
    require("./overlay.less")

    const pluginManager = new PluginManager()

    const config = Config.instance()

    const initialConfigParsingError = config.getParsingError()
    if (initialConfigParsingError) {
        Log.error(initialConfigParsingError)
    }

    const browserWindow = remote.getCurrentWindow()

    const configChange = (newConfigValues: Partial<Config.IConfigValues>) => {
        let prop: keyof Config.IConfigValues
        for (prop in newConfigValues) {
            UI.Actions.setConfigValue(prop, newConfigValues[prop])
        }

        document.body.style.fontFamily = config.getValue("editor.fontFamily")
        document.body.style.fontSize = config.getValue("editor.fontSize")
        document.body.style.fontVariant = config.getValue("editor.fontLigatures") ? "normal" : "none"

        const hideMenu: boolean = config.getValue("oni.hideMenu")
        browserWindow.setAutoHideMenuBar(hideMenu)
        browserWindow.setMenuBarVisibility(!hideMenu)

        const loadInit: boolean = config.getValue("oni.loadInitVim")
        if (loadInit !== loadInitVim) {
            ipcRenderer.send("rebuild-menu", loadInit)
            // don't rebuild menu unless oni.loadInitVim actually changed
            loadInitVim = loadInit
        }

        browserWindow.setFullScreen(config.getValue("editor.fullScreenOnStart"))
    }

    configChange(config.getValues()) // initialize values
    config.onConfigurationChanged.subscribe(configChange)

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
