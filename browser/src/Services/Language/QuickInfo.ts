/**
 * QuickInfo.ts
 *
 */

import * as os from "os"
import * as types from "vscode-languageserver-types"

import { configuration } from "./../Configuration"

import * as UI from "./../../UI"

import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"
import { PluginManager } from "./../../Plugins/PluginManager"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const checkAndShowQuickInfo = async (evt: Oni.EventContext, pluginManager: PluginManager) => {
    if (languageManager.isLanguageServerAvailable(evt.filetype)) {
        const result = await languageManager.sendLanguageServerRequest(evt.filetype, evt.bufferFullPath, "textDocument/hover",
            Helpers.eventContextToTextDocumentPositionParams(evt))

        const titleAndContents = getTitleAndContents(result)

        if (titleAndContents) {
            showQuickInfo(evt, titleAndContents.title, titleAndContents.description)
        }
    } else {
        pluginManager.checkHover(evt)
    }
}

const showQuickInfo = (evt: Oni.EventContext, title: string, contents: string): void => {
    setTimeout(() => {
        UI.Actions.showQuickInfo(evt.bufferFullPath, evt.line, evt.column, title, contents)
    }, configuration.getValue("editor.quickInfo.delay"))
}

const getTitleAndContents = (result: types.Hover) => {
    if (!result || !result.contents) {
        return null
    }

    const contents = Helpers.getTextFromContents(result.contents)

    if (contents.length === 0) {
        return null
    } else if (contents.length === 1 && contents[0]) {
        const title = contents[0].trim()

        if (!title) {
            return null
        }

        return {
            title,
            description: "",
        }
    } else {

        const description = [...contents]
        description.shift()
        const descriptionContent = description.join(os.EOL)

        return {
            title: contents[0],
            description: descriptionContent,
        }
    }
}
