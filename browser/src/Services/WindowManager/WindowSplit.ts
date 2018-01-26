/**
 * WindowSplit.ts
 *
 * Handles managing split state transitions, like:
 *  - Applying a split
 *  - Closing a split
 */

import { Direction, SplitDirection } from "./index"

export type SplitOrLeaf<T> = ISplitInfo<T> | ISplitLeaf<T>

export interface ISplitInfo<T> {
    type: "Split"
    splits: Array<SplitOrLeaf<T>>
    direction: SplitDirection
}

export interface ISplitLeaf<T> {
    type: "Leaf"
    contents: T
}

export const getFurthestSplitInDirection = <T>(root: SplitOrLeaf<T>, direction: Direction): ISplitLeaf<T> => {
    if (!root) {
        return null
    }

    switch (root.type) {
        case "Leaf":
            return root
        case "Split":
            return getFurthestSplitInDirection(root.splits[0], direction)
    }
}
