/**
 * Completion.ts
 */

import * as types from "vscode-languageserver-types"

import { contextMenuManager } from "./../../ContextMenu"

import { resolveCompletionItem } from "./Completion"

import { ICompletionState } from "./CompletionStore"

import { Store } from "redux"

// TODO: Factor into closure
const completionContextMenu2 = contextMenuManager.create()

import { getFilteredCompletions } from "./CompletionSelectors"

import * as CompletionUtility from "./CompletionUtility"

export const createContextMenu = (store: Store<ICompletionState>) => {

    store.subscribe(() => {
        render(store.getState())
    })

    completionContextMenu2.onSelectedItemChanged.subscribe((completionItem: types.Command) => {
        store.dispatch({
            type: "SELECT_ITEM",
            completionItem,
        })
    })

    completionContextMenu2.onItemSelected.subscribe((completionItem: types.CompletionItem) => {

        const state = store.getState()

        store.dispatch({
            type: "COMMIT_COMPLETION",
            meetLine: state.meetInfo.meetLine,
            meetPosition: state.meetInfo.meetPosition,
            completionText: CompletionUtility.getInsertText(completionItem)
        })

    })

}

export const render = (state: ICompletionState): void => {

    const filteredCompletions = getFilteredCompletions(state)

    if (filteredCompletions && filteredCompletions.length) {
        if (completionContextMenu2.isOpen()) {
            completionContextMenu2.setItems(filteredCompletions)
        } else {
            completionContextMenu2.show(filteredCompletions, state.meetInfo.meetBase)
        }
    } else {
        completionContextMenu2.hide()
    }

}

//export const createCompletionMenu = (completionMeet$: Observable<ICompletionMeetInfo>, completion$: Observable<IResolvedCompletions>, modeChanged$: Observable<Oni.Vim.Mode>): void => {

//    const completionContextMenu = contextMenuManager.create()

//    let lastCompletedMeet: ICompletionMeetInfo = null
//    let lastSelection: string = null

//    // Handle menu completion
//    const completionMenuItemSelected$ = completionContextMenu.onItemSelected.asObservable()
//    completionMenuItemSelected$
//        .withLatestFrom(completionMeet$)
//        .subscribe((args: [any, ICompletionMeetInfo]) => {
//            const [completionItem, lastMeet] = args

//            if (lastMeet) {
//                const insertText = CompletionUtility.getInsertText(completionItem)
//                commitCompletion(lastMeet.meetLine, lastMeet.meetPosition, insertText)

//                lastCompletedMeet = lastMeet
//                lastSelection = insertText
//                completionContextMenu.hide()
//            }
//        })

//    // Handle menu selection
//    const completionMenuSelectedItemChanged$ = completionContextMenu.onSelectedItemChanged.asObservable()
//    completionMenuSelectedItemChanged$
//        .withLatestFrom(completionMeet$)
//        .subscribe(async (args: [any, ICompletionMeetInfo]) => {
//            const [newItem, lastMeet] = args

//            await updateCompletionItemDetails(completionContextMenu, lastMeet.language, lastMeet.filePath, newItem.rawCompletion)
//        })

//    completion$
//        .combineLatest(modeChanged$)
//        .subscribe((result: [IResolvedCompletions, Oni.Vim.Mode]) => {

//                const [completions, mode] = result

//                if (!completions || !completions.completions || !completions.completions.length) {
//                    completionContextMenu.hide()
//                    return
//                }

//                // If we're switching from insert mode,
//                // clear out completion state and hide menu
//                if (mode !== "insert") {
//                    lastCompletedMeet = null
//                    lastSelection = null
//                    completionContextMenu.hide()
//                    return
//                }

//                const meetInfo = completions.meetInfo

//                // If we're trying to complete the same item
//                // we completed before, from the same spot,
//                // hide the menu.
//                //
//                // This helps the case where we accepted a shorter completion,
//                // but there are potential longer completions. Without this logic,
//                // we'd still keep the completion menu pu
//                if (lastCompletedMeet !== null
//                    && lastCompletedMeet.meetLine === meetInfo.meetLine
//                    && lastCompletedMeet.meetPosition === meetInfo.meetPosition
//                    && lastSelection === meetInfo.meetBase) {
//                        completionContextMenu.hide()
//                        return
//                    }

//                completionContextMenu.show(completions.completions,  meetInfo.meetBase)
//                updateCompletionItemDetails(completionContextMenu, meetInfo.language, meetInfo.filePath, completions.completions[0])
//        })
//}

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
