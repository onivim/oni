/**
 * CompletionSelectors.ts
 *
 * Selectors are functions that take a state and derive a value from it.
 */

import { ICompletionState } from "./CompletionStore"

import * as types from "vscode-languageserver-types"

export const getFilteredCompletions = (state: ICompletionState): types.CompletionItem[] => {

    if (!state.completionResults.completions || !state.completionResults.completions.length) {
        return []
    }

    if (!state.meetInfo.shouldExpand) {
        return []
    }

    if (state.meetInfo.meetLine !== state.completionResults.meetLine
        || state.meetInfo.meetPosition !== state.completionResults.meetPosition) {
            return []
        }

    const completions = state.completionResults.completions

    const filteredCompletions = filterCompletionOptions(completions, state.meetInfo.meetBase)
    return filteredCompletions
}

export const filterCompletionOptions = (items: types.CompletionItem[], searchText: string): types.CompletionItem[] => {
    if (!searchText) {
        return items
    }

    if (!items || !items.length) {
        return null
    }

    const filterRegEx = new RegExp("^" + searchText.split("").join(".*") + ".*")

    const filteredOptions = items.filter((f) => {
        const textToFilterOn = f.filterText || f.label
        return textToFilterOn.match(filterRegEx)
    })

    return filteredOptions.sort((itemA, itemB) => {

        const itemAFilterText = itemA.filterText || itemA.label
        const itemBFilterText = itemB.filterText || itemB.label

        const indexOfA = itemAFilterText.indexOf((searchText))
        const indexOfB = itemBFilterText.indexOf((searchText))

        return indexOfB - indexOfA
    })
}
