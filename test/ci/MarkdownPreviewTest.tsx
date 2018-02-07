/**
 * Test the Markdown-preview plugin
 */

import { Assertor } from "./Assert"
import * as Debug from "./Debug"

import * as Oni from "oni-api"

interface IPluginManager {
    getPlugin(name: string): any
}

interface IOniWithPluginApi {
    plugins: IPluginManager
}

interface IMarkdownPreviewPlugin {
    isPaneOpen(): boolean
    getUnrenderContent(): string
    getRenderedContent(): string
}

export const settings = {
    configPath: "MarkdownPreviewTest.config.js",
}

export async function test(typedOni: Oni.Plugin.Api) {
    const assert = new Assertor("Markdown-preview")

    const typelessOni = typedOni as any
    const oni = typelessOni as IOniWithPluginApi

    await typedOni.automation.waitForEditors()

    const plugins = oni.plugins
    const typelessPluginsManager = plugins as any
    await typedOni.automation.waitFor(() => typelessPluginsManager.loaded)
    const markdownPlugin = plugins.getPlugin(
        "oni-plugin-markdown-preview",
    ) as IMarkdownPreviewPlugin
    assert.defined(markdownPlugin, "plugin instance")

    assert.assert(!markdownPlugin.isPaneOpen(), "Preview pane is not initially closed")

    await openFile(typedOni, "markdown-preview-test.md")
    await typedOni.automation.waitFor(() => markdownPlugin.isPaneOpen())
    assert.isEmpty(
        markdownPlugin.getUnrenderContent().trim(),
        "Preview pane for empty Markdown buffer",
    )

    await insertText(typedOni, "# Title 1")
    assert.contains(
        markdownPlugin.getRenderedContent(),
        ">Title 1</h1>",
        "Preview pane with rendered header element",
    )
}

async function awaitEditorMode(oni: Oni.Plugin.Api, mode: string): Promise<void> {
    function condition(): boolean {
        return oni.editors.activeEditor.mode === mode
    }
    await oni.automation.waitFor(condition)
}

async function openFile(oni: Oni.Plugin.Api, path: string): Promise<void> {
    oni.automation.sendKeys(`:e ${path}<CR>`)
    await oni.automation.waitFor(() =>
        oni.editors.activeEditor.activeBuffer.filePath.trim().endsWith(path),
    )
}

async function insertText(oni: Oni.Plugin.Api, text: string): Promise<void> {
    oni.automation.sendKeys("i")
    await awaitEditorMode(oni, "insert")
    oni.automation.sendKeys(`${text}<ESC>`)
    await awaitEditorMode(oni, "normal")
}
