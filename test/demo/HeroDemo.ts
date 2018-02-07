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
            await oni.automation.sleep(75 + Math.random() * 25)
        }
    }

    // Set window size
    // remote.getCurrentWindow().setSize(640, 480)
    oni.recorder.startRecording()

    await simulateTyping(":new Hello.md")
    await simulateTyping("iHello and welcome to Oni!")
    oni.automation.sendKeys("<CR>")
    await simulateTyping(
        "Oni is a new kind of editor - bringing together the best of (neo)vim, Atom, and VSCode.",
    )
    await simulateTyping("Oni is built to maximize your productivity.")

    await simulateTyping("Being based on Vim, Oni can be used without a mouse.")
    await simulateTyping("<C-w>h")
    await simulateTyping("<C-w>h")
    await simulateTyping("<C-w>j")
    await simulateTyping("<C-w>k")
    await simulateTyping("<C-w>l")
    await simulateTyping("<C-w>l")

    await simulateTyping("You can press Control+G to get anywhere quickly.")
    await simulateTyping("<C-g>AB")
    await simulateTyping("<C-g>AA")

    await simulateTyping("And you can use all of your favorite Vim features.")
    await simulateTyping(":vsp testFile.ts")

    await simulateTyping(
        "// Oni is integrated with language services to give you great out-of-the-box functionality for web dev:",
    )
    await simulateTyping("window.")

    await simulateTyping("<esc>")
    await simulateTyping("<C-w>h")

    await simulateTyping(
        "- Oni is also easy to configure, and features a reactive configuration model.",
    )
    await simulateTyping(
        "- You can use the built-in command palette to discover functionality. Let's edit our config!",
    )

    await simulateTyping("<C-S-P>")
    await simulateTyping("Edit Oni<CR>")

    // Change colorscheme
    // Change font size

    // Control+Tab -> WELCOME.md

    await shortDelay()
}
