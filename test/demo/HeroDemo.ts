/**
 * Script for demo on Oni's website
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { getCompletionElement } from "./../ci/Common"

import { remote } from "electron"

export const test = async (oni: any) => {
    await oni.automation.waitForEditors()

    const shortDelay = async () => oni.automation.sleep(500)

    const longDelay = async () => oni.automation.sleep(1000)

    const simulateTyping = async (keys: string, baseDelay: number = 50) => {
        for (const key of keys) {
            oni.automation.sendKeysV2(key)
            await oni.automation.sleep(baseDelay + Math.random() * 25)
        }
        await shortDelay()
    }

    // Set window size
    remote.getCurrentWindow().setSize(1280, 1024)
    oni.recorder.startRecording()

    oni.commands.executeCommand("keyDisplayer.show")

    await shortDelay()
    oni.automation.sendKeysV2("<c-s-p>")
    await shortDelay()

    await simulateTyping("config")
    await shortDelay()
    await shortDelay()
    await shortDelay()
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping(":tabnew Hello.md")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping("iHello and welcome to Oni!")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping(
        "Oni is a new kind of editor: combining the best of Vim, Atom, and VSCode.",
    )
    oni.automation.sendKeysV2("<cr>")
    await simulateTyping(
        "Built with web tech, featuring a high performance canvas renderer, with (neo)vim under the hood to handle the heavy lifting.",
    )
    oni.automation.sendKeysV2("<cr>")

    oni.automation.sendKeysV2("<esc>")
    await simulateTyping(":sp VIM.md")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping("i")
    await simulateTyping("Use your vim muscle memory...")

    oni.automation.sendKeysV2("<esc>")

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-h>")
    await shortDelay()

    oni.automation.sendKeysV2("G")
    await shortDelay()
    oni.automation.sendKeysV2("gg")
    await shortDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-h>")
    await shortDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-l>")
    await shortDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-l>")
    await shortDelay()

    await simulateTyping("o")
    await simulateTyping("..but enjoy the conveniences of a modern UI editor:")
    oni.automation.sendKeysV2("<esc>")

    await shortDelay()

    oni.automation.sendKeysV2("<c-g>")
    await shortDelay()
    await simulateTyping("a")
    await simulateTyping("b")

    oni.automation.sendKeysV2("<c-g>")
    await shortDelay()
    await simulateTyping("a")
    await simulateTyping("a")
    await shortDelay()

    oni.automation.sendKeysV2("<esc>")

    await simulateTyping(":sp test.js")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping(":bdel! VIM.md")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping("i")
    await simulateTyping("// Oni is integrated with language services for web dev,")
    oni.automation.sendKeysV2("<cr>")
    await simulateTyping("but you can hook up your own, too!")
    await shortDelay()

    oni.automation.sendKeysV2("<cr>")
    oni.automation.sendKeysV2("<c-w>")
    await shortDelay()
    await simulateTyping("window.", 200)

    await oni.automation.waitFor(() => getCompletionElement() != null)

    await simulateTyping("sTou", 150)
    oni.automation.sendKeysV2("<cr>")
    await shortDelay()
    oni.automation.sendKeysV2("(")
    await shortDelay()
    oni.automation.sendKeysV2("<esc>")

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-k>")

    await simulateTyping("o")
    await simulateTyping("Enjoy built in search with ripgrep..")

    oni.automation.sendKeysV2("<esc>")

    /*oni.automation.sendKeysV2("<c-s-f>")
    await shortDelay()
    await simulateTyping("OniEditor")
    await longDelay()
    oni.automation.sendKeysV2("<cr>")*/
    await longDelay()

    await simulateTyping(":close")
    oni.automation.sendKeysV2("<cr>")

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-k>")

    await simulateTyping("o")
    await simulateTyping("...or the embedded file finder.")
    await shortDelay()

    oni.automation.sendKeysV2("<esc>")
    await shortDelay()
    oni.automation.sendKeysV2("<c-p>")
    await simulateTyping("NeovimEditor")
    await shortDelay()
    oni.automation.sendKeysV2("<cr>")
    await longDelay()
    oni.automation.sendKeysV2("<c-o>")
    await shortDelay()

    await simulateTyping("o")
    await simulateTyping("...use the built in command palette to discover functionality.")
    oni.automation.sendKeysV2("<esc>")
    await shortDelay()
    oni.automation.sendKeysV2("<c-s-p>")
    await shortDelay()

    await simulateTyping("config")
    await shortDelay()
    await shortDelay()
    await shortDelay()
    oni.automation.sendKeysV2("<cr>")

    await longDelay()
    await longDelay()
    await longDelay()

    // await simulateTyping("o")
    // await simulateTyping("- Use the built in command palette to discover functionality")

    // await simulateTyping("<C-S-P>")
    // await simulateTyping("<esc>")

    await shortDelay()
}

export const settings = {
    config: {
        "tabs.mode": "tabs",
        "ui.colorscheme": "nord",
        "editor.fontSize": "11px",
    },
}
