/**
 * WindowDock.ts
 */

import { Direction, IAugmentedSplitInfo, IWindowSplitNavigator } from "./index"

export type DockStateGetter = () => IAugmentedSplitInfo[]

export class WindowDockNavigator implements IWindowSplitNavigator {
    constructor(private _stateGetter: DockStateGetter) {}

    public contains(split: IAugmentedSplitInfo): boolean {
        const splits = this._stateGetter()
        return splits.indexOf(split) >= 0
    }

    public move(startSplit: IAugmentedSplitInfo, direction: Direction): IAugmentedSplitInfo {
        const splits = this._stateGetter()

        const currentIndex = splits.indexOf(startSplit)

        if (currentIndex === -1) {
            if (direction === "left") {
                return splits[splits.length - 1]
            } else if (direction === "right") {
                return splits[0]
            } else {
                return null
            }
        }

        // TODO: Generalize this - this is baked for a 'left dock' case right now
        const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1

        if (newIndex >= 0 && newIndex < splits.length) {
            return splits[newIndex]
        } else {
            return null
        }
    }
}
