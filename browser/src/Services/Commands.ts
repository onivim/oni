/**
 * Commands.ts
 *
 * Built-in Oni Commands
 */

import { remote } from "electron"

import * as Config from "./../Config"
import { IBuffer } from "./../neovim/Buffer"
import { INeovimInstance } from "./../NeovimInstance"
import { PluginManager } from "./../Plugins/PluginManager"

import { CallbackCommand, CommandManager } from "./CommandManager"

export const registerBuiltInCommands = (commandManager: CommandManager, pluginManager: PluginManager, neovimInstance: INeovimInstance) => {
    const commands = [

        // Debug
        new CallbackCommand("oni.debug.openDevTools", "Open DevTools", "Debug ONI and any running plugins using the Chrome developer tools", () => remote.getCurrentWindow().webContents.openDevTools()),

        // Language service
        new CallbackCommand("oni.editor.gotoDefinition", "Goto Definition", "Goto definition using a language service", () => pluginManager.gotoDefinition()),

        // Menu commands
        new CallbackCommand("oni.config.openConfigJs", "Edit Oni Config", "Edit configuration file ('config.js') for ONI", () => {
            let buffer: null | IBuffer = null
            neovimInstance.open(Config.userJsConfig)
                .then(() => neovimInstance.getCurrentBuffer())
                .then((buf) => buffer = buf)
                .then(() => buffer.getLineCount())
                .then((count) => {
                    if (count === 1) {
                        let lines = [
                            "module.exports = {",
                            "  //add custom config here, such as",
                            "  //\"oni.useDefaultConfig\": true,",
                            "  //\"editor.fontSize\": \"14px\",",
                            "  //\"editor.fontFamily\": \"Monaco\"",
                            "}",
                        ]
                        buffer.setLines(0, lines.length, false, lines)
                    }
                })
        }),
        new CallbackCommand("oni.config.openInitVim", "Edit Neovim Config", "Edit configuration file ('init.vim') for Neovim", () => neovimInstance.open("$MYVIMRC")),

        // Add additional commands here
        // ...
    ]

    commands.forEach((c) => commandManager.registerCommand(c))
}
