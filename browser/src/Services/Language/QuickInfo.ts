/**
 * QuickInfo.ts
 *
 */

// import * as os from "os"
import * as types from "vscode-languageserver-types"

// import { configuration } from "./../Configuration"

// import * as UI from "./../../UI"

import { editorManager } from "./../EditorManager"

import { languageManager } from "./LanguageManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

// TODO:
// - Factor out event context to something simpler
// - Remove plugin manager
export const getQuickInfo = async (): Promise<types.Hover> => {
    const buffer = editorManager.activeEditor.activeBuffer
    const { language, filePath } = buffer
    const { line, column } = buffer.cursor

    if (languageManager.isLanguageServerAvailable(language)) {

        const args = {
                textDocument: {
                    uri: Helpers.wrapPathInFileUri(filePath),
                },
                position: {
                    line,
                    character: column,
                },
        }

        let result: types.Hover = null
        try {
            result = await languageManager.sendLanguageServerRequest(language, filePath, "textDocument/hover", args)
        } catch (ex) { }


        return result

        // if (!result) {
        //     hideQuickInfo()
        // } else {
        //     const titleAndContents = getTitleAndContents(result)

        //     if (titleAndContents) {
        //         showQuickInfo(titleAndContents.title, titleAndContents.description)
        //     }
        // }
    } else {
        return null
    }
}

// export const hideQuickInfo = (): void => {
//     UI.Actions.hideQuickInfo()
// }

// const showQuickInfo = (title: string, contents: string): void => {
//     UI.Actions.showQuickInfo(title, contents)
// }

// const getTitleAndContents = (result: types.Hover) => {
//     if (!result || !result.contents) {
//         return null
//     }

//     const contents = Helpers.getTextFromContents(result.contents)

//     if (contents.length === 0) {
//         return null
//     } else if (contents.length === 1 && contents[0]) {
//         const title = contents[0].trim()

//         if (!title) {
//             return null
//         }

//         return {
//             title,
//             description: "",
//         }
//     } else {

//         const description = [...contents]
//         description.shift()
//         const descriptionContent = description.join(os.EOL)

//         return {
//             title: contents[0],
//             description: descriptionContent,
//         }
//     }
// }
