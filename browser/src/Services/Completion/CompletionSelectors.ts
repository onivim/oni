/**
 * CompletionSelectors.ts
 *
 * Selectors are functions that take a state and derive a value from it.
 */

import { configuration } from "./../Configuration"
import { ICompletionState } from "./CompletionState"

import * as types from "vscode-languageserver-types"

const EmptyCompletions: types.CompletionItem[] = []

import * as CompletionUtility from "./CompletionUtility"

export const shouldFilterBeCaseSensitive = (searchString: string): boolean => {
    // TODO: Technically, this makes the reducer 'impure',
    // which is not ideal - need to refactor eventually.
    //
    // One option is to plumb through the configuration setting
    // from the top-level, but it might be worth extracting
    // out the filter strategy in general.
    const caseSensitivitySetting = configuration.getValue("editor.completions.caseSensitive")

    if (caseSensitivitySetting === false) {
        return false
    } else if (caseSensitivitySetting === true) {
        return true
    } else {
        // "Smart" casing strategy
        // If the string is all lower-case, not case sensitive..
        if (searchString === searchString.toLowerCase()) {
            return false
            // Otherwise, it is case sensitive..
        } else {
            return true
        }
    }
}

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

    const isCaseSensitive = shouldFilterBeCaseSensitive(searchText)

    if (!isCaseSensitive) {
        searchText = searchText.toLocaleLowerCase()
    }

    const filteredOptions = processSearchText(searchText, items, isCaseSensitive)

    return filteredOptions.sort((itemA, itemB) => {
        const itemAFilterText = itemA.filterText || itemA.label
        const itemBFilterText = itemB.filterText || itemB.label

        const indexOfA = itemAFilterText.indexOf(searchText)
        const indexOfB = itemBFilterText.indexOf(searchText)

        return indexOfB - indexOfA
    })
}

export const processSearchText = (
    searchText: string,
    items: types.CompletionItem[],
    isCaseSensitive: boolean,
): types.CompletionItem[] => {
    const filterRegExp = new RegExp(".*" + searchText.split("").join(".*") + ".*")

    return items.filter(f => {
        let textToFilterOn = f.filterText || f.label

        if (!isCaseSensitive) {
            textToFilterOn = textToFilterOn.toLowerCase()
        }

        return textToFilterOn.match(filterRegExp)
    })
}
