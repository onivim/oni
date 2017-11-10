/**
 * Completion.ts
 */

import "rxjs/add/observable/combineLatest"
import "rxjs/add/operator/withLatestFrom"
import { Observable } from "rxjs/Observable"

import * as types from "vscode-languageserver-types"

import { contextMenuManager } from "./../../ContextMenu"
import { editorManager } from "./../../EditorManager"

import * as CompletionUtility from "./CompletionUtility"

import { ICompletionMeetInfo, IResolvedCompletions, resolveCompletionItem } from "./Completion"

export const createCompletionMenu = (completionMeet$: Observable<ICompletionMeetInfo>, completion$: Observable<IResolvedCompletions>, modeChanged$: Observable<Oni.Vim.Mode>): void => {

    const completionContextMenu = contextMenuManager.create()

    let lastCompletedMeet: ICompletionMeetInfo = null
    let lastSelection: string = null

    // Handle menu completion
    const completionMenuItemSelected$ = completionContextMenu.onItemSelected.asObservable()
    completionMenuItemSelected$
        .withLatestFrom(completionMeet$)
        .subscribe((args: [any, ICompletionMeetInfo]) => {
            const [completionItem, lastMeet] = args

            if (lastMeet) {
                const insertText = CompletionUtility.getInsertText(completionItem)
                commitCompletion(lastMeet.meetLine, lastMeet.meetPosition, insertText)

                lastCompletedMeet = lastMeet
                lastSelection = insertText
                completionContextMenu.hide()
            }
        })

    // Handle menu selection
    const completionMenuSelectedItemChanged$ = completionContextMenu.onSelectedItemChanged.asObservable()
    completionMenuSelectedItemChanged$
        .withLatestFrom(completionMeet$)
        .subscribe(async (args: [any, ICompletionMeetInfo]) => {
            const [newItem, lastMeet] = args

            await updateCompletionItemDetails(completionContextMenu, lastMeet.language, lastMeet.filePath, newItem.rawCompletion)
        })

    completion$
        .combineLatest(modeChanged$)
        .subscribe((result: [IResolvedCompletions, Oni.Vim.Mode]) => {

                const [completions, mode] = result

                if (!completions || !completions.completions || !completions.completions.length) {
                    completionContextMenu.hide()
                    return
                }

                // If we're switching from insert mode,
                // clear out completion state and hide menu
                if (mode !== "insert") {
                    lastCompletedMeet = null
                    lastSelection = null
                    completionContextMenu.hide()
                    return
                }

                const meetInfo = completions.meetInfo

                // If we're trying to complete the same item
                // we completed before, from the same spot,
                // hide the menu.
                //
                // This helps the case where we accepted a shorter completion,
                // but there are potential longer completions. Without this logic,
                // we'd still keep the completion menu pu
                if (lastCompletedMeet !== null
                    && lastCompletedMeet.meetLine === meetInfo.meetLine
                    && lastCompletedMeet.meetPosition === meetInfo.meetPosition
                    && lastSelection === meetInfo.meetBase) {
                        completionContextMenu.hide()
                        return
                    }

                completionContextMenu.show(completions.completions,  meetInfo.meetBase)
                updateCompletionItemDetails(completionContextMenu, meetInfo.language, meetInfo.filePath, completions.completions[0])
        })
}

let lastDetailsRequestInfo: { label: string, result: types.CompletionItem } = { label: null, result: null }

export const updateCompletionItemDetails = async (menu: any, language: string, filePath: string, completionItem: types.CompletionItem)  => {

    if (lastDetailsRequestInfo.label === completionItem.label && lastDetailsRequestInfo.result) {
        menu.updateItem(lastDetailsRequestInfo.result)
        return
    }

    const result = await resolveCompletionItem(language, filePath, completionItem)

    lastDetailsRequestInfo = {
        label: completionItem.label,
        result,
    }

    if (result) {
        menu.updateItem(result)
    }
}

export const commitCompletion = async (line: number, base: number, completion: string) => {
    const buffer = editorManager.activeEditor.activeBuffer
    const currentLines = await buffer.getLines(line, line + 1)

    const column = buffer.cursor.column

    if (!currentLines || !currentLines.length) {
        return
    }

    const originalLine = currentLines[0]

    const newLine = CompletionUtility.replacePrefixWithCompletion(originalLine, base, column, completion)
    await buffer.setLines(line, line + 1, [newLine])
    const cursorOffset = newLine.length - originalLine.length
    await buffer.setCursorPosition(line, column + cursorOffset)
}
