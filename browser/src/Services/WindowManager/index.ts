/**
 * WindowManager.ts
 *
 * Responsible for managing state of the editor collection, and
 * switching between active editors.
 *
 * It also provides convenience methods for hooking events
 * to the active editor, and managing transitions between editors.
 */

export * from "./LinearSplitProvider"
export * from "./RelationalSplitNavigator"
export * from "./SingleSplitProvider"
export * from "./WindowDock"
export * from "./WindowManager"
export * from "./WindowManagerStore"

// TODO: Possible API types?
export type Direction = "up" | "down" | "left" | "right"
export type SplitDirection = "horizontal" | "vertical"

export const getInverseDirection = (direction: Direction): Direction => {
    switch (direction) {
        case "up":
            return "down"
        case "down":
            return "up"
        case "left":
            return "right"
        case "right":
            return "left"
        default:
            return null
    }
}

import { WindowManager } from "./WindowManager"
import { IAugmentedSplitInfo, SplitOrLeaf } from "./WindowManagerStore"

/**
 * Interface for something that can navigate between window splits
 */
export interface IWindowSplitNavigator {
    contains(split: IAugmentedSplitInfo): boolean
    move(startSplit: IAugmentedSplitInfo, direction: Direction): IAugmentedSplitInfo
}

/**
 * Interface for something that can manage window splits:
 * - Navigating splits
 * - Creating a new split
 * - Removing a split
 * Later - resizing a split?
 */
export interface IWindowSplitProvider extends IWindowSplitNavigator {
    split(
        newSplit: IAugmentedSplitInfo,
        direction: SplitDirection,
        referenceSplit?: IAugmentedSplitInfo,
    ): boolean
    close(split: IAugmentedSplitInfo): boolean
    getState(): SplitOrLeaf<IAugmentedSplitInfo>
}

export const windowManager = new WindowManager()
