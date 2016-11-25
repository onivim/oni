import { Screen } from "./../Screen"
import { DeltaRegionTracker } from "./../DeltaRegionTracker"

export interface INeovimRenderer {
    start(element: HTMLElement)

    update(screenInfo: Screen, deltaRegionTracker: DeltaRegionTracker)

    onAction(action: any, deltaRegionTracker: DeltaRegionTracker): void

    onResize(): void
}
