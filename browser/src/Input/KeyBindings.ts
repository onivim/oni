/**
 * KeyBindings.ts
 *
 * Default, out-of-the-box keybindings for Oni
 */

import * as Platform from "./../Platform"
import { Configuration } from "./../Services/Configuration"

export const applyDefaultKeyBindings = (oni: Oni.Plugin.Api, config: Configuration): void => {

    const { editors, input } = oni

    input.unbindAll()

    const isVisualMode = () => editors.activeEditor.mode === "visual"
    const isNormalMode = () => editors.activeEditor.mode === "normal"
    const isInsertOrCommandMode = () => editors.activeEditor.mode === "insert" || editors.activeEditor.mode === "cmdline_normal"

    if (Platform.isLinux() || Platform.isWindows()) {
        if (config.getValue("editor.clipboard.enabled")) {
            input.bind("<C-c>", "editor.clipboard.yank", isVisualMode)
            input.bind("<C-v>", "editor.clipboard.paste", isInsertOrCommandMode)
        }
    } else {
        if (config.getValue("editor.clipboard.enabled")) {
            input.bind("<M-c>", "editor.clipboard.yank", isVisualMode)
            input.bind("<M-v>", "editor.clipboard.paste", isInsertOrCommandMode)
        }
    }

    input.bind("<f3>", "language.formatter.formatDocument")
    input.bind("<f12>", "oni.editor.gotoDefinition")
    input.bind("<S-C-P>", "commands.show", isNormalMode)
    input.bind("<C-pageup>", "oni.process.cyclePrevious")
    input.bind("<C-pagedown>", "oni.process.cycleNext")

    // QuickOpen
    input.bind("<C-p>", "quickOpen.show", isNormalMode)
    input.bind("<C-/>", "quickOpen.showBufferLines", isNormalMode)
    input.bind("<enter>", "quickOpen.openFile")
    input.bind("<C-v>", "quickOpen.openFileVertical")
    input.bind("<C-s>", "quickOpen.openFileHorizontal")
    input.bind("<C-t>", "quickOpen.openFileNewTab")

    // Completion
    input.bind(["<enter>", "<tab>"], "completion.complete")
    input.bind(["<down>", "<C-n>"], "completion.next")
    input.bind(["<up>", "<C-p>"], "completion.previous")

    // Menu
    input.bind(["<down>", "<C-n>"], "menu.next")
    input.bind(["<up>", "<C-p>"], "menu.previous")
    input.bind("<esc>", "menu.close")
}
