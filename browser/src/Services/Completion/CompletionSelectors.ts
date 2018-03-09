/**
 * CompletionSelectors.ts
 *
 * Selectors are functions that take a state and derive a value from it.
 */

import { ICompletionState } from "./CompletionState"

import * as types from "vscode-languageserver-types"

const EmptyCompletions: types.CompletionItem[] = []

import * as CompletionUtility from "./CompletionUtility"

export const getFilteredCompletions = (state: ICompletionState): types.CompletionItem[] => {
    if (!state.completionResults.completions || !state.completionResults.completions.length) {
        return EmptyCompletions
    }

    if (!state.meetInfo.shouldExpand) {
        return EmptyCompletions
    }

    // If the completions were for a different meet line/position, we probably
    // shouldn't show them...
    if (
        state.meetInfo.meetLine !== state.completionResults.meetLine ||
        state.meetInfo.meetPosition !== state.completionResults.meetPosition
    ) {
        return EmptyCompletions
    }

    // If we had previously accepted this completion, don't show it either
    if (
        state.meetInfo.meetLine === state.lastCompletionInfo.meetLine &&
        state.meetInfo.meetPosition === state.lastCompletionInfo.meetPosition &&
        state.meetInfo.meetBase ===
            CompletionUtility.getInsertText(state.lastCompletionInfo.completion)
    ) {
        return EmptyCompletions
    }

    const completions = state.completionResults.completions

    const filteredCompletions = filterCompletionOptions(completions, state.meetInfo.meetBase)

    if (!filteredCompletions || !filteredCompletions.length) {
        return EmptyCompletions
    }

    // If there is only one element, and it matches our base,
    // don't bother showing it..
    if (
        CompletionUtility.getInsertText(filteredCompletions[0]) === state.meetInfo.meetBase &&
        filteredCompletions.length === 1
    ) {
        return EmptyCompletions
    }

    return filteredCompletions
}

export const filterCompletionOptions = (
    items: types.CompletionItem[],
    searchText: string,
): types.CompletionItem[] => {
    if (!searchText) {
        return items
    }

    if (!items || !items.length) {
        return null
    }

    const filterRegEx = new RegExp("^" + searchText.split("").join(".*") + ".*")

    const filteredOptions = items.filter(f => {
        const textToFilterOn = f.filterText || f.label
        return textToFilterOn.match(filterRegEx)
    })

    return filteredOptions.sort((itemA, itemB) => {
        const itemAFilterText = itemA.filterText || itemA.label
        const itemBFilterText = itemB.filterText || itemB.label

        const indexOfA = itemAFilterText.indexOf(searchText)
        const indexOfB = itemBFilterText.indexOf(searchText)

        return indexOfB - indexOfA
    })
}
