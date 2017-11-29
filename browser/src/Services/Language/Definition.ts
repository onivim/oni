/**
 * Definition.ts
 */

// import { Observable } from "rxjs/Observable"

// import * as types from "vscode-languageserver-types"

import { editorManager } from "./../EditorManager"

import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"


import * as UI from "./../../UI"

// export const initDefinitionUI = (shouldHide$: Observable<any>, shouldUpdate$: Observable<void>) => {
//     shouldHide$.subscribe(() => UI.Actions.hideDefinition())

//     shouldUpdate$
//         .flatMap(async () => await getDefinition())
//         .subscribe((definitionResult: any) => {
//             if (!definitionResult || !definitionResult.result) {
//                 UI.Actions.hideDefinition()
//             } else {
//                 const result: types.Location | types.Location[] = definitionResult.result

//                 if (!result) {
//                     return
//                 }

//                 if (result instanceof Array) {
//                     if (!result.length) {
//                         return
//                     }

//                     UI.Actions.setDefinition(definitionResult.token, result[0])
//                 } else {
//                     UI.Actions.setDefinition(definitionResult.token, result)
//                 }
//             }
//         })
// }

export enum OpenType {
    NewTab = 0,
    SplitVertical = 1,
    SplitHorizontal = 2,
}

export const gotoDefinitionUnderCursor = async (openType: OpenType = OpenType.NewTab) => {
    const activeDefinition = UI.Selectors.getActiveDefinition()

    if (!activeDefinition) {
        return
    }

    const { uri, range } = activeDefinition.definitionLocation

    const line = range.start.line
    const column = range.start.character

    gotoPositionInUri(uri, line, column, openType)
}

export const gotoPositionInUri = async (uri: string, line: number, column: number, openType: OpenType = OpenType.NewTab): Promise<void> => {
    const filePath = Helpers.unwrapFileUriPath(uri)

    const activeEditor = editorManager.activeEditor
    const command = getCommandFromOpenType(openType)

    await activeEditor.neovim.command(`${command} ${filePath}`)
    await activeEditor.neovim.command(`cal cursor(${line + 1}, ${column + 1})`)
    await activeEditor.neovim.command("norm zz")
}

const getCommandFromOpenType = (openType: OpenType) => {
    switch (openType) {
        case OpenType.SplitVertical:
            return "vsp"
        case OpenType.SplitHorizontal:
            return "sp"
        default:
            return "e"
    }
}
