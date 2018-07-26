/**
 * Test the Markdown-preview plugin
 */

import { Assertor } from "./Assert"
import {
    awaitEditorMode,
    getElementByClassName,
    getTemporaryFilePath,
    insertText,
    navigateToFile,
} from "./Common"

import * as Oni from "oni-api"

interface IMarkdownPreviewPlugin {
    isPaneOpen(): boolean
    getUnrenderedContent(): string
    getRenderedContent(): string
    toggle(): void
}

export const settings = {
    config: {
        "experimental.markdownPreview.enabled": true,
    },
}

export async function test(oni: Oni.Plugin.Api) {
    const assert = new Assertor("Markdown-preview")

    await oni.automation.waitForEditors()

    // Wait for Plugin to be loaded
    await oni.automation.waitFor(() => oni.plugins.loaded)
    const markdownPlugin = oni.plugins.getPlugin(
        "oni-plugin-markdown-preview",
    ) as IMarkdownPreviewPlugin
    assert.defined(markdownPlugin, "plugin instance")

    // Check its not open by default
    assert.assert(!markdownPlugin.isPaneOpen(), "Preview pane is initially closed.")

    // Check it opens when navigating into a markdown file.
    const markdownFilePath = getTemporaryFilePath("md")
    await navigateToFile(markdownFilePath, oni)
    await oni.automation.waitFor(() => markdownPlugin.isPaneOpen())

    assert.isEmpty(
        markdownPlugin.getUnrenderedContent().trim(),
        "Preview pane shown for Markdown buffer.",
    )

    // Check a Title is rendered correctly.
    await insertText(oni, "# Title 1")
    assert.contains(
        markdownPlugin.getRenderedContent(),
        ">Title 1</h1>",
        "Preview pane with renders header element.",
    )

    // Check syntax highlights are applied.
    oni.automation.sendKeys("o")
    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "insert")

    oni.automation.sendKeys("```<enter>")
    oni.automation.sendKeys("const test = 'Oni'<enter>")
    oni.automation.sendKeys("```")
    oni.automation.sendKeys("<esc>")

    await oni.automation.waitFor(() => oni.editors.activeEditor.mode === "normal")

    assert.contains(
        markdownPlugin.getRenderedContent(),
        "code>",
        "Code block present in preview HTML.",
    )

    assert.assert(
        getElementByClassName("hljs-keyword").innerText === "const",
        "Syntax highlights present in preview HTML.",
    )

    // Finally, test swapping between files.
    // Swapping to a non-MD file should close it.
    // Swapping to an MD file should open it.
    // Closing the MD preview manually should cause it to remain closed.

    const nonMDFilePath = getTemporaryFilePath("ts")

    await navigateToFile(nonMDFilePath, oni)
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.language === "typescript",
    )
    assert.assert(!markdownPlugin.isPaneOpen(), "Preview pane is closed for non-MD file.")

    await navigateToFile(markdownFilePath, oni)
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.language === "markdown",
    )
    assert.assert(markdownPlugin.isPaneOpen(), "Preview pane opens for MD file.")

    // Manually closing preview, should remain closed now.
    markdownPlugin.toggle()
    assert.assert(!markdownPlugin.isPaneOpen(), "Preview pane closes on toggle.")

    await navigateToFile(nonMDFilePath, oni)
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.language === "typescript",
    )
    await navigateToFile(markdownFilePath, oni)
    await oni.automation.waitFor(
        () => oni.editors.activeEditor.activeBuffer.language === "markdown",
    )

    // Should remain closed when swapping back in.
    assert.assert(
        !markdownPlugin.isPaneOpen(),
        "Preview pane remains closed for MD file when manually closed.",
    )
}
