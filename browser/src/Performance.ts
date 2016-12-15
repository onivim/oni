
/**
 * Thin wrapper around browser performance API
 */
export function mark(markerName: string): void {
    performance.mark(markerName)
    console.log(`[PERFORMANCE] - ${markerName}: ${performance.now}`)
}
