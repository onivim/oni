/**
 * Completion.ts
 */

import { Store } from "redux"
import * as types from "vscode-languageserver-types"

import { ContextMenu, contextMenuManager } from "./../ContextMenu"

import { getFilteredCompletions } from "./CompletionSelectors"
import { ICompletionState } from "./CompletionState"
import * as CompletionUtility from "./CompletionUtility"

export const createContextMenu = (store: Store<ICompletionState>) => {

    const contextMenu = contextMenuManager.create()

    store.subscribe(() => {
        render(contextMenu, store.getState())
    })

    contextMenu.onSelectedItemChanged.subscribe((completionItem: types.Command) => {

        store.dispatch({
            type: "SELECT_ITEM",
            completionItem,
        })
    })

    contextMenu.onItemSelected.subscribe((completionItem: types.CompletionItem) => {

        const state = store.getState()

        store.dispatch({
            type: "COMMIT_COMPLETION",
            meetLine: state.meetInfo.meetLine,
            meetPosition: state.meetInfo.meetPosition,
            completionText: CompletionUtility.getInsertText(completionItem),
        })

    })
}

export const render = (contextMenu: ContextMenu, state: ICompletionState): void => {
    const filteredCompletions = getFilteredCompletions(state)

    if (filteredCompletions && filteredCompletions.length) {
        if (contextMenu.isOpen()) {
            contextMenu.setItems(filteredCompletions)
            contextMenu.setFilter(state.meetInfo.meetBase)
        } else {
            contextMenu.show(filteredCompletions, state.meetInfo.meetBase)
        }
    } else {
        contextMenu.hide()
    }
}
