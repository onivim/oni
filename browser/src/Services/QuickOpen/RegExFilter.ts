/**
 * MenuFilter.ts
 *
 * Implements filtering logic for the menu
 */

import * as sortBy from "lodash/sortBy"

import * as Oni from "oni-api"

import { score } from "./Scorer/QuickOpenScorer"

import { IMenuOptionWithHighlights, shouldFilterbeCaseSensitive } from "./../Menu"

import {
    createLetterCountDictionary,
    LetterCountDictionary,
} from "./../../UI/components/HighlightText"

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

    let filteredOptions = options

    listOfSearchTerms.map(searchTerm => {
        filteredOptions = processSearchTerm(searchTerm, filteredOptions, isCaseSensitive)
    })

    const ret = filteredOptions.map(fo => {
        const letterCountDictionary = createLetterCountDictionary(searchString)
        const fullPath = fo.detail + fo.label
        const resultScore = score(fullPath, searchString, fullPath.toLowerCase(), true)

        const detailHighlights = getHighlightsFromString(
            fo.detail,
            letterCountDictionary,
            isCaseSensitive,
        )
        const labelHighlights = getHighlightsFromString(
            fo.label,
            letterCountDictionary,
            isCaseSensitive,
        )

        return {
            ...fo,
            detailHighlights,
            labelHighlights,
            score: resultScore[0],
        }
    })

    return sortBy(ret, r => (r.pinned ? Number.MAX_VALUE : r.score))
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

export const getHighlightsFromString = (
    text: string,
    letterCountDictionary: LetterCountDictionary,
    isCaseSensitive: boolean = false,
): number[] => {
    if (!text) {
        return []
    }

    const ret: number[] = []

    for (let i = 0; i < text.length; i++) {
        const letter = isCaseSensitive ? text[i] : text[i].toLowerCase()
        const idx = i
        if (letterCountDictionary[letter] && letterCountDictionary[letter] > 0) {
            ret.push(idx)
            letterCountDictionary[letter]--
        }
    }

    return ret
}
