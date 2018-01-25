/**
 * WindowSplit.ts
 *
 * Handles managing split state transitions, like:
 *  - Applying a split
 *  - Closing a split
 */

export enum Split {
    Right = 0,
    Bottom = 1,
    Left = 2,
    Top = 3,
}

export enum SplitDirection {
    Horizontal = 0,
    Vertical = 1,
}

export type SplitOrLeaf<T> = ISplitInfo<T> | ISplitLeaf<T>

export interface ISplitInfo<T> {
    type: "Split"
    splits: Array<SplitOrLeaf<T>>
    direction: SplitDirection
    parent: ISplitInfo<T>
}

export interface ISplitLeaf<T> {
    type: "Leaf"
    contents: T
}

export const getFurthestSplitInDirection = <T>(root: SplitOrLeaf<T>, direction: Split): ISplitLeaf<T> => {
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

export function createSplitRoot<T>(direction: SplitDirection, parent?: ISplitInfo<T>): ISplitInfo<T> {
    return {
        type: "Split",
        splits: [],
        direction: SplitDirection.Horizontal,
        parent: parent || null,
    }
}

export function createSplitLeaf<T>(contents: T): ISplitLeaf<T> {
    return {
        type: "Leaf",
        contents,
    }
}

export function applySplit<T>(originalSplit: ISplitInfo<T>, direction: SplitDirection, leaf: ISplitLeaf<T>): ISplitInfo<T> {
    // TODO: Implement split direction & nested splits
    return {
        ...originalSplit,
        splits: [...originalSplit.splits, leaf],
    }
}

export function closeSplit<T>(originalSplit: ISplitInfo<T>, contents: T): ISplitInfo<T> {
    // TODO: Implement this in the recursive case, for nesetd splits

    const filteredSplits = originalSplit.splits.filter((s) => {
        switch (s.type) {
            case "Split":
                return true
            case "Leaf":
                return s.contents !== contents
        }
    })

    return {
        ...originalSplit,
        splits: filteredSplits,
    }
}
