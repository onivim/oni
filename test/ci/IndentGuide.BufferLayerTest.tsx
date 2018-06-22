/**
 * Test script for the Indent Lines Layer.
 */

import * as assert from "assert"
import * as os from "os"
import * as path from "path"

import * as Oni from "oni-api"

import { createNewFile } from "./Common"

const testStr = `
    function doThing() {
        thingOne();
        thingTwo();
    }

    const X = a + b
    const Y = c - d
`

const getIndentLines = () => document.querySelectorAll("[data-id='indent-line']")

export const test = async (oni: Oni.Plugin.Api) => {
    await oni.automation.waitForEditors()

    await createNewFile("js", oni, testStr)

    const elements = getIndentLines()

    const element = elements[0]

    assert.ok(element, "Validate an indent line is present in the layer")

    // Render the same test string in an incompatible buffer and plugin should not render
    await createNewFile("md", oni, testStr)
    const markdownIndents = getIndentLines()

    assert.ok(markdownIndents.length === 0, "No indents are rendered in an incompatible file")
}

export const settings = {
    config: {
        "oni.useDefaultConfig": true,
        "oni.loadInitVim": false,
        "experimental.indentLines.enabled": true,
        "experimental.indentLines.filetypes": [
            ".tsx",
            ".ts",
            ".jsx",
            ".js",
            ".go",
            ".re",
            ".py",
            ".c",
            ".cc",
            ".lua",
            ".java",
        ],
        "_internal.hasCheckedInitVim": true,
    },
}
