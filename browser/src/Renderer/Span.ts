import { Grid } from "./../Grid"
import { IElementFactory } from "./ElementFactory"

export interface ISpan {
    startX: number
    endX: number
}

export interface ISpanElementInfo extends ISpan {
    element?: HTMLElement | null
    foregroundColor?: string | undefined
    backgroundColor?: string | undefined
    canCombine: boolean
}

/**
 * Checks if it is possible to combine spans at a boundary. Spans can be combined if they have
 * they have the same styling (foreground color and background color). The location will be checked
 * against the span before it
 */
export function combineSpansAtBoundary(x: number, y: number, fontWidthInPixels: number, grid: Grid<ISpanElementInfo>, elementFactory: IElementFactory): void {

    const prevCellX = x - 1

    if (prevCellX < 0) {
        return
    }

    const previousSpan = grid.getCell(prevCellX, y)
    const currentSpan = grid.getCell(x, y)

    // If there isn't a span already at one of the positions, it can't be combined
    if (!previousSpan || !currentSpan) {
        return
    }

    if (!previousSpan.canCombine || !currentSpan.canCombine) {
        return
    }

    // Check if already combined..
    if (previousSpan.element === currentSpan.element) {
        return
    }

    const previousElement = previousSpan.element
    const currentElement = currentSpan.element

    if (!previousElement || !currentElement) {
        return
    }

    if ((previousSpan.foregroundColor !== currentSpan.foregroundColor)
        || (previousSpan.backgroundColor !== currentSpan.backgroundColor)) {
        return
    }

    if (previousElement.className !== currentElement.className) {
        return
    }

    // At this point, we have a candidate to combine

    const previousText = previousElement.textContent
    const currentText = currentElement.textContent

    const combinedText = previousText + currentText
    previousElement.textContent = combinedText

    elementFactory.recycle(currentElement)

    previousElement.style.width = (fontWidthInPixels * combinedText.length) + "px"

    const updatedSpan = {
        startX: previousSpan.startX,
        endX: currentSpan.endX,
        element: previousElement,
        backgroundColor: previousSpan.backgroundColor,
        foregroundColor: previousSpan.foregroundColor,
        canCombine: true,
    }

    grid.setRegion(previousSpan.startX, y, currentSpan.endX - previousSpan.startX, 1, updatedSpan)
}

export function collapseSpanMap(currentSpanMap: Map<number, ISpan[]>): Map<number, ISpan[]> {
    const outMap = new Map<number, ISpan[]>()
    for (let k of currentSpanMap.keys()) {
        outMap.set(k, collapseSpans(currentSpanMap.get(k)))
    }

    return outMap
}

export function collapseSpans(spans: ISpan[] | undefined): ISpan[] {
    if (!spans) {
        return []
    }

    const flattenedArray = flattenSpansToArray(spans)
    return expandArrayToSpans(flattenedArray)
}

export function flattenSpansToArray(spans: ISpan[]): any[] {
    if (!spans || !spans.length) {
        return []
    }

    const bounds = spans.reduce((prev, cur) => ({
        startX: Math.min(prev.startX, cur.startX),
        endX: Math.max(prev.endX, cur.endX),
    }), { startX: spans[0].startX, endX: spans[0].endX })

    const array: any[] = []

    for (let x = 0; x < bounds.startX; x++) {
        array.push(null)
    }

    for (let x = bounds.startX; x < bounds.endX; x++) {
        array.push(false)
    }

    spans.forEach((s) => {
        for (let i = s.startX; i < s.endX; i++) {
            array[i] = true
        }
    })

    return array
}

export function expandArrayToSpans(array: any[]): ISpan[] {

    if (!array || !array.length) {
        return []
    }

    let start = 0
    while (array[start] === null) {
        start++
    }

    const spans: ISpan[] = []
    let currentSpan: ISpan | null = null

    let x = 0
    while (x < array.length) {

        if (array[x]) {
            if (currentSpan === null) {
                currentSpan = {
                    startX: x,
                    endX: -1,
                }
            }
        } else {
            if (currentSpan !== null) {
                currentSpan.endX = x
                spans.push(currentSpan)
                currentSpan = null
            }
        }

        x++
    }

    if (currentSpan) {
        currentSpan.endX = array.length
        spans.push(currentSpan)
    }

    return spans
}
