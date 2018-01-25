/**
 * Thin wrapper around browser performance API
 */
export function mark(markerName: string): void {
    if (typeof window === "undefined") {
        return
    }

    if (process.env.NODE_ENV === "production") {
        return
    }

    performance.mark(markerName)

    const anyConsole: any = console
    anyConsole.timeStamp(markerName)

    console.log(`[PERFORMANCE] ${markerName}: ${performance.now()}`) // tslint:disable-line no-console
}

export const startMeasure = (measurementName: string): void => {
    console.time(measurementName) // tslint:disable-line
}

export const endMeasure = (measurementName: string): void => {
    console.timeEnd(measurementName) // tslint:disable-line
}
