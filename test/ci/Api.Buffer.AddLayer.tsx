/**
 * Test script for the Oni Layers API, tests the adding of new files and splits.
 */

import * as React from "react"

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

export class TestLayer implements Oni.BufferLayer {
    public get id(): string {
        return "automation.test.layer"
    }

    public render(context: Oni.BufferLayerRenderContext): JSX.Element {
        let className = "test-automation-layer "

        if (context.isActive) {
            className += "active"
        } else {
            className += "inactive"
        }

        const contextAsAny = context as any

        return <div className={className}>{contextAsAny.visibleLines.join(os.EOL)}</div>
    }
}

const getLayerElements = () => {
    return document.querySelectorAll(".test-automation-layer")
}

const getActiveLayerElements = () => {
    return document.querySelectorAll(".test-automation-layer.active")
}

const getInactiveLayerElements = () => {
    return document.querySelectorAll(".test-automation-layer.inactive")
}

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni, "line1\nline2")

    oni.editors.activeEditor.activeBuffer.addLayer(new TestLayer())

    // Wait for layer to appear
    await oni.automation.waitFor(() => getLayerElements().length === 1)

    // Validate the buffer layer has rendered the 'visibleLines'
    const element = getLayerElements()[0]
    assert.ok(element.textContent.indexOf("line1") >= 0, "Validate line1 is present in the layer")
    assert.ok(element.textContent.indexOf("line2") >= 0, "Validate line2 is present in the layer")

    // Validate elements
    assert.strictEqual(getActiveLayerElements().length, 1)
    assert.strictEqual(getInactiveLayerElements().length, 0)

    oni.automation.sendKeys(":vsp<CR>")

    await oni.automation.waitFor(() => getLayerElements().length === 2)

    assert.strictEqual(getActiveLayerElements().length, 1)
    assert.strictEqual(getInactiveLayerElements().length, 1)
}
