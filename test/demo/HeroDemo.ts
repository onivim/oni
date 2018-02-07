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

    await simulateTyping("iWelcome to Oni")
    oni.automation.sendKeys("<CR>")

    await shortDelay()
}
