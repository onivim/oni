/**
 * AutoClosingPairs
 *
 * Service to enable auto-closing pair key bindings
 */

import * as Oni from "oni-api"

import { Configuration } from "./Configuration"
import { EditorManager } from "./EditorManager"
import { InputManager } from "./InputManager"
import { LanguageManager } from "./Language"

import { PromiseQueue } from "./Language/PromiseQueue"

import * as Log from "./../Log"

export interface IAutoClosingPair {
    open: string
    close: string
    // TODO: Support `notIn` equivalent
}

export const activate = (configuration: Configuration, editorManager: EditorManager, inputManager: InputManager, languageManager: LanguageManager) => {

    const insertModeFilter = () => editorManager.activeEditor.mode === "insert"

    let subscriptions: Oni.DisposeFunction[] = []

    // Use a queue to order requests - since there is latency between entering the '()'
    // and resolving the cursor position, we can run into issues when a key is held down.
    const queue = new PromiseQueue()

    const handleOpenCharacter = (pair: IAutoClosingPair, editor: Oni.Editor) => () => {

        queue.enqueuePromise(async () => {
            const neovim = editor.neovim

            // TODO: PERFORMANCE: Look at how to collapse this instead of needed multiple asynchronous calls.
            await neovim.input(pair.open + pair.close)

            const pos = await neovim.callFunction("getpos", ["."])
            const [, oneBasedLine, oneBasedColumn] = pos
            await editor.activeBuffer.setCursorPosition(oneBasedLine - 1, oneBasedColumn - 2)
        })

        return true
    }

    const handleCloseCharacter = (pair: IAutoClosingPair, editor: Oni.Editor) => () => {

        queue.enqueuePromise(async () => {
            const activeBuffer = editor.activeBuffer
            const lines = await activeBuffer.getLines(activeBuffer.cursor.line, activeBuffer.cursor.line + 1)
            const line = lines[0]
            if (line[activeBuffer.cursor.column] === pair.close) {
                await activeBuffer.setCursorPosition(activeBuffer.cursor.line, activeBuffer.cursor.column + 1)
            } else {
                await editor.neovim.input(pair.close)
            }
        })

        return true
    }

    editorManager.activeEditor.onBufferEnter.subscribe((newBuffer) => {

        if (!configuration.getValue("experimental.autoClosingPairs.enabled")) {
            Log.verbose("[Auto Closing Pairs] Not enabled.")
            return
        }

        if (subscriptions && subscriptions.length) {
            subscriptions.forEach((df) => df())
        }

        subscriptions = []

        const autoClosingPairs = getAutoClosingPairs(configuration, newBuffer.language)

        autoClosingPairs.forEach((pair) => {
            subscriptions.push(inputManager.bind(pair.open, handleOpenCharacter(pair, editorManager.activeEditor), insertModeFilter))
            subscriptions.push(inputManager.bind(pair.close, handleCloseCharacter(pair, editorManager.activeEditor), insertModeFilter))
        })

    })
}

const getAutoClosingPairs = (configuration: Configuration, language: string): IAutoClosingPair[] => {
    const languagePairs = configuration.getValue(`language.${language}.autoClosingPairs`)

    if (languagePairs) {
        return languagePairs
    } else {
        return configuration.getValue("experimental.autoClosingPairs.default") || []
    }
}
