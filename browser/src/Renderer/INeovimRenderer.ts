import { Screen } from "./../Screen"
import { DeltaRegionTracker } from "./../DeltaRegionTracker"

export interface INeovimRenderer {
    start(element: HTMLElement): void

    update(screenInfo: Screen, deltaRegionTracker: DeltaRegionTracker): void

    onAction(action: any, deltaRegionTracker: DeltaRegionTracker): void

    onResize(): void
}
