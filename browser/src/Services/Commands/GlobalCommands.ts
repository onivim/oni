/**
 * GlobalCommands.ts
 *
 * Built-in, general Oni commands, that are not specific
 * to an editor or service.
 */

import { remote } from "electron"

import * as Oni from "oni-api"

import { MenuManager } from "./../../Services/Menu"
import { showAboutMessage } from "./../../Services/Metadata"
import { multiProcess } from "./../../Services/MultiProcess"
import { Tasks } from "./../../Services/Tasks"
import { windowManager } from "./../../Services/WindowManager"

// import * as UI from "./../UI/index"

import { CallbackCommand, CommandManager } from "./../CommandManager"

import * as Platform from "./../../Platform"

export const activate = (commandManager: CommandManager, menuManager: MenuManager, tasks: Tasks) => {

    const popupMenuCommand = (innerCommand: Oni.Commands.CommandCallback) => {
        return () => {
            if (menuManager.isMenuOpen()) {
                return innerCommand()
            }

            return false
        }
    }

    const popupMenuClose = popupMenuCommand(() => menuManager.closeActiveMenu())
    const popupMenuNext = popupMenuCommand(() => menuManager.nextMenuItem())
    const popupMenuPrevious = popupMenuCommand(() => menuManager.previousMenuItem())
    const popupMenuSelect = popupMenuCommand(() => menuManager.selectMenuItem())

    const commands = [

        new CallbackCommand("oni.about", null, null, () => showAboutMessage()),

        new CallbackCommand("oni.quit", null, null, () => remote.app.quit()),

        // Debug
        new CallbackCommand("oni.debug.openDevTools", "Open DevTools", "Debug Oni and any running plugins using the Chrome developer tools", () => remote.getCurrentWindow().webContents.openDevTools()),
        new CallbackCommand("oni.debug.reload", "Reload Oni", "Reloads the Oni instance. You will lose all unsaved changes", () => remote.getCurrentWindow().reload()),

        new CallbackCommand("oni.editor.maximize", "Maximize Window", "Maximize the current window", () => remote.getCurrentWindow().maximize()),

        new CallbackCommand("oni.editor.minimize", "Minimize Window", "Minimize the current window", () => remote.getCurrentWindow().minimize()),

        new CallbackCommand("oni.editor.hide", "Hide Window", "Hide the current window", () => remote.app.hide()),

        new CallbackCommand("oni.process.cycleNext", "Focus Next Oni", "Switch to the next running instance of Oni", () => multiProcess.focusNextInstance()),
        new CallbackCommand("oni.process.cyclePrevious", "Focus Previous Oni", "Switch to the previous running instance of Oni", () => multiProcess.focusPreviousInstance()),

        new CallbackCommand("commands.show", null, null, () => tasks.show()),

        // Autocompletion
        // Menu
        new CallbackCommand("menu.close", null, null, popupMenuClose),
        new CallbackCommand("menu.next", null, null, popupMenuNext),
        new CallbackCommand("menu.previous", null, null, popupMenuPrevious),
        new CallbackCommand("menu.select", null, null, popupMenuSelect),

        // QuickOpen
        new CallbackCommand("window.moveLeft", null, null, () => windowManager.moveLeft()),
        new CallbackCommand("window.moveRight", null, null, () => windowManager.moveRight()),
        new CallbackCommand("window.moveDown", null, null, () => windowManager.moveDown()),
        new CallbackCommand("window.moveUp", null, null, () => windowManager.moveUp()),

        // Add additional commands here
        // ...
    ]

    // TODO: once implementations of this command work on all platforms, remove the exclusive check for OSX
    if (Platform.isMac()) {
        const addToPathCommand = new CallbackCommand("oni.editor.removeFromPath", "Remove from PATH", "Disable executing 'oni' from terminal", Platform.removeFromPath, () => Platform.isAddedToPath())
        addToPathCommand.messageSuccess = "Oni has been removed from the $PATH"

        const removeFromPathCommand = new CallbackCommand("oni.editor.addToPath", "Add to PATH", "Enable executing 'oni' from terminal", Platform.addToPath, () => !Platform.isAddedToPath())
        removeFromPathCommand.messageSuccess = "Oni has been added to the $PATH"

        commands.push(addToPathCommand)
        commands.push(removeFromPathCommand)
    }

    commands.forEach((c) => commandManager.registerCommand(c))
}

