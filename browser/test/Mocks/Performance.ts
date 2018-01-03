/**
 * Mocks/Performance.ts
 *
 * Implementations of test mocks and doubles,
 * for Oni's IPerformance interface.
 */

import { IPerformance } from "./../../src/Performance"

export class MockPerformance implements IPerformance {
    public mark(markerName: string): void {
    }

    public startMeasure(measurementName: string): void {
    }

    public endMeasure(measurementName: string): void {
    }
}
