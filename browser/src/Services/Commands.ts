/**
 * Commands.ts
 *
 * Built-in Oni Commands
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import { clipboard, remote } from "electron"

import { INeovimInstance } from "./../neovim"
import { PluginManager } from "./../Plugins/PluginManager"

import { AutoCompletion } from "./../Services/AutoCompletion"
import { BufferUpdates } from "./../Services/BufferUpdates"
import { configuration } from "./../Services/Configuration"
import { Formatter } from "./../Services/Formatter"
import { multiProcess } from "./../Services/MultiProcess"
import { QuickOpen } from "./../Services/QuickOpen"
import { tasks } from "./../Services/Tasks"
import { windowManager } from "./../Services/WindowManager"

import * as UI from "./../UI/index"

import { CallbackCommand, CommandManager } from "./CommandManager"

import * as Platform from "./../Platform"
import { replaceAll } from "./../Utility"

export const registerBuiltInCommands = (commandManager: CommandManager, pluginManager: PluginManager, neovimInstance: INeovimInstance, bufferUpdates: BufferUpdates) => {
    const autoCompletion = new AutoCompletion(neovimInstance)
    const quickOpen = new QuickOpen(neovimInstance, bufferUpdates)
    const formatter = new Formatter(neovimInstance, pluginManager, bufferUpdates)

    const commands = [
        new CallbackCommand("editor.clipboard.paste", "Clipboard: Paste", "Paste clipboard contents into active text", () => pasteContents(neovimInstance)),
        new CallbackCommand("editor.clipboard.yank", "Clipboard: Yank", "Yank contents to clipboard", () => neovimInstance.input("y")),

        // Debug
        new CallbackCommand("oni.debug.openDevTools", "Open DevTools", "Debug Oni and any running plugins using the Chrome developer tools", () => remote.getCurrentWindow().webContents.openDevTools()),
        new CallbackCommand("oni.debug.reload", "Reload Oni", "Reloads the Oni instance. You will lose all unsaved changes", () => remote.getCurrentWindow().reload()),

        new CallbackCommand("oni.editor.maximize", "Maximize Window", "Maximize the current window", () => remote.getCurrentWindow().maximize()),

        // Language service
        new CallbackCommand("oni.editor.gotoDefinition", "Goto Definition", "Goto definition using a language service", () => pluginManager.gotoDefinition()),
        new CallbackCommand("oni.editor.findAllReferences", "Find All References", "Find all references using a language service", () => pluginManager.findAllReferences()),

        // Menu commands
        new CallbackCommand("oni.config.openConfigJs", "Edit Oni Config", "Edit configuration file ('config.js') for Oni", () => openDefaultConfig(neovimInstance)),

        new CallbackCommand("oni.config.openInitVim", "Edit Neovim Config", "Edit configuration file ('init.vim') for Neovim", () => neovimInstance.open("$MYVIMRC")),

        new CallbackCommand("oni.openFolder", "Open Folder", "Set a folder as the working directory for Oni", () => openFolder(neovimInstance)),

        new CallbackCommand("oni.process.cycleNext", "Focus Next Oni", "Switch to the next running instance of Oni", () => multiProcess.focusNextInstance()),
        new CallbackCommand("oni.process.cyclePrevious", "Focus Previous Oni", "Switch to the previous running instance of Oni", () => multiProcess.focusPreviousInstance()),

        new CallbackCommand("language.formatter.formatDocument", "Format Document", "Use the language service to auto-format the document", () => formatter.formatBuffer()),

        new CallbackCommand("commands.show", null, null, () => tasks.show()),

        // Autocompletion
        new CallbackCommand("completion.complete", null, null, autoCompletionCommand(() => autoCompletion.complete())),
        new CallbackCommand("completion.next", null, null, nextCompletionItem),
        new CallbackCommand("completion.previous", null, null, previousCompletionItem),

        // Menu
        new CallbackCommand("menu.close", null, null, popupMenuClose),
        new CallbackCommand("menu.next", null, null, popupMenuNext),
        new CallbackCommand("menu.previous", null, null, popupMenuPrevious),

        // QuickOpen
        new CallbackCommand("quickOpen.show", null, null, () => quickOpen.show()),
        new CallbackCommand("quickOpen.showBufferLines", null, null, () => quickOpen.showBufferLines()),
        new CallbackCommand("quickOpen.openFile", null, null, quickOpenFile),
        new CallbackCommand("quickOpen.openFileNewTab", null, null, quickOpenFileNewTab),
        new CallbackCommand("quickOpen.openFileVertical", null, null, quickOpenFileVertical),
        new CallbackCommand("quickOpen.openFileHorizontal", null, null, quickOpenFileHorizontal),

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

/**
 * Higher-order function for commands dealing with completion
 * - checks that the completion menu is open
 */
const autoCompletionCommand = (innerCommand: Oni.ICommandCallback) => {
    return () => {
        if (UI.Selectors.areCompletionsVisible()) {
            return innerCommand()
        }

        return false
    }
}

const nextCompletionItem = autoCompletionCommand(() => {
    UI.Actions.nextCompletion()
})

const previousCompletionItem = autoCompletionCommand(() => {
    UI.Actions.previousCompletion()
})

const popupMenuCommand = (innerCommand: Oni.ICommandCallback) => {
    return () => {
        if (UI.Selectors.isPopupMenuOpen()) {
            return innerCommand()
        }

        return false
    }
}

const popupMenuClose = popupMenuCommand(() => UI.Actions.hidePopupMenu())
const popupMenuNext = popupMenuCommand(() => UI.Actions.nextMenuItem())
const popupMenuPrevious = popupMenuCommand(() => UI.Actions.previousMenuItem())

const quickOpenFile = popupMenuCommand(() => UI.Actions.selectMenuItem("e"))
const quickOpenFileNewTab = popupMenuCommand(() => UI.Actions.selectMenuItem("tabnew"))
const quickOpenFileHorizontal = popupMenuCommand(() => UI.Actions.selectMenuItem("sp"))
const quickOpenFileVertical = popupMenuCommand(() => UI.Actions.selectMenuItem("vsp"))

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
    await neovimInstance.open(configuration.userJsConfig)
    const buf = await neovimInstance.getCurrentBuffer()
    const lineCount = await buf.getLineCount()

    if (lineCount === 1) {
        const defaultConfigJsPath = path.join(__dirname, "configuration", "config.default.js")
        const defaultConfigLines = fs.readFileSync(defaultConfigJsPath, "utf8").split(os.EOL)
        await buf.setLines(0, defaultConfigLines.length, false, defaultConfigLines)
    }
}
