/**
 * KeyBindings.ts
 *
 * Default, out-of-the-box keybindings for Oni
 */

import * as Oni from "oni-api"

import * as Platform from "./../Platform"
import { Configuration } from "./../Services/Configuration"

interface ISidebar {
    sidebar: {
        activeEntryId: string
        isFocused: boolean
    }
}

export const applyDefaultKeyBindings = (oni: Oni.Plugin.Api, config: Configuration): void => {
    const { editors, input, menu } = oni

    input.unbindAll()

    const isVisualMode = () => editors.activeEditor.mode === "visual"
    const isNormalMode = () => editors.activeEditor.mode === "normal"
    const isNotInsertMode = () => editors.activeEditor.mode !== "insert"
    const isInsertOrCommandMode = () =>
        editors.activeEditor.mode === "insert" || editors.activeEditor.mode === "cmdline_normal"

    const oniWithSidebar = oni as Oni.Plugin.Api & ISidebar
    const isSidebarPaneOpen = (paneId: string) =>
        oniWithSidebar.sidebar.activeEntryId === paneId &&
        oniWithSidebar.sidebar.isFocused &&
        !isInsertOrCommandMode() &&
        !isMenuOpen()

    const isExplorerActive = () => isSidebarPaneOpen("oni.sidebar.explorer")
    const isVCSActive = () => isSidebarPaneOpen("oni.sidebar.vcs")

    const isMenuOpen = () => menu.isMenuOpen()

    if (Platform.isMac()) {
        input.bind("<m-q>", "oni.quit")
        input.bind("<m-p>", "quickOpen.show", () => isNormalMode() && !isMenuOpen())
        input.bind("<m-s-p>", "commands.show", isNormalMode)
        input.bind("<m-enter>", "language.codeAction.expand")
        input.bind("<m-t>", "language.symbols.workspace", () => !menu.isMenuOpen())
        input.bind("<s-m-t>", "language.symbols.document")
        input.bind("<m-m>", "oni.editor.minimize")
        input.bind("<m-h>", "oni.editor.hide")
        input.bind("<c-tab>", "buffer.toggle")
        input.bind("<m-s-f>", "search.searchAllFiles")
        input.bind("<m-s-e>", "explorer.toggle")
        input.bind("<m-s-_>", "sidebar.decreaseWidth")
        input.bind("<m-s-+>", "sidebar.increaseWidth")
        input.bind("<m-,>", "oni.config.openConfigJs")

        if (config.getValue("editor.clipboard.enabled")) {
            input.bind("<m-c>", "editor.clipboard.yank", isVisualMode)
            input.bind("<m-v>", "editor.clipboard.paste", isInsertOrCommandMode)
        }

        // Browser
        input.bind("<m-left>", "browser.goBack")
        input.bind("<m-right>", "browser.goForward")
        input.bind("<m-r>", "browser.reload")
    } else {
        input.bind("<a-f4>", "oni.quit")
        input.bind("<s-c-_>", "sidebar.decreaseWidth")
        input.bind("<s-c-+>", "sidebar.increaseWidth")
        input.bind("<c-p>", "quickOpen.show", () => isNormalMode() && !isMenuOpen())
        input.bind("<s-c-p>", "commands.show", isNormalMode)
        input.bind("<a-enter>", "language.codeAction.expand")
        input.bind("<c-t>", "language.symbols.workspace", () => !menu.isMenuOpen())
        input.bind("<s-c-t>", "language.symbols.document")
        input.bind("<c-tab>", "buffer.toggle")
        input.bind("<s-c-f>", "search.searchAllFiles")
        input.bind("<s-c-e>", "explorer.toggle")
        input.bind("<c-,>", "oni.config.openConfigJs")

        if (config.getValue("editor.clipboard.enabled")) {
            input.bind("<c-c>", "editor.clipboard.yank", isVisualMode)
            input.bind("<c-v>", "editor.clipboard.paste", isInsertOrCommandMode)
        }

        // Browser
        input.bind("<a-left>", "browser.goBack")
        input.bind("<a-right>", "browser.goForward")
        input.bind("<f5>", "browser.reload")
    }

    input.bind("<f2>", "editor.rename", () => isNormalMode())

    input.bind("<f3>", "language.format")
    input.bind(["<f12>"], "language.gotoDefinition", () => isNormalMode() && !menu.isMenuOpen())
    input.bind(
        ["<c-enter>", "<c-f12>"],
        "language.gotoDefinition.openVertical",
        () => isNormalMode() && !menu.isMenuOpen(),
    )
    input.bind(
        ["<s-enter>", "<s-f12>"],
        "language.gotoDefinition.openHorizontal",
        () => isNormalMode() && !menu.isMenuOpen(),
    )
    input.bind("<S-C-P>", "commands.show", isNormalMode)
    input.bind("<C-pageup>", "oni.process.cyclePrevious")
    input.bind("<C-pagedown>", "oni.process.cycleNext")

    // QuickOpen
    input.bind("<C-/>", "quickOpen.showBufferLines", isNormalMode)
    input.bind(["<C-v>"], "quickOpen.openFileVertical")
    input.bind(["<C-s>"], "quickOpen.openFileHorizontal")
    input.bind("<C-t>", "quickOpen.openFileNewTab")
    input.bind(["<C-enter>"], "quickOpen.openFileAlternative")

    // Snippets
    input.bind("<tab>", "snippet.nextPlaceholder")
    input.bind("<s-tab>", "snippet.previousPlaceholder")
    input.bind("<esc>", "snippet.cancel")

    // Completion
    input.bind(["<enter>"], "contextMenu.select")
    input.bind(["<down>", "<C-n>"], "contextMenu.next")
    input.bind(["<up>", "<C-p>"], "contextMenu.previous")
    input.bind(
        ["<esc>"],
        "contextMenu.close",
        isNotInsertMode /* In insert mode, the mode change will close the popupmenu anyway */,
    )

    // Menu
    input.bind(["<down>", "<C-n>"], "menu.next")
    input.bind(["<up>", "<C-p>"], "menu.previous")
    input.bind(["<esc>", "<C-[>", "<C-C>"], "menu.close")
    input.bind("<enter>", "menu.select")
    input.bind(["<enter>", "<space>"], "select")

    // TODO: Scope 's' to just the local window
    input.bind("<c-g>", "sneak.show", () => isNormalMode() && !menu.isMenuOpen())
    input.bind(["<esc>", "<c-c>"], "sneak.hide")

    input.bind("<s-c-b>", "sidebar.toggle", isNormalMode)

    // Explorer
    input.bind("d", "explorer.delete.persist", isExplorerActive)
    input.bind("<c-delete>", "explorer.delete.persist", isExplorerActive)
    input.bind("<c-s-d>", "explorer.delete", isExplorerActive)
    input.bind("<delete>", "explorer.delete", isExplorerActive)
    input.bind("y", "explorer.yank", isExplorerActive)
    input.bind("p", "explorer.paste", isExplorerActive)
    input.bind("u", "explorer.undo", isExplorerActive)
    input.bind("h", "explorer.collapse.directory", isExplorerActive)
    input.bind("l", "explorer.expand.directory", isExplorerActive)
    input.bind("r", "explorer.rename", isExplorerActive)
    input.bind("<c-e>", "explorer.create.file", isExplorerActive)
    input.bind("<c-f>", "explorer.create.folder", isExplorerActive)
    input.bind("<c-r>", "explorer.refresh", isExplorerActive)

    // Browser
    input.bind("k", "browser.scrollUp")
    input.bind("j", "browser.scrollDown")
    input.bind("h", "browser.scrollLeft")
    input.bind("l", "browser.scrollRight")

    // VCS
    input.bind("e", "vcs.openFile", isVCSActive)
    input.bind("u", "vcs.unstage", isVCSActive)
    input.bind("<c-r>", "vcs.refresh", isVCSActive)
    input.bind("?", "vcs.showHelp", isVCSActive)
}
