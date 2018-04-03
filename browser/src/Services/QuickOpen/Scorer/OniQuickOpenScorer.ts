import { IMatch } from "./filters"
import {
    compareItemsByScore,
    IItemAccessor,
    IItemScore,
    prepareQuery,
    scoreItem,
} from "./QuickOpenScorer"
import { convertSimple2RegExpPattern, nativeSep } from "./Utilities"

export const NO_ITEM_SCORE: IItemScore = Object.freeze({ score: 0 })

class OniAccessor implements IItemAccessor<any> {
    public getItemLabel(result: any): string {
        return result.label ? result.label : ""
    }

    public getItemDescription(result: any): string {
        return result.detail ? result.detail : ""
    }

    public getItemPath(result: any): string {
        return result.detail + nativeSep + result.label
    }
}

export function scoreItemOni(resultObject: any, searchString: string, fuzzy: boolean): IItemScore {
    if (!searchString) {
        return NO_ITEM_SCORE
    }

    const escapedString = convertSimple2RegExpPattern(searchString)
    const query = prepareQuery(escapedString)

    if (!resultObject || !query.value) {
        return NO_ITEM_SCORE
    }

    const accessor = new OniAccessor()

    return scoreItem(resultObject, query, fuzzy, accessor)
}

export function compareItemsByScoreOni(
    resultObjectA: any,
    resultObjectB: any,
    searchString: string,
    fuzzy: boolean,
): number {
    if (!searchString) {
        return 0
    }

    const escapedString = convertSimple2RegExpPattern(searchString)
    const query = prepareQuery(escapedString)

    if (!resultObjectA || !resultObjectB || !query.value) {
        return 0
    }

    const accessor = new OniAccessor()

    return compareItemsByScore(
        resultObjectA,
        resultObjectB,
        query,
        fuzzy,
        accessor,
        (objA, objB, searchQuery, objAccessor) => -1,
    )
}

export const getHighlightsFromResult = (result: IMatch[]): number[] => {
    if (!result) {
        return []
    }

    const highlights: number[] = []

    result.forEach(r => {
        for (let i = r.start; i < r.end; i++) {
            highlights.push(i)
        }
    })

    return highlights
}
