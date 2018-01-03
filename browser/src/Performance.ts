
export interface IPerformance {
    mark(markerName: string): void
    startMeasure(measurementName: string): void
    endMeasure(measurementName: string): void
}
/**
 * Thin wrapper around browser performance API
 */
export class Performance implements IPerformance {
    public mark(markerName: string): void {
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

    public startMeasure(measurementName: string): void {
        console.time(measurementName) // tslint:disable-line
    }

    public endMeasure(measurementName: string): void {
        console.timeEnd(measurementName) // tslint:disable-line
    }
}
