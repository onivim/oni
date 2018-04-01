/**
 * Test the Prettier plugin
 */

import * as stock_assert from "assert"
import * as os from "os"
import { Assertor } from "./Assert"
import {
    awaitEditorMode,
    createNewFile,
    getElementByClassName,
    getTemporaryFilePath,
    insertText,
} from "./Common"

import * as Oni from "oni-api"

interface IPluginManager {
    getPlugin(name: string): any
}

interface IPrettierPlugin {
    isCompatible(buffer: Oni.Buffer): boolean
    applyPrettier(): void
    checkPrettierrc(): boolean
}

export const settings = {
    config: {
        "oni.useDefaultConfig": true,
        "oni.loadInitVim": false,
        "oni.plugins.prettier": {
            settings: {
                semi: false,
                tabWidth: 2,
                useTabs: false,
                singleQuote: false,
                trailingComma: "es5",
                bracketSpacing: true,
                jsxBracketSameLine: false,
                arrowParens: "avoid",
                printWidth: 80,
            },
            formatOnSave: true,
            enabled: true,
            allowedFiletypes: [".js", ".jsx", ".ts", ".tsx", ".md", ".html", ".json", ".graphql"],
        },
    },
}

export async function test(oni: Oni.Plugin.Api) {
    const assert = new Assertor("Prettier-plugin")

    await oni.automation.waitForEditors()
    await createNewFile("ts", oni)

    await insertText(oni, "function test(){console.log('test')};")

    await oni.automation.waitFor(() => oni.plugins.loaded)

    // Test that the prettier status bar item is present
    const prettierElement = getElementByClassName("prettier")
    assert.defined(prettierElement, "Prettier status icon element is present")

    const prettierPlugin: IPrettierPlugin = await oni.plugins.getPlugin("oni-plugin-prettier")
    assert.defined(prettierPlugin, "plugin instance")
    assert.defined(prettierPlugin.applyPrettier, "plugin formatting method")

    const { activeBuffer } = oni.editors.activeEditor
    assert.assert(
        prettierPlugin.isCompatible(activeBuffer),
        "If valid filetype prettier plugin check should return true",
    )

    // Test that in a Typescript file the plugin formats the buffer on save
    oni.automation.sendKeys("0")
    oni.automation.sendKeys(":")
    oni.automation.sendKeys("w")
    oni.automation.sendKeys("<enter>")

    await oni.automation.sleep(5000)

    const bufferText = await activeBuffer.getLines()
    const bufferString = bufferText.join(os.EOL)
    assert.assert(bufferText.length === 3, "The code is split into 3 lines")
    assert.assert(!bufferString.includes(";"), "Semi colons are removed from the text")
    assert.assert(!bufferString.includes("'"), "Single quotes are removed from the formatted text")
}
