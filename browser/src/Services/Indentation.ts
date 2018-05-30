/**
 * AutoClosingPairs
 *
 * Service to enable auto-indent
 */

import { IBuffer } from "./../Editor/BufferManager"
import { Configuration } from "./Configuration"
import { EditorManager } from "./EditorManager"

export const activate = (configuration: Configuration, editorManager: EditorManager) => {
    const autoDetectIndentationSetting = configuration.registerSetting("editor.detectIndentation", {
        description:
            "When set to true, upon entering a buffer, the indentation settings will be automatically set based on the contents of the buffer",
        defaultValue: false,
    })

    configuration.registerSetting<number | null>("editor.tabSize", {
        description:
            "The number of spaces a 'tab' is equal to. If not set, this will defer to Neovim's configuration. Note that you can also set per-language tabSizes by 'editor.<language>.tabSize', for example, 'editor.javascript.tabSize'",
        defaultValue: null,
    })

    configuration.registerSetting<boolean | null>("editor.insertSpaces", {
        description:
            "Insert space characters when pressing Tab. If not set, this will defer to Neovim's configuration. Note that you can also set this per-language by 'editor.<language>.insertSpaces', for example, 'editor.javascript.insertSpaces'",
        defaultValue: null,
    })

    editorManager.anyEditor.onBufferEnter.subscribe(async bufEnter => {
        const editor = editorManager.activeEditor
        const currentBuffer = editor.activeBuffer as IBuffer

        if (!currentBuffer) {
            return
        }

        if (autoDetectIndentationSetting.getValue()) {
            const settings = await currentBuffer.detectIndentation()

            editor.setTextOptions({
                insertSpacesForTab: settings.type === "space",
                tabSize: settings.type === "space" ? settings.amount : null,
            })
        } else {
            const baseExpandTab = configuration.getValue(`editor.insertSpaces`, null)
            const expandTab = configuration.getValue(
                `editor.${bufEnter.language}.insertSpaces`,
                baseExpandTab,
            )

            const baseSpaceCount = configuration.getValue(`editor.tabSize`, null)
            const spaceCount = configuration.getValue(
                `editor.${bufEnter.language}.tabSize`,
                baseSpaceCount,
            )

            editor.setTextOptions({
                insertSpacesForTab: expandTab,
                tabSize: spaceCount,
            })
        }
    })
}
