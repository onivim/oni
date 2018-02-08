/**
 * SingleSplitProvider.ts
 *
 * Split provider for a leaf node
 */

import {
    Direction,
    IAugmentedSplitInfo,
    IWindowSplitProvider,
    SplitDirection,
    SplitOrLeaf,
} from "./index"

export class SingleSplitProvider implements IWindowSplitProvider {
    constructor(private _split: IAugmentedSplitInfo) {}

    public contains(split: IAugmentedSplitInfo): boolean {
        return this._split === split
    }

    public move(split: IAugmentedSplitInfo, direction: Direction): IAugmentedSplitInfo {
        if (split === null) {
            return this._split
        } else {
            return null
        }
    }

    public split(split: IAugmentedSplitInfo, direction: SplitDirection): boolean {
        return false
    }

    public close(split: IAugmentedSplitInfo): boolean {
        return false
    }

    public getState(): SplitOrLeaf<IAugmentedSplitInfo> {
        return {
            type: "Leaf",
            contents: this._split,
        }
    }
}
