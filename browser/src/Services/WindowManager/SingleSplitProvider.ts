/**
 * SingleSplitProvider.ts
 *
 * Split provider for a leaf node
 */

import * as Oni from "oni-api"

import { Direction, IWindowSplitProvider, SplitDirection, SplitOrLeaf } from "./index"

export class SingleSplitProvider implements IWindowSplitProvider {
    constructor(private _split: Oni.IWindowSplit) {}

    public contains(split: Oni.IWindowSplit): boolean {
        return this._split === split
    }

    public move(split: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {
        if (split === null) {
            return this._split
        } else {
            return null
        }
    }

    public split(split: Oni.IWindowSplit, direction: SplitDirection): boolean {
        return false
    }

    public close(split: Oni.IWindowSplit): boolean {
        return false
    }

    public getState(): SplitOrLeaf<Oni.IWindowSplit> {
        return {
            type: "Leaf",
            contents: this._split,
        }
    }
}
