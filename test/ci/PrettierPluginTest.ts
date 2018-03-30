/**
 * Test the Markdown-preview plugin
 */

import { Assertor } from "./Assert"
import { getTemporaryFilePath, navigateToFile } from "./Common"

import * as Oni from "oni-api"

interface IPluginManager {
    getPlugin(name: string): any
}

interface IOniWithPluginApi {
    plugins: IPluginManager
}

interface IPrettierPlugin {
    isStatusIconPresent(): boolean
    applyPrettier(): string
}

export const settings = {
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
        formatOnSave: false,
        enabled: false,
        allowedFiletypes: [".js", ".jsx", ".ts", ".tsx", ".md", ".html", ".json", ".graphql"],
    },
}

export async function test(typedOni: Oni.Plugin.Api) {
    const assert = new Assertor("Prettier-plugin")

    const typelessOni = typedOni as any
    const oni = typelessOni as IOniWithPluginApi

    await typedOni.automation.waitForEditors()

    const plugins = oni.plugins
    const typelessPluginsManager = plugins as any
    await typedOni.automation.waitFor(() => typelessPluginsManager.loaded)
    const prettierPlugin = plugins.getPlugin("oni-plugin-prettier") as IPrettierPlugin
    assert.defined(prettierPlugin, "plugin instance")

    assert.assert(
        !prettierPlugin.isStatusIconPresent(),
        "If valid filetype prettier plugin icon is present",
    )

    await navigateToFile(getTemporaryFilePath("md"), typedOni)
    // await typedOni.automation.waitFor(() => prettierPlugin.isStatusIconPresent())

    // assert.isEmpty(
    //     prettierPlugin.getUnrenderedContent().trim(),
    //     "Preview pane for empty Markdown buffer",
    // )

    await insertText(typedOni, "function(){console.log('test')}")
    assert.contains(
        prettierPlugin.applyPrettier(),
        "function(){\n   console.log('test')\n };",
        "Formatted buffer",
    )
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
