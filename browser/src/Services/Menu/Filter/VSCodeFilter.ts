import * as sortBy from "lodash/sortBy"

import * as Oni from "oni-api"

import {
    compareItemsByScoreOni,
    getHighlightsFromResult,
    scoreItemOni,
} from "./../../Search/Scorer/OniQuickOpenScorer"
import { ScorerCache } from "./../../Search/Scorer/QuickOpenScorer"

import * as utils from "./Utils"

import { IMenuOptionWithHighlights } from "./../Menu"

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

    // Since the VSCode scorer doesn't deal so well with the spaces,
    // instead rebuild the term in reverse order.
    // ie `index browser editor` becomes `browsereditorindex`
    // This allows the scoring and highlighting to work better.
    const vsCodeSearchString =
        listOfSearchTerms.length > 1
            ? listOfSearchTerms.slice(1).join("") + listOfSearchTerms[0]
            : listOfSearchTerms[0]

    // Adds a cache for the scores. This is needed to stop the final score
    // compare from repeating all the scoring logic again.
    // Currently, this only persists for the current search, which will speed
    // up that search only.
    // TODO: Is it worth instead persisting this cache?
    // Plus side is repeated searches are fast.
    // Down side is there will be a lot of rubbish being stored too.
    const cache: ScorerCache = {}

    const filteredOptions = processSearchTerm(vsCodeSearchString, options, cache)

    const ret = filteredOptions.filter(fo => {
        if (fo.score === 0) {
            return false
        } else {
            return true
        }
    })

    return ret.sort((e1, e2) => compareItemsByScoreOni(e1, e2, vsCodeSearchString, true, cache))
}

export function processSearchTerm(
    searchString: string,
    options: Oni.Menu.MenuOption[],
    cache: ScorerCache,
): Oni.Menu.IMenuOptionWithHighlights[] {
    const result: Oni.Menu.IMenuOptionWithHighlights[] = options.map(f => {
        const itemScore = scoreItemOni(f, searchString, true, cache)
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
