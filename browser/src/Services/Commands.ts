/**
 * Commands.ts
 *
 * Built-in Oni Commands
 */

import { remote } from "electron"

import * as Config from "./../Config"
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
        // TODO: Generate config.js if not already built
        new CallbackCommand("oni.config.openConfigJs", "Edit Configuration", "Edit configuration file ('config.js') for ONI", () => neovimInstance.open(Config.userJsConfig)),
        new CallbackCommand("oni.config.openInitVim", "Edit Neovim Configuration", "Edit configuration file ('init.vim') for Neovim", () => neovimInstance.open("$MYVIMRC")),

        // Add additional commands here
        // ...
    ]

    commands.forEach((c) => commandManager.registerCommand(c))
}
