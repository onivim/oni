/**
 * AutoClosingPairs
 *
 * Service to enable auto-indent
 */

import * as Oni from "oni-api"

import { IBuffer } from "./../Editor/BufferManager"
import { Configuration } from "./Configuration"
import { EditorManager } from "./EditorManager"

import * as Log from "./../Log"

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

    // TODO: Factor this to an API on the Editor:
    // - setExpandTab(true / false)
    // - setTabSpaces(number)
    const setNeovimTabSettings = (
        useSpaces: boolean | null,
        spaceCount: number | null,
        neovim: Oni.NeovimEditorCapability,
    ) => {
        if (typeof useSpaces === "boolean") {
            Log.info(`[Indentation] Setting useSpaces: ${useSpaces}`)

            if (!useSpaces) {
                neovim.command("set noexpandtab")
            } else {
                neovim.command("set expandtab")
            }
        }

        if (typeof spaceCount === "number") {
            Log.info(`[Indentation] Setting spaceCount: ${spaceCount}`)
            neovim.command(
                `set tabstop=${spaceCount} shiftwidth=${spaceCount} softtabstop=${spaceCount}`,
            )
        }
    }

    editorManager.anyEditor.onBufferEnter.subscribe(async bufEnter => {
        const currentBuffer = editorManager.activeEditor.activeBuffer as IBuffer

        if (!currentBuffer) {
            return
        }

        if (autoDetectIndentationSetting.getValue()) {
            const settings = await currentBuffer.detectIndentation()
            setNeovimTabSettings(
                settings.type === "space",
                settings.amount,
                editorManager.activeEditor.neovim,
            )
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

            setNeovimTabSettings(expandTab, spaceCount, editorManager.activeEditor.neovim)
        }
    })
}
