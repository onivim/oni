/**
 * RegExFilter.ts
 *
 * Implements RegEx filtering logic for the menu
 */

import * as sortBy from "lodash/sortBy"

import * as Oni from "oni-api"

import {
    compareItemsByScoreOni,
    getHighlightsFromResult,
    scoreItemOni,
} from "./Scorer/OniQuickOpenScorer"

import { IMenuOptionWithHighlights, shouldFilterbeCaseSensitive } from "./../Menu"

export const regexFilter = (
    options: Oni.Menu.MenuOption[],
    searchString: string,
): IMenuOptionWithHighlights[] => {
    if (!searchString) {
        const opt = options.map(o => {
            return {
                ...o,
                detailHighlights: [],
                labelHighlights: [],
            }
        })

        return sortBy(opt, o => (o.pinned ? 0 : 1))
    }

    const isCaseSensitive = shouldFilterbeCaseSensitive(searchString)

    if (!isCaseSensitive) {
        searchString = searchString.toLowerCase()
    }

    const listOfSearchTerms = searchString.split(" ").filter(x => x)

    // Since the VSCode scorer doesn't deal so well with the spaces,
    // instead rebuild the term in reverse order.
    // ie `index browser editor` becomes `browsereditorindex`
    // This allows the scoring and highlighting to work better.
    const vsCodeSearchString =
        listOfSearchTerms.length > 1
            ? listOfSearchTerms.slice(1) + listOfSearchTerms[0]
            : listOfSearchTerms[0]

    let filteredOptions = options

    listOfSearchTerms.map(searchTerm => {
        filteredOptions = processSearchTerm(searchTerm, filteredOptions, isCaseSensitive)
    })

    const ret = filteredOptions.map(fo => {
        const resultScore = scoreItemOni(fo, vsCodeSearchString, true)

        const detailHighlights = getHighlightsFromResult(resultScore.descriptionMatch)

        const labelHighlights = getHighlightsFromResult(resultScore.labelMatch)

        return {
            ...fo,
            detailHighlights,
            labelHighlights,
            score: fo.pinned ? Number.MAX_SAFE_INTEGER : resultScore[0],
        }
    })

    return ret.sort((e1, e2) => compareItemsByScoreOni(e1, e2, searchString, false))
}

export const processSearchTerm = (
    searchString: string,
    options: Oni.Menu.MenuOption[],
    isCaseSensitive: boolean,
): Oni.Menu.MenuOption[] => {
    const filterRegExp = new RegExp(".*" + searchString.split("").join(".*") + ".*")

    return options.filter(f => {
        let textToFilterOn = f.detail + f.label

        if (!isCaseSensitive) {
            textToFilterOn = textToFilterOn.toLowerCase()
        }

        return textToFilterOn.match(filterRegExp)
    })
}
