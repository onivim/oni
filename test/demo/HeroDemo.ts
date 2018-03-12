/**
 * Script for demo on Oni's website
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { getCompletionElement, getTemporaryFolder } from "./../ci/Common"

import { getDistPath } from "./DemoCommon"

import { remote } from "electron"

const EmptyConfigPath = path.join(getTemporaryFolder(), "config.js")

const BASEDELAY = 25
const RANDOMDELAY = 15

export const test = async (oni: any) => {
    await oni.automation.waitForEditors()

    const isMac = process.platform === "darwin"

    const shortDelay = async () => oni.automation.sleep(BASEDELAY * 25)
    const longDelay = async () => oni.automation.sleep(BASEDELAY * 50)

    const simulateTyping = async (keys: string, baseDelay: number = BASEDELAY) => {
        for (const key of keys) {
            oni.automation.sendKeysV2(key)
            await oni.automation.sleep(baseDelay + Math.random() * RANDOMDELAY)
        }
        await shortDelay()
    }

    const disableKeyDisplayer = async (func: () => Promise<void>) => {
        oni.commands.executeCommand("keyDisplayer.hide")
        await func()
        oni.commands.executeCommand("keyDisplayer.show")
    }

    const pressEscape = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<esc>")
        await shortDelay()
    }

    const pressTab = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<tab>")
        await shortDelay()
    }

    const pressShiftTab = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<s-tab>")
        await shortDelay()
    }

    const pressEnter = async () => {
        await shortDelay()
        oni.automation.sendKeysV2("<cr>")
        await shortDelay()
    }

    const openCommandPalette = async () => {
        await shortDelay()
        const keys = isMac ? "<m-s-p>" : "<c-s-p>"
        oni.automation.sendKeysV2(keys)
        await shortDelay()
    }

    const openFindInFiles = async () => {
        await shortDelay()
        const keys = isMac ? "<m-s-f>" : "<c-s-f>"
        oni.automation.sendKeysV2(keys)
        await shortDelay()
    }

    const openQuickOpen = async () => {
        await shortDelay()
        const keys = isMac ? "<m-p>" : "<c-p>"
        oni.automation.sendKeysV2(keys)
        await shortDelay()
    }

    const showConfig = async () => {
        await pressEscape()
        await openCommandPalette()

        await simulateTyping("configuser")
        await longDelay()
        await pressEnter()

        await longDelay()

        oni.automation.sendKeysV2("/")
        await shortDelay()
        await simulateTyping("fontSize")
        await shortDelay()
        oni.automation.sendKeysV2("<cr>")

        await shortDelay()
        await simulateTyping("gcc")
        await shortDelay
        await simulateTyping("fp")
        await longDelay()
        await simulateTyping("ciw")
        await longDelay()
        await simulateTyping("15px")
        await pressEscape()
        await simulateTyping(":w")
        await pressEscape()

        // HACK - Configuration doesn't use the same file, so we need to set this directly here
        oni.configuration.setValues({ "editor.fontSize": "15px" })

        await longDelay()
        await simulateTyping("b")
        await longDelay()
        await simulateTyping("ciw")
        await longDelay()
        await simulateTyping("12px")
        await pressEscape()
        await simulateTyping(":w")
        await pressEnter()
        oni.configuration.setValues({ "editor.fontSize": "12px" })
        await longDelay()
        await pressEscape()

        await simulateTyping("gg")
        oni.automation.sendKeysV2("/")
        await shortDelay()
        await simulateTyping("activate")
        await pressEnter()
        await simulateTyping("n")

        await simulateTyping("o")
        await pressEnter()
        await simulateTyping("// We can also use Oni's extensibility API here!")
        await pressEnter()
        await simulateTyping("Let's add a status bar item")
        await pressEnter()
        oni.automation.sendKeysV2("<c-w>")
        await pressEnter()

        await simulateTyping("const statusBarItem = oni.s")
        await shortDelay()
        await simulateTyping("tatusBar.c")
        await shortDelay()
        await simulateTyping("reateItem(1)")
        await pressEnter()
        await simulateTyping("statusBarItem.s")
        await shortDelay()
        await simulateTyping("etContents(")
        await shortDelay()
        oni.automation.sendKeys("<lt>")
        await simulateTyping("div>Hello World")
        oni.automation.sendKeys("<lt>")
        await simulateTyping("/div>)")
        await pressEnter()
        await simulateTyping("statusBarItem.")
        await shortDelay()
        await simulateTyping("show()")
        await pressEnter()

        await pressEscape()
        await simulateTyping(":w")
        await pressEnter()

        const item = oni.statusBar.createItem(1)
        item.setContents("Hello World")
        item.show()

        await longDelay()
    }

    const showComingSoon = async () => {
        await shortDelay()
        await simulateTyping(":tabnew SOON.md")
        await shortDelay()
        await pressEnter()
        await shortDelay()
        await simulateTyping("i")
        await disableKeyDisplayer(async () => {
            await simulateTyping("Lots more coming...")
            await pressEnter()
            await simulateTyping("Live Preview")
            await pressEnter()
            await simulateTyping("Integrated Browser")
            await pressEnter()
            await simulateTyping("Interactive Tutorial")
            await longDelay()
            await pressEnter()
            await pressEnter()
            await simulateTyping("Thanks for watching! Download Oni today.")
        })

        await pressEscape()
    }

    const showLanguageServices = async () => {
        await simulateTyping(":tabnew test.js")
        oni.automation.sendKeysV2("<cr>")

        await simulateTyping("i")
        await disableKeyDisplayer(async () => {
            await simulateTyping("// Oni integrates with language servers, and includes several...")
            oni.automation.sendKeysV2("<cr>")
            await simulateTyping("...but you can hook up your own, too!")
            await shortDelay()

            oni.automation.sendKeysV2("<cr>")
            oni.automation.sendKeysV2("<c-w>")
            await shortDelay()
            await simulateTyping("const myArray = [1, 2, 3]")

            await pressEnter()
            await pressEnter()
            await pressEscape()

            await simulateTyping("O")
            await simulateTyping("myArray.")

            await simulateTyping("m")
            await longDelay()
            await simulateTyping("ap(")
            await longDelay()
            await simulateTyping("(val => val + 1")

            await pressEscape()
            await simulateTyping("o")
            await pressEnter()
            await simulateTyping("// Oni also has snippet support:")
            await pressEnter()
            oni.automation.sendKeysV2("<c-w>")
            await pressEnter()

            await simulateTyping("forsnip")
            await pressEnter()

            await pressTab()
            await pressShiftTab()

            await simulateTyping("idx")
            await pressTab()
            await simulateTyping("myArray")
            await pressTab()
            await pressTab()
            await pressEscape()
        })
    }

    // Set window size
    remote.getCurrentWindow().setSize(1280, 720)

    // Disable notifications, since there is sometimes noise... (HACK)
    oni.notifications.disable()

    oni.recorder.startRecording()

    oni.commands.executeCommand("keyDisplayer.show")

    await simulateTyping(":tabnew Hello.md")
    await pressEnter()

    await disableKeyDisplayer(async () => {
        await simulateTyping("iHello and welcome to Oni!")
        await pressEnter()

        await simulateTyping(
            "Oni is a new kind of editor: combining the best of Vim, Atom, and VSCode.",
        )
        await pressEnter()
        await simulateTyping(
            "Built with web tech, featuring a high performance canvas renderer, with (neo)vim handling the heavy lifting.",
        )
        await pressEnter()
        await simulateTyping("Available for Windows, OSX, and Linux.")
        await pressEnter()
    })

    await pressEscape()
    await simulateTyping(":sp VIM.md")
    await pressEnter()

    await disableKeyDisplayer(async () => {
        await simulateTyping("i")
        await simulateTyping("Use your Vim muscle memory to be productive without a mouse...")
    })

    await pressEscape()

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
        await pressEscape()
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

    // ---
    await showLanguageServices()
    // ---

    await simulateTyping("gT")

    await simulateTyping("o")
    await disableKeyDisplayer(async () => {
        await simulateTyping("Enjoy built in search with ripgrep..")
    })

    await pressEscape()

    await openFindInFiles()
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

    await pressEscape()
    await shortDelay()
    await openQuickOpen()
    await simulateTyping("NeovimEditor")
    await shortDelay()
    oni.automation.sendKeysV2("<cr>")
    await longDelay()
    oni.automation.sendKeysV2("<c-o>")
    await shortDelay()

    await simulateTyping("G")
    await simulateTyping("o")
    await disableKeyDisplayer(async () => {
        await simulateTyping("...use the built in command palette to discover functionality.")
    })
    await pressEscape()

    await showConfig()
    await showComingSoon()

    await simulateTyping(":q")
    await longDelay()

    oni.configuration.setValues({ "recorder.outputPath": getDistPath() })
    oni.recorder.stopRecording(`demo-${process.platform}.webm`)

    await pressEscape()
}

export const settings = {
    configPath: EmptyConfigPath,
}
