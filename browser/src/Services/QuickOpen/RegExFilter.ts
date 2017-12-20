/**
 * MenuFilter.ts
 *
 * Implements filtering logic for the menu
 */

import * as sortBy from "lodash/sortBy"

import * as Oni from "oni-api"

import { IMenuOptionWithHighlights, shouldFilterbeCaseSensitive } from "./../Menu"

import { createLetterCountDictionary, LetterCountDictionary } from "./../../UI/components/HighlightText"

export const regexFilter = (options: Oni.Menu.MenuOption[], searchString: string): IMenuOptionWithHighlights[] => {
    if (!searchString) {
        const opt = options.map((o) => {
            return {
                ...o,
                detailHighlights: [],
                labelHighlights: [],
            }
        })

        return sortBy(opt, (o) => o.pinned ? 0 : 1)
    }

    const isCaseSensitive = shouldFilterbeCaseSensitive(searchString)

    if (!isCaseSensitive) {
        searchString = searchString.toLowerCase()
    }

    const filterRegExp = new RegExp(".*" + searchString.split("").join(".*") + ".*")

    const filteredOptions = options.filter((f) => {
        let textToFilterOn = f.detail + f.label

        if (!isCaseSensitive) {
            textToFilterOn = textToFilterOn.toLowerCase()
        }

        return textToFilterOn.match(filterRegExp)
    })

    const ret = filteredOptions.map((fo) => {
        const letterCountDictionary = createLetterCountDictionary(searchString)

        const detailHighlights = getHighlightsFromString(fo.detail, letterCountDictionary)
        const labelHighlights = getHighlightsFromString(fo.label, letterCountDictionary)

        return {
            ...fo,
            detailHighlights,
            labelHighlights,
        }
    })

    return ret
}

export const getHighlightsFromString = (text: string, letterCountDictionary: LetterCountDictionary): number[] => {
    if (!text) {
        return []
    }

    const ret: number[] = []

    for (let i = 0; i < text.length; i++) {
        const letter = text[i]
        const idx = i
        if (letterCountDictionary[letter] && letterCountDictionary[letter] > 0) {
            ret.push(idx)
            letterCountDictionary[letter]--
        }
    }

    return ret
}
