/**
 * Script for demo on Oni's website
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { remote } from "electron"

export const test = async (oni: any) => {
    const shortDelay = async () => oni.automation.sleep(500)

    const longDelay = async () => oni.automation.sleep(1000)

    const simulateTyping = async (keys: string) => {
        for (const key of keys) {
            oni.automation.sendKeysV2(key)
            await oni.automation.sleep(50 + Math.random() * 25)
        }
    }

    // Set window size
    // remote.getCurrentWindow().setSize(640, 480)
    oni.recorder.startRecording()

    await simulateTyping(":tabnew Hello.md")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping("iHello and welcome to Oni!")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping(
        "Oni is a new kind of editor: combining the best of Vim, Atom, and VSCode.",
    )

    oni.automation.sendKeysV2("<esc>")
    await simulateTyping(":vsp VIM.md")
    oni.automation.sendKeysV2("<cr>")

    await simulateTyping("o")
    await simulateTyping("Use your vim muscle memory...")

    oni.automation.sendKeysV2("<esc>")

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-h>")
    await shortDelay()

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-h>")
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

    oni.automation.sendKeysV2("<c-w>")
    oni.automation.sendKeysV2("<c-l>")
    await shortDelay()

    await simulateTyping("o")
    await simulateTyping("..but enjoy other conveniences:")
    oni.automation.sendKeysV2("<esc>")

    oni.automation.sendKeysV2("<c-g>")
    await shortDelay()
    await simulateTyping("AC")

    oni.automation.sendKeysV2("<c-g>")
    await shortDelay()
    await simulateTyping("AB")

    oni.automation.sendKeysV2("<esc>")

    await simulateTyping(":sp test.js")

    await simulateTyping("o")
    await simulateTyping(
        "// Oni is integrated with language services to give you great out-of-the-box functionality for web dev:",
    )
    await simulateTyping("window.")

    await simulateTyping("<esc>")
    await simulateTyping("<C-w>h")

    await simulateTyping("o")
    await simulateTyping("- Use the built in command palette to discover functionality")

    await simulateTyping("<C-S-P>")
    await simulateTyping("<esc>")

    await shortDelay()
}
