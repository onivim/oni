/**
 * Test the Markdown-preview plugin
 */

// import * as stock_assert from "assert"
import * as os from "os"
import { Assertor } from "./Assert"
import { createNewFile, getTemporaryFilePath, navigateToFile } from "./Common"

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
                editorConfig: true,
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

    await insertText(oni, "function(){console.log('test')}")

    await oni.automation.waitFor(() => oni.plugins.loaded)
    const prettierPlugin: IPrettierPlugin = oni.plugins.getPlugin("oni-plugin-prettier")
    assert.defined(prettierPlugin, "plugin instance")

    const { activeBuffer } = oni.editors.activeEditor
    // assert.assert(
    //     prettierPlugin.isCompatible(activeBuffer),
    //     "If valid filetype prettier plugin check should return true",
    // )

    // await prettierPlugin.applyPrettier()

    oni.automation.sendKeys(":")
    oni.automation.sendKeys("w")
    oni.automation.sendKeys("<CR>")

    await oni.automation.sleep(5000)
    const bufferText = await activeBuffer.getLines()
    // stock_assert.equal(
    //     bufferText.join(os.EOL),
    //     `function(){${os.EOL}   console.log('test')${os.EOL} };`,
    //     "Formatted buffer",
    // )
}

async function awaitEditorMode(oni: Oni.Plugin.Api, mode: string): Promise<void> {
    function condition(): boolean {
        return oni.editors.activeEditor.mode === mode
    }
    await oni.automation.waitFor(condition)
}

async function insertText(oni: Oni.Plugin.Api, text: string): Promise<void> {
    oni.automation.sendKeys("i")
    await awaitEditorMode(oni, "insert")
    oni.automation.sendKeys(`${text}<ESC>`)
    await awaitEditorMode(oni, "normal")
}
