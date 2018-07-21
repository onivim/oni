import * as sortBy from "lodash/sortBy"

import * as Oni from "oni-api"

import * as utils from "./Utils"

import { IMenuOptionWithHighlights } from "./../Menu"

import {
    createLetterCountDictionary,
    LetterCountDictionary,
} from "./../../../UI/components/HighlightText"

export function filter(
    options: Oni.Menu.MenuOption[],
    searchString: string,
): IMenuOptionWithHighlights[] {
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

    const isCaseSensitive = utils.shouldBeCaseSensitive(searchString)

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
        }
    })

    return ret
}

export function processSearchTerm(
    searchString: string,
    options: Oni.Menu.MenuOption[],
    isCaseSensitive: boolean,
): Oni.Menu.MenuOption[] {
    const filterRegExp = new RegExp(".*" + searchString.split("").join(".*") + ".*")

    return options.filter(f => {
        let textToFilterOn = f.detail + f.label

        if (!isCaseSensitive) {
            textToFilterOn = textToFilterOn.toLowerCase()
        }

        return textToFilterOn.match(filterRegExp)
    })
}

export function getHighlightsFromString(
    text: string,
    letterCountDictionary: LetterCountDictionary,
    isCaseSensitive: boolean = false,
): number[] {
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
