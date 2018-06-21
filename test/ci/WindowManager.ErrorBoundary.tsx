/**
 * Test script to verify per-workspace configuration settings
 */

import * as assert from "assert"
import * as fs from "fs"
import * as os from "os"
import * as path from "path"

import * as mkdirp from "mkdirp"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

export class BadLayer implements Oni.BufferLayer {
    public get id(): string {
        return "automation.test.layer"
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        throw new Error("Bad layer!")
    }
}

const getErrorElements = () => {
    return document.querySelectorAll(".red-error-screen")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni)

    oni.editors.activeEditor.activeBuffer.addLayer(new BadLayer())

    // Wait for error screen to appear
    await oni.automation.waitFor(() => getErrorElements().length === 1)

    // Validate that some details about the error are shown
    const errorElement = getErrorElements()[0]
    const content = errorElement.textContent
    assert.ok(content.indexOf("Bad layer") >= 0)
}

export const settings = {
    allowLogFailures: true,
}
