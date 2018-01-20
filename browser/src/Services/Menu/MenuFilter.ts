/**
 * MenuFilter.ts
 *
 * Implements filtering logic for the menu
 */

import * as Fuse from "fuse.js"
import * as sortBy from "lodash/sortBy"

// import * as Oni from "oni-api"

import { configuration } from "./../../Services/Configuration"

import { IMenuOptionWithHighlights } from "./Menu"

export const shouldFilterbeCaseSensitive = (searchString: string): boolean => {

    // TODO: Technically, this makes the reducer 'impure',
    // which is not ideal - need to refactor eventually.
    //
    // One option is to plumb through the configuration setting
    // from the top-level, but it might be worth extracting
    // out the filter strategy in general.
    const caseSensitivitySetting = configuration.getValue("menu.caseSensitive")

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

export const fuseFilter = (options: any[], searchString: string): IMenuOptionWithHighlights[] => {

    if (!searchString) {
        const opt = options.map((o) => {
            return {
                ...o,
                label: o.label,
                detail: o.detail,
                icon: o.icon,
                pinned: o.pinned,
                detailHighlights: [],
                labelHighlights: [],
                additionalComponent: o.additionalComponent,
            }
        })

        return sortBy(opt, (o) => o.pinned ? 0 : 1)
    }

    const fuseOptions = {
        keys: [{
            name: "label",
            weight: 0.6,
        }, {
            name: "detail",
            weight: 0.4,
        }],
        caseSensitive: shouldFilterbeCaseSensitive(searchString),
        include: ["matches"],
    }

    // remove duplicate characters
    const searchSet = new Set(searchString)

    // remove any items that don't have all the characters from searchString
    // For this first pass, ignore case
    const filteredOptions = options.filter((o) => {

        if (!o.label && !o.detail) {
            return false
        }

        const label = o.label ? o.label.toLowerCase() : ""
        const detail = o.detail ? o.detail.toLowerCase() : ""

        const combined = label + detail

        for (const c of searchSet) {
            if (combined.indexOf(c.toLowerCase()) === -1) {
                return false
            }
        }

        return true
    })

    const fuse = new Fuse(filteredOptions, fuseOptions)
    const results = fuse.search(searchString)

    const highlightOptions = results.map((f: any) => {
        let labelHighlights: number[][] = []
        let detailHighlights: number[][] = []
        // matches will have 1 or 2 items depending on
        // whether one or both (label and detail) matched
        f.matches.forEach((obj: any) => {
            if (obj.key === "label") {
                labelHighlights = obj.indices
            } else {
                detailHighlights = obj.indices
            }
        })

        return {
            ...f,
            icon: f.item.icon,
            pinned: f.item.pinned,
            label: f.item.label,
            detail: f.item.detail,
            labelHighlights: convertArrayOfPairsToIndices(labelHighlights),
            detailHighlights: convertArrayOfPairsToIndices(detailHighlights),
            additionalComponent: f.item.additionalComponent,
        }
    })

    return highlightOptions
}

const convertArrayOfPairsToIndices = (pairs: number[][]): number[] => {
    const ret: number[] = []

    pairs.forEach((p) => {
        const [startIndex, endIndex] = p

        for (let i = startIndex; i <= endIndex; i++) {
            ret.push(i)
        }
    })

    return ret
}
