/**
 * KeyBindings.ts
 *
 * Default, out-of-the-box keybindings for Oni
 */

import * as Oni from "oni-api"

import * as Platform from "./../Platform"
import { Configuration } from "./../Services/Configuration"

export const applyDefaultKeyBindings = (oni: Oni.Plugin.Api, config: Configuration): void => {
    const { editors, input, menu } = oni

    input.unbindAll()

    const isVisualMode = () => editors.activeEditor.mode === "visual"
    const isNormalMode = () => editors.activeEditor.mode === "normal"
    const isNotInsertMode = () => editors.activeEditor.mode !== "insert"
    const isInsertOrCommandMode = () =>
        editors.activeEditor.mode === "insert" || editors.activeEditor.mode === "cmdline_normal"

    const isMenuOpen = () => menu.isMenuOpen()

    if (Platform.isMac()) {
        input.bind("<m-q>", "oni.quit")
        input.bind("<m-p>", "quickOpen.show")
        input.bind("<m-s-p>", "commands.show")
        input.bind("<m-enter>", "language.codeAction.expand")
        input.bind("<m-t>", "language.symbols.workspace", () => !menu.isMenuOpen())
        input.bind("<s-m-t>", "language.symbols.document")
        input.bind("<m-m>", "oni.editor.minimize")
        input.bind("<m-h>", "oni.editor.hide")
        input.bind("<c-tab>", "buffer.toggle")

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
        input.bind("<c-p>", "quickOpen.show", () => isNormalMode() && !isMenuOpen())
        input.bind("<s-c-p>", "commands.show", isNormalMode)
        input.bind("<a-enter>", "language.codeAction.expand")
        input.bind("<c-t>", "language.symbols.workspace", () => !menu.isMenuOpen())
        input.bind("<s-c-t>", "language.symbols.document")
        input.bind("<c-tab>", "buffer.toggle")

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
    input.bind(["<c-enter", "<C-v>"], "quickOpen.openFileVertical")
    input.bind(["<s-enter", "<C-s>"], "quickOpen.openFileHorizontal")
    input.bind("<C-t>", "quickOpen.openFileNewTab")

    // Completion
    input.bind(["<enter>", "<tab>"], "contextMenu.select")
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

    input.bind("<delete>", "explorer.delete")

    // TODO: Scope 's' to just the local window
    input.bind("<c-g>", "sneak.show", () => isNormalMode() && !menu.isMenuOpen())
    input.bind(["<esc>", "<c-c>"], "sneak.hide")
}
