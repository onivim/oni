/**
 * ConfigurationCommands
 */

import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import { CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"

import { getUserConfigFilePath } from "./index"

export const activate = (commandManager: CommandManager, editorManager: EditorManager) => {
    const openDefaultConfig = async (): Promise<void> => {
        const activeEditor = editorManager.activeEditor
        const buf = await activeEditor.openFile(getUserConfigFilePath())
        const lineCount = buf.lineCount

        if (lineCount === 1) {
            const defaultConfigJsPath = path.join(__dirname, "configuration", "config.default.js")
            const defaultConfigLines = fs.readFileSync(defaultConfigJsPath, "utf8").split(os.EOL)
            await buf.setLines(0, defaultConfigLines.length, defaultConfigLines)
        }
    }

    commandManager.registerCommand({
        command: "oni.config.openConfigJs",
        name: "Configuration: Edit User Config",
        detail: "Edit user configuration file for Oni",
        execute: () => openDefaultConfig(),
    })
}
