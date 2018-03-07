/**
 * Terminal.ts
 *
 * Helper / convenience commands for Neovim's integrated terminal experience
 */

import * as Oni from "oni-api"

import { CommandManager } from "./CommandManager"
import { Configuration } from "./Configuration"
import { EditorManager } from "./EditorManager"

export const activate = (
    commandManager: CommandManager,
    configuration: Configuration,
    editorManager: EditorManager,
) => {
    const getTerminalCommand = () => {
        const terminalCommand = configuration.getValue("terminal.shellCommand", "")
        return `term://${terminalCommand}`
    }

    const openTerminal = (openMode: Oni.FileOpenMode) => {
        editorManager.activeEditor.openFile(getTerminalCommand(), { openMode })
    }

    commandManager.registerCommand({
        command: "terminal.openInVerticalSplit",
        name: "Terminal: Open Vertical",
        detail: "Open a terminal emulator in a vertical split",
        execute: () => openTerminal(Oni.FileOpenMode.VerticalSplit),
    })

    commandManager.registerCommand({
        command: "terminal.openInHorizontalSplit",
        name: "Terminal: Open Horizontal",
        detail: "Open a terminal emulator in a horizontal split",
        execute: () => openTerminal(Oni.FileOpenMode.HorizontalSplit),
    })
}
