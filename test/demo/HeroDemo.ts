/**
 * Script for demo on Oni's website
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import { remote } from "electron"

export const test = async (oni: any) => {
    const shortDelay = async () => await oni.automation.sleep(500)

    const longDelay = async () => await oni.automation.sleep(1000)

    const simulateTyping = async (keys: string) => {
        for (const key of keys) {
            oni.automation.sendKeys(key)
            await oni.automation.sleep(75 + Math.random() * 25)
        }
    }

    // Set window size
    // remote.getCurrentWindow().setSize(640, 480)
    oni.recorder.startRecording()

    await simulateTyping(":e HelloWorld.ts")
    oni.automation.sendKeys("<CR>")

    await shortDelay()

    oni.automation.sendKeys("i")
    await simulateTyping('const greeting = "Hello World";')

    oni.automation.sendKeys("<CR>")

    await simulateTyping('greeting = "Hello again";')

    await shortDelay()

    oni.automation.sendKeys("<ESC>")

    await shortDelay()

    oni.automation.sendKeys("_")

    await longDelay()

    oni.automation.sendKeys("I")
    await simulateTyping("const ")
    oni.automation.sendKeys("<esc>")
    oni.automation.sendKeys("e")
    await simulateTyping("a2")
    oni.automation.sendKeys("<esc>")
    oni.automation.sendKeys("<esc>")

    await longDelay()

    oni.automation.sendKeys("o")
    await simulateTyping("window.a")
    await longDelay()

    await simulateTyping("lert(greeting)")
}
