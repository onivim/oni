export interface ISpan {
    startX: number
    endX: number
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
