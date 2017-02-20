/**
 * Commands.ts
 *
 * Built-in Oni Commands
 */

import { remote } from "electron"

import { PluginManager } from "./../Plugins/PluginManager"

import { CallbackCommand, CommandManager } from "./CommandManager"

export const registerBuiltInCommands = (commandManager: CommandManager, pluginManager: PluginManager) => {
    const commands = [

        // Debug
        new CallbackCommand("oni.debug.openDevTools", "Open DevTools", "Debug ONI and any running plugins using the Chrome developer tools", () => remote.getCurrentWindow().webContents.openDevTools()),

        // Language service
        new CallbackCommand("oni.editor.gotoDefinition", "Goto Definition", "Goto definition using a language service", () => pluginManager.gotoDefinition()),

        // Add additional commands here
        // ...
    ]

    commands.forEach((c) => commandManager.registerCommand(c))
}
