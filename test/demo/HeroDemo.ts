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

    const disableKeyDisplayer = async (func: () => Promise<void>) => {
        oni.commands.executeCommand("keyDisplayer.hide")
        await func()
        oni.commands.executeCommand("keyDisplayer.show")
    }

    // Set window size
    remote.getCurrentWindow().setSize(1280, 1024)
    oni.recorder.startRecording()

    oni.commands.executeCommand("keyDisplayer.show")

    await simulateTyping(":tabnew Hello.md")
    oni.automation.sendKeysV2("<cr>")

    await disableKeyDisplayer(async () => {
        await simulateTyping("iHello and welcome to Oni!")
        oni.automation.sendKeysV2("<cr>")

        await simulateTyping(
            "Oni is a new kind of editor: combining the best of Vim, Atom, and VSCode.",
        )
        oni.automation.sendKeysV2("<cr>")
        await simulateTyping(
            "Built with web tech, featuring a high performance canvas renderer, with (neo)vim handling the heavy lifting.",
        )
        oni.automation.sendKeysV2("<cr>")
    })

    oni.automation.sendKeysV2("<esc>")
    await simulateTyping(":sp VIM.md")
    oni.automation.sendKeysV2("<cr>")

    await disableKeyDisplayer(async () => {
        await simulateTyping("i")
        await simulateTyping("Use your vim muscle memory...")
    })

    oni.automation.sendKeysV2("<esc>")

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-h>")
    await shortDelay()

    oni.automation.sendKeysV2("G")
    await longDelay()
    oni.automation.sendKeysV2("gg")
    await longDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-h>")
    await shortDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-l>")
    await shortDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-l>")
    await shortDelay()

    await disableKeyDisplayer(async () => {
        await simulateTyping("o")
        await simulateTyping("..but enjoy the conveniences of a modern UI editor.")
        oni.automation.sendKeysV2("<esc>")
    })

    await shortDelay()
    oni.automation.sendKeysV2("<c-g>")
    await shortDelay()
    await simulateTyping("a")
    await shortDelay()
    await simulateTyping("c")

    oni.automation.sendKeysV2("<c-g>")
    await shortDelay()
    await simulateTyping("a")
    await shortDelay()
    await simulateTyping("b")
    await shortDelay()

    oni.automation.sendKeysV2("<esc>")

    await simulateTyping(":close")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping(":tabnew test.js")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping("i")
    await disableKeyDisplayer(async () => {
        await simulateTyping("// Oni is integrated with language services for web dev,")
        oni.automation.sendKeysV2("<cr>")
        await simulateTyping("but you can hook up your own, too!")
        await shortDelay()

        oni.automation.sendKeysV2("<cr>")
        oni.automation.sendKeysV2("<c-w>")
        await shortDelay()
        await simulateTyping("window.", 100)
    })

    await oni.automation.waitFor(() => getCompletionElement() != null)

    await simulateTyping("sTou", 150)
    oni.automation.sendKeysV2("<cr>")
    await shortDelay()
    oni.automation.sendKeysV2("(")
    await shortDelay()
    oni.automation.sendKeysV2("<esc>")

    await longDelay()
    await simulateTyping("gT")
    await longDelay()

    await simulateTyping("o")
    await disableKeyDisplayer(async () => {
        await simulateTyping("Enjoy built in search with ripgrep..")
    })

    oni.automation.sendKeysV2("<esc>")

    oni.automation.sendKeysV2("<c-s-f>")
    await shortDelay()
    await simulateTyping("OniEditor")
    await longDelay()
    oni.automation.sendKeysV2("<cr>")
    await longDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-k>")

    await simulateTyping("o")
    await disableKeyDisplayer(async () => {
        await simulateTyping("...or the embedded file finder.")
        await shortDelay()
    })

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
    await disableKeyDisplayer(async () => {
        await simulateTyping("...use the built in command palette to discover functionality.")
    })
    oni.automation.sendKeysV2("<esc>")
    await shortDelay()
    oni.automation.sendKeysV2("<c-s-p>")
    await shortDelay()

    await simulateTyping("config")
    await longDelay()
    oni.automation.sendKeysV2("<cr>")

    await longDelay()

    oni.automation.sendKeysV2("/")
    await shortDelay()
    simulateTyping("fontSize")
    await shortDelay()
    oni.automation.sendKeysV2("<cr>")

    await longDelay()
    simulateTyping("fp")
    await longDelay()
    simulateTyping("ciw")
    await longDelay()
    simulateTyping("14px")
    await longDelay()
    oni.automation.sendKeysV2("<esc>")
    await shortDelay()
    simulateTyping(":s")
    oni.automation.sendKeysV2("<cr>")

    await longDelay()
    simulateTyping(":new")
    await shortDelay()
    simulateTyping("i")
    await disableKeyDisplayer(async () => {
        simulateTyping("Lots more coming soon...")
        oni.automation.sendKeysV2("<cr>")
        simulateTyping("Live Preview")
        oni.automation.sendKeysV2("<cr>")
        simulateTyping("Integrated Browser")
        oni.automation.sendKeysV2("<cr>")
        simulateTyping("Interactive Tutorial")
        oni.automation.sendKeysV2("<cr>")
        simulateTyping(
            "Thanks for watching! Check it today, start contributing, and help us get to a new level of productivity.",
        )
    })

    await shortDelay()
}

export const settings = {
    config: {
        "tabs.mode": "tabs",
        "ui.colorscheme": "nord",
        "editor.fontSize": "11px",
    },
}
