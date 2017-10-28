/**
 * KeyBindings.ts
 *
 * Default, out-of-the-box keybindings for Oni
 */

import * as Platform from "./../Platform"
import { Configuration } from "./../Services/Configuration"

export const applyDefaultKeyBindings = (oni: Oni.Plugin.Api, config: Configuration): void => {
    const { editors, input, menu } = oni

    input.unbindAll()

    const isVisualMode = () => editors.activeEditor.mode === "visual"
    const isNormalMode = () => editors.activeEditor.mode === "normal"
    const isInsertOrCommandMode = () => editors.activeEditor.mode === "insert" || editors.activeEditor.mode === "cmdline_normal"

    const isMenuOpen = () => menu.isMenuOpen()

    if (Platform.isMac()) {
        input.bind("<m-q>", "oni.quit")
        input.bind("<m-p>", "quickOpen.show")
        input.bind("<m-s-p>", "commands.show")

        if (config.getValue("editor.clipboard.enabled")) {
            input.bind("<m-c>", "editor.clipboard.yank", isVisualMode)
            input.bind("<m-v>", "editor.clipboard.paste", isInsertOrCommandMode)
        }
    } else {
        input.bind("<a-f4>", "oni.quit")
        input.bind("<c-p>", "quickOpen.show", () => isNormalMode() && !isMenuOpen())
        input.bind("<s-c-p>", "commands.show", isNormalMode)

        if (config.getValue("editor.clipboard.enabled")) {
            input.bind("<c-c>", "editor.clipboard.yank", isVisualMode)
            input.bind("<c-v>", "editor.clipboard.paste", isInsertOrCommandMode)
        }
    }

    input.bind("<f3>", "language.formatter.formatDocument")
    input.bind("<f12>", "oni.editor.gotoDefinition")
    input.bind("<c-pageup>", "oni.process.cyclePrevious")
    input.bind("<c-pagedown>", "oni.process.cycleNext")

    // QuickOpen
    input.bind("<c-/>", "quickOpen.showBufferLines", isNormalMode)
    input.bind("<c-v>", "quickOpen.openFileVertical")
    input.bind("<c-s>", "quickOpen.openFileHorizontal")
    input.bind("<c-t>", "quickOpen.openFileNewTab")

    // Completion
    input.bind(["<enter>", "<tab>"], "completion.complete")
    input.bind(["<down>", "<C-n>"], "completion.next")
    input.bind(["<up>", "<C-p>"], "completion.previous")

    // Menu
    input.bind(["<down>", "<C-n>"], "menu.next")
    input.bind(["<up>", "<C-p>"], "menu.previous")
    input.bind(["<esc>", "<C-[>", "<C-C>"], "menu.close")
    input.bind("<enter>", "menu.select")
}
