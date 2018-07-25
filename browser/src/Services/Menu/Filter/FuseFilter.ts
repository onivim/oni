import * as Fuse from "fuse.js"
import * as sortBy from "lodash/sortBy"

import * as utils from "./Utils"

import { IMenuOptionWithHighlights } from "./../Menu"

export function filter(options: any[], searchString: string): IMenuOptionWithHighlights[] {
    if (!searchString) {
        const opt = options.map(o => {
            return {
                ...o,
                label: o.label,
                detail: o.detail,
                icon: o.icon,
                pinned: o.pinned,
                metadata: o.metadata,
                detailHighlights: [],
                labelHighlights: [],
                additionalComponent: o.additionalComponent,
            }
        })

        return sortBy(opt, o => (o.pinned ? 0 : 1))
    }

    const fuseOptions = {
        keys: [
            {
                name: "label",
                weight: 0.6,
            },
            {
                name: "detail",
                weight: 0.4,
            },
        ],
        caseSensitive: utils.shouldBeCaseSensitive(searchString),
        include: ["matches"],
    }

    // remove duplicate characters
    const searchSet = new Set(searchString)

    // remove any items that don't have all the characters from searchString
    // For this first pass, ignore case
    const filteredOptions = options.filter(o => {
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
            metadata: f.item.metadata,
            labelHighlights: convertArrayOfPairsToIndices(labelHighlights),
            detailHighlights: convertArrayOfPairsToIndices(detailHighlights),
            additionalComponent: f.item.additionalComponent,
        }
    })

    return highlightOptions
}

function convertArrayOfPairsToIndices(pairs: number[][]): number[] {
    const ret: number[] = []

    pairs.forEach(p => {
        const [startIndex, endIndex] = p

        for (let i = startIndex; i <= endIndex; i++) {
            ret.push(i)
        }
    })

    return ret
}
