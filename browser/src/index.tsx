/**
 * index.tsx
 *
 * Entry point for the BrowserWindow process
 */

/// <reference path="./../../definitions/Oni.d.ts" />

import { ipcRenderer, remote } from "electron"
import * as minimist from "minimist"
import * as Config from "./Config"
import { PluginManager } from "./Plugins/PluginManager"

import { CommandManager } from "./Services/CommandManager"

import * as _ from "lodash"

import * as UI from "./UI/index"

const start = (args: string[]) => {

    const parsedArgs = minimist(args)

    let loadInitVim: boolean = false

    // Helper for debugging:
    window["UI"] = UI // tslint:disable-line no-string-literal
    require("./overlay.less")

    const commandManager = new CommandManager()
    const pluginManager = new PluginManager(commandManager)

    const config = Config.instance()
    config.on("logError", (err: Error) => {
        UI.Actions.makeLog({
            type: "error",
            message: err.message,
            details: err.stack.split("\n"),
        })
    })

    const initialConfigParsingError = config.getParsingError()
    if (initialConfigParsingError) {
        UI.Actions.makeLog({
            type: "error",
            message: initialConfigParsingError.message,
            details: initialConfigParsingError.stack.split("\n"),
        })
    }

    let prevConfigValues = config.getValues()

    const browserWindow = remote.getCurrentWindow()

    const configChange = () => {
        let newConfigValues = config.getValues()
        let prop: keyof Config.IConfigValues
        for (prop in newConfigValues) {
            if (!_.isEqual(newConfigValues[prop], prevConfigValues[prop])) {
                UI.Actions.setConfigValue(prop, newConfigValues[prop])
            }
        }
        prevConfigValues = newConfigValues

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

    configChange() // initialize values
    config.registerListener(configChange)

    UI.events.on("completion-item-selected", (item: any) => {
        pluginManager.notifyCompletionItemSelected(item)
    })

    UI.init(pluginManager, commandManager, parsedArgs._)

    ipcRenderer.on("execute-command", (_evt: any, command: string) => {
        commandManager.executeCommand(command, null)
    })
}

ipcRenderer.on("init", (_evt: any, message: any) => {
    process.chdir(message.workingDirectory)
    start(message.args)
})
