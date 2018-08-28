/**
 * GlobalCommands.ts
 *
 * Built-in, general Oni commands, that are not specific
 * to an editor or service.
 */

import { remote } from "electron"

import * as Oni from "oni-api"

import {
    getAllErrorsForFile,
    getInstance as getDiagnosticsInstance,
} from "./../../Services/Diagnostics"
import { EditorManager } from "./../../Services/EditorManager"
import { MenuManager } from "./../../Services/Menu"
import { showAboutMessage } from "./../../Services/Metadata"
import { multiProcess } from "./../../Services/MultiProcess"
import { Tasks } from "./../../Services/Tasks"
import { windowManager } from "./../../Services/WindowManager"
import { isInRange } from "./../../Utility"

// import * as UI from "./../UI/index"

import { CallbackCommand, CommandManager } from "./../CommandManager"

import * as Platform from "./../../Platform"

export const activate = (
    commandManager: CommandManager,
    editorManager: EditorManager,
    menuManager: MenuManager,
    tasks: Tasks,
) => {
    tasks.registerTaskProvider(commandManager)

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

    const gotoNextError = async () => {
        const errors = getDiagnosticsInstance().getErrors()
        const activeBuffer = editorManager.activeEditor.activeBuffer
        const currentFileErrors = getAllErrorsForFile(activeBuffer.filePath, errors)
        const currentPosition = activeBuffer.cursor

        if (!currentFileErrors || currentFileErrors.length === 0) {
            return
        }

        for (const error of currentFileErrors) {
            if (isInRange(currentPosition.line, currentPosition.column, error.range)) {
                continue
            }

            const currentLine = (await activeBuffer.getLines(currentPosition.line))[0]
            if (
                currentPosition.line === error.range.start.line &&
                currentLine.length <= error.range.start.character
            ) {
                continue
            }

            if (
                error.range.start.line > currentPosition.line ||
                (error.range.start.line === currentPosition.line &&
                    error.range.start.character > currentPosition.column)
            ) {
                await activeBuffer.setCursorPosition(
                    error.range.start.line,
                    error.range.start.character,
                )
                return
            }
        }

        activeBuffer.setCursorPosition(
            currentFileErrors[0].range.start.line,
            currentFileErrors[0].range.start.character,
        )
    }

    const gotoPreviousError = async () => {
        const errors = getDiagnosticsInstance().getErrors()
        const activeBuffer = editorManager.activeEditor.activeBuffer
        const currentFileErrors = getAllErrorsForFile(activeBuffer.filePath, errors)
        const currentPosition = activeBuffer.cursor

        if (!currentFileErrors || currentFileErrors.length === 0) {
            return
        }

        let lastError = currentFileErrors[currentFileErrors.length - 1]
        for (const error of currentFileErrors) {
            if (
                isInRange(currentPosition.line, currentPosition.column, error.range) ||
                error.range.start.line > currentPosition.line ||
                (error.range.start.line === currentPosition.line &&
                    error.range.start.character > currentPosition.column)
            ) {
                await activeBuffer.setCursorPosition(
                    lastError.range.start.line,
                    lastError.range.start.character,
                )
                return
            }
            lastError = error
        }

        activeBuffer.setCursorPosition(lastError.range.start.line, lastError.range.start.character)
    }

    const commands = [
        new CallbackCommand("editor.executeVimCommand", null, null, (message: string) => {
            const neovim = editorManager.activeEditor.neovim
            if (message.startsWith(":")) {
                neovim.command('exec "' + message + '"')
            } else {
                neovim.command('exec ":normal! ' + message + '"')
            }
        }),
        new CallbackCommand("oni.about", null, null, () => showAboutMessage()),

        new CallbackCommand("oni.process.openWindow", "New Window", "Open a new window", () =>
            multiProcess.openNewWindow(),
        ),

        new CallbackCommand(
            "oni.editor.maximize",
            "Maximize Window",
            "Maximize the current window",
            () => remote.getCurrentWindow().maximize(),
        ),

        new CallbackCommand(
            "oni.editor.minimize",
            "Minimize Window",
            "Minimize the current window",
            () => remote.getCurrentWindow().minimize(),
        ),

        new CallbackCommand("oni.editor.hide", "Hide Window", "Hide the current window", () =>
            remote.app.hide(),
        ),

        new CallbackCommand(
            "oni.process.cycleNext",
            "Focus Next Oni",
            "Switch to the next running instance of Oni",
            () => multiProcess.focusNextInstance(),
        ),
        new CallbackCommand(
            "oni.process.cyclePrevious",
            "Focus Previous Oni",
            "Switch to the previous running instance of Oni",
            () => multiProcess.focusPreviousInstance(),
        ),

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

        // Error list
        new CallbackCommand(
            "oni.editor.nextError",
            "Jump to next lint/compiler error",
            "Jump to the next error or warning from the linter or compiler",
            gotoNextError,
        ),
        new CallbackCommand(
            "oni.editor.previousError",
            "Jump to previous lint/compiler error",
            "Jump to the previous error or warning from the linter or compiler",
            gotoPreviousError,
        ),

        // Add additional commands here
        // ...
    ]

    // TODO: once implementations of this command work on all platforms, remove the exclusive check for OSX
    if (Platform.isMac()) {
        const addToPathCommand = new CallbackCommand(
            "oni.editor.removeFromPath",
            "Remove from PATH",
            "Disable executing 'oni' from terminal",
            Platform.removeFromPath,
            () => Platform.isAddedToPath(),
        )
        addToPathCommand.messageSuccess = "Oni has been removed from the $PATH"

        const removeFromPathCommand = new CallbackCommand(
            "oni.editor.addToPath",
            "Add to PATH",
            "Enable executing 'oni' from terminal",
            Platform.addToPath,
            () => !Platform.isAddedToPath(),
        )
        removeFromPathCommand.messageSuccess = "Oni has been added to the $PATH"

        commands.push(addToPathCommand)
        commands.push(removeFromPathCommand)
    }

    commands.forEach(c => commandManager.registerCommand(c))
}
