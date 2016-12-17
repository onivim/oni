
/**
 * Thin wrapper around browser performance API
 */
export function mark(markerName: string): void {
    performance.mark(markerName)

    const anyConsole: any = console
    anyConsole.timeStamp(markerName)

    console.log(`[PERFORMANCE] ${markerName}: ${performance.now()}`) // tslint:disable-line no-console
}
