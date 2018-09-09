import * as Oni from "oni-api"

import { QuickOpen } from "./QuickOpen"

let _instance: QuickOpen = null

function registerCommands(oni: Oni.Plugin.Api) {
    const shouldShowMenu = () => {
        return !oni.menu.isMenuOpen()
    }

    const isOpen = () => _instance.isOpen()

    oni.commands.registerCommand({
        command: "quickOpen.searchFileByContent",
        name: null,
        detail: null,
        execute: _instance.searchFileByContent,
        enabled: shouldShowMenu,
    })

    oni.commands.registerCommand({
        command: "quickOpen.searchFileByPath",
        name: null,
        detail: null,
        execute: _instance.searchFileByPath,
        enabled: shouldShowMenu,
    })

    oni.commands.registerCommand({
        command: "quickOpen.show",
        name: null,
        detail: null,
        execute: _instance.searchFileByPath,
        enabled: shouldShowMenu,
    })

    oni.commands.registerCommand({
        command: "quickOpen.showBookmarks",
        name: null,
        detail: null,
        execute: _instance.showBookmarks,
        enabled: shouldShowMenu,
    })

    oni.commands.registerCommand({
        command: "quickOpen.showBufferLines",
        name: null,
        detail: null,
        execute: _instance.showBufferLines,
        enabled: shouldShowMenu,
    })

    oni.commands.registerCommand({
        command: "quickOpen.openFileNewTab",
        name: null,
        detail: null,
        execute: () => _instance.open(Oni.FileOpenMode.NewTab),
        enabled: isOpen,
    })

    oni.commands.registerCommand({
        command: "quickOpen.openFileAlternative",
        name: null,
        detail: null,
        execute: _instance.openFileWithAltAction,
        enabled: isOpen,
    })

    oni.commands.registerCommand({
        command: "quickOpen.openFileVertical",
        name: null,
        detail: null,
        execute: () => _instance.open(Oni.FileOpenMode.VerticalSplit),
        enabled: isOpen,
    })

    oni.commands.registerCommand({
        command: "quickOpen.openFileHorizontal",
        name: null,
        detail: null,
        execute: () => _instance.open(Oni.FileOpenMode.HorizontalSplit),
        enabled: isOpen,
    })

    oni.commands.registerCommand({
        command: "quickOpen.setToQuickFix",
        name: null,
        detail: null,
        execute: _instance.setToQuickFix,
        enabled: isOpen,
    })
}

export function activate(oni: Oni.Plugin.Api) {
    if (!_instance) {
        _instance = new QuickOpen(oni)
        registerCommands(oni)
    }

    return _instance
}
