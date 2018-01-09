/**
 * Commands.ts
 *
 * Built-in Oni Commands
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import { clipboard, remote } from "electron"

import * as Oni from "oni-api"

import { INeovimInstance } from "./../neovim"

import { configuration } from "./../Services/Configuration"
import { editorManager } from "./../Services/EditorManager"
import { findAllReferences, format } from "./../Services/Language"
import { menuManager } from "./../Services/Menu"
import { showAboutMessage } from "./../Services/Metadata"
import { multiProcess } from "./../Services/MultiProcess"
import { QuickOpen } from "./../Services/QuickOpen"
import { tasks } from "./../Services/Tasks"
import { windowManager } from "./../Services/WindowManager"

// import * as UI from "./../UI/index"

import { CallbackCommand, CommandManager } from "./CommandManager"

import * as Platform from "./../Platform"
import { replaceAll } from "./../Utility"

export const registerBuiltInCommands = (commandManager: CommandManager, neovimInstance: INeovimInstance) => {
    const quickOpen = new QuickOpen(neovimInstance)

    const commands = [
        new CallbackCommand("editor.clipboard.paste", "Clipboard: Paste", "Paste clipboard contents into active text", () => pasteContents(neovimInstance)),
        new CallbackCommand("editor.clipboard.yank", "Clipboard: Yank", "Yank contents to clipboard", () => neovimInstance.input("y")),

        new CallbackCommand("oni.about", null, null, () => showAboutMessage()),

        new CallbackCommand("oni.quit", null, null, () => remote.app.quit()),

        // Debug
        new CallbackCommand("oni.debug.openDevTools", "Open DevTools", "Debug Oni and any running plugins using the Chrome developer tools", () => remote.getCurrentWindow().webContents.openDevTools()),
        new CallbackCommand("oni.debug.reload", "Reload Oni", "Reloads the Oni instance. You will lose all unsaved changes", () => remote.getCurrentWindow().reload()),

        new CallbackCommand("oni.editor.maximize", "Maximize Window", "Maximize the current window", () => remote.getCurrentWindow().maximize()),

        new CallbackCommand("oni.editor.minimize", "Minimize Window", "Minimize the current window", () => remote.getCurrentWindow().minimize()),

        new CallbackCommand("oni.editor.hide", "Hide Window", "Hide the current window", () => remote.app.hide()),

        // Language service
        // TODO: Deprecate
        new CallbackCommand("oni.editor.findAllReferences", null, null, () => findAllReferences()),
        new CallbackCommand("language.findAllReferences", "Find All References", "Find all references using a language service", () => findAllReferences()),

        // new CallbackCommand("language.codeAction.expand", null, null, () => expandCodeActions()),

        // MUSTFIX: Switch to contextual editor commands
        // new CallbackCommand("language.rename", null, null, () => startRename()),
        // new CallbackCommand("language.rename.commit", null, null, () => commitRename(), isRenameActive),
        // new CallbackCommand("language.rename.cancel", null, null, () => cancelRename(), isRenameActive),

        new CallbackCommand("language.format", null, null, () => format()),

        // Menu commands
        new CallbackCommand("oni.config.openConfigJs", "Edit Oni Config", "Edit configuration file ('config.js') for Oni", () => openDefaultConfig(neovimInstance)),

        new CallbackCommand("oni.config.openInitVim", "Edit Neovim Config", "Edit configuration file ('init.vim') for Neovim", () => neovimInstance.openInitVim()),

        new CallbackCommand("oni.openFolder", "Open Folder", "Set a folder as the working directory for Oni", () => openFolder(neovimInstance)),

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
        new CallbackCommand("quickOpen.show", null, null, () => quickOpen.show(), shouldShowMenu),
        new CallbackCommand("quickOpen.showBufferLines", null, null, () => quickOpen.showBufferLines()),
        new CallbackCommand("quickOpen.openFileNewTab", null, null, quickOpenFileNewTab(quickOpen)),
        new CallbackCommand("quickOpen.openFileVertical", null, null, quickOpenFileVertical(quickOpen)),
        new CallbackCommand("quickOpen.openFileHorizontal", null, null, quickOpenFileHorizontal(quickOpen)),

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

const shouldShowMenu = () => {
    return !menuManager.isMenuOpen()
}

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

const quickOpenCommand = (innerCommand: Oni.Commands.CommandCallback) => (quickOpen: QuickOpen) => {
    return () => {
        if (quickOpen.isOpen()) {
            return innerCommand(quickOpen)
        }

        return false
    }
}

const quickOpenFileNewTab = quickOpenCommand((quickOpen: QuickOpen) => quickOpen.openFileNewTab())
const quickOpenFileHorizontal = quickOpenCommand((quickOpen: QuickOpen) => quickOpen.openFileHorizontal())
const quickOpenFileVertical = quickOpenCommand((quickOpen: QuickOpen) => quickOpen.openFileVertical())

const pasteContents = async (neovimInstance: INeovimInstance) => {
    const textToPaste = clipboard.readText()
    const sanitizedText = replaceAll(textToPaste, { "<": "<lt>" })
                            .split(os.EOL)
                            .join("<cr>")

    await neovimInstance.command("set paste")
    await neovimInstance.input(sanitizedText)
    await neovimInstance.command("set nopaste")
}

const openFolder = (neovimInstance: INeovimInstance) => {
    const dialogOptions: any = {
        title: "Open Folder",
        properties: ["openDirectory"],
    }

    remote.dialog.showOpenDialog(remote.getCurrentWindow(), dialogOptions, (folder: string[]) => {
        if (!folder || !folder[0]) {
            return
        }

        const folderToOpen = folder[0]
        neovimInstance.chdir(folderToOpen)
    })
}

const openDefaultConfig = async (neovimInstance: INeovimInstance): Promise<void> => {

    const activeEditor = editorManager.activeEditor
    const buf = await activeEditor.openFile(configuration.userJsConfig)
    const lineCount = buf.lineCount

    if (lineCount === 1) {
        const defaultConfigJsPath = path.join(__dirname, "configuration", "config.default.js")
        const defaultConfigLines = fs.readFileSync(defaultConfigJsPath, "utf8").split(os.EOL)
        await buf.setLines(0, defaultConfigLines.length, defaultConfigLines)
    }
}
