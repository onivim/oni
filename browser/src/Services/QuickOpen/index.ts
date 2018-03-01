export * from "./QuickOpen"

import * as Oni from "oni-api"

import { CommandManager } from "./../CommandManager"
import { EditorManager } from "./../EditorManager"
import { MenuManager } from "./../Menu"
import { Workspace } from "./../Workspace"

import { QuickOpen } from "./QuickOpen"

let _quickOpen: QuickOpen = null

export const activate = (
    commandManager: CommandManager,
    menuManager: MenuManager,
    editorManager: EditorManager,
    workspace: Workspace,
) => {
    const shouldShowMenu = () => {
        return !menuManager.isMenuOpen()
    }

    const isOpen = () => _quickOpen.isOpen()

    _quickOpen = new QuickOpen(commandManager, editorManager, menuManager, workspace)

    commandManager.registerCommand({
        command: "quickOpen.show",
        name: null,
        detail: null,
        execute: () => _quickOpen.show(),
        enabled: shouldShowMenu,
    })

    commandManager.registerCommand({
        command: "quickOpen.showBufferLines",
        name: null,
        detail: null,
        execute: () => _quickOpen.showBufferLines(),
        enabled: shouldShowMenu,
    })

    commandManager.registerCommand({
        command: "quickOpen.openFileNewTab",
        name: null,
        detail: null,
        execute: () => _quickOpen.openFile(Oni.FileOpenMode.NewTab),
        enabled: isOpen,
    })

    commandManager.registerCommand({
        command: "quickOpen.openFileExistingTab",
        name: null,
        detail: null,
        execute: () => _quickOpen.openFile(Oni.FileOpenMode.ExistingTab),
        enabled: isOpen,
    })

    commandManager.registerCommand({
        command: "quickOpen.openFileVertical",
        name: null,
        detail: null,
        execute: () => _quickOpen.openFile(Oni.FileOpenMode.VerticalSplit),
        enabled: isOpen,
    })

    commandManager.registerCommand({
        command: "quickOpen.openFileHorizontal",
        name: null,
        detail: null,
        execute: () => _quickOpen.openFile(Oni.FileOpenMode.HorizontalSplit),
        enabled: isOpen,
    })
}
