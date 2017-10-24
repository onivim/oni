/**
 * QuickInfo.ts
 *
 */

import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

import * as UI from "./../../UI"

import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const checkAndShowQuickInfo = async (language: string, filePath: string, line: number, column: number) => {
    if (languageManager.isLanguageServerAvailable(language)) {

        try {
            const result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/hover",
                                                                           {
                textDocument: {
                    uri: Helpers.wrapPathInFileUri(filePath),
                },
                position: {
                    line,
                    character: column,
                },
            })

            const titleAndContents = getTitleAndContents(result)

            if (titleAndContents) {
                showQuickInfo(titleAndContents.title, titleAndContents.description)
            }
        }
        catch (ex) {
            hideQuickInfo()
        }
    }
}

export const hideQuickInfo = (): void => {
    UI.Actions.hideQuickInfo()
}

const showQuickInfo = (title: string, contents: string): void => {
    UI.Actions.showQuickInfo(title, contents)
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
