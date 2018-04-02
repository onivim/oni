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

    const filteredOptions = processSearchTerm(vsCodeSearchString, options, isCaseSensitive)

    const ret = filteredOptions.filter(fo => {
        if (fo.score === 0) {
            return false
        } else {
            return true
        }
    })

    return ret.sort((e1, e2) => compareItemsByScoreOni(e1, e2, vsCodeSearchString, false))
}

export const processSearchTerm = (
    searchString: string,
    options: Oni.Menu.MenuOption[],
    isCaseSensitive: boolean,
): Oni.Menu.IMenuOptionWithHighlights[] => {
    const result: Oni.Menu.IMenuOptionWithHighlights[] = options.map(f => {
        const itemScore = scoreItemOni(f, searchString, true)
        const detailHighlights = getHighlightsFromResult(itemScore.descriptionMatch)
        const labelHighlights = getHighlightsFromResult(itemScore.labelMatch)

        return {
            ...f,
            detailHighlights,
            labelHighlights,
            score: f.pinned ? Number.MAX_SAFE_INTEGER : itemScore.score,
        }
    })

    return result
}

export function convertSimple2RegExpPattern(pattern: string): string {
    return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&").replace(/[\*]/g, ".*")
}
