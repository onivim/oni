/**
 * Test script to validate the window title is rendered
 */

import * as assert from "assert"
import * as os from "os"

import { createNewFile } from "./Common"

export const test = async (oni: any) => {
    await oni.automation.waitForEditors()

    // Create a file that doesn't have a language associated with it, to minimize noise
    await createNewFile("test_file", oni)

    // Validate that the titlebar element eventually shows ONI + the file name
    await oni.automation.waitFor(() => {
        const titleBar = document.getElementById("oni-titlebar")
        return (
            titleBar.textContent.indexOf("ONI") >= 0 &&
            titleBar.textContent.indexOf("test_file") >= 0
        )
    })
}
