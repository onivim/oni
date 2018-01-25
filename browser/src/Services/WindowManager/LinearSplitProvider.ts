/**
 * TreeSplitProvider.ts
 *
 * Composite split provider responsible for managing
 * a tree-based hierarchy of horizontal and vertical splits
 */

import * as Oni from "oni-api"

import { IWindowSplitProvider, Direction, SingleSplitProvider, SplitDirection } from "./index"

export class LinearSplitProvider implements IWindowSplitProvider {


    private _splitProviders: IWindowSplitProvider[] = []

    constructor(
        private _direction: SplitDirection
    ) { }

    public contains(split: Oni.IWindowSplit): boolean {
        return this._getProviderForSplit(split) != null
    }

    public close(split: Oni.IWindowSplit): boolean {
        const containingSplit = this._getProviderForSplit(split)

        if (!containingSplit) {
            return false
        }

        const handled = containingSplit.close(split)

        if (handled) {
            return true
        }

        // If it was unhandled by the split provider, but the provider contains it, then we'll remove the provider
        this._splitProviders = this._splitProviders.filter((prov) => prov !== containingSplit)
        return true
    }

    public split(split: Oni.IWindowSplit, direction: SplitDirection): boolean {

        const containingSplit = this._getProviderForSplit(split)

        if (!containingSplit) {
            return false
        }

        const result = containingSplit.split(split, direction)

        // Containing split handled it, so we're good
        if (result) {
            return true
        }

        // If the split requested is oriented differently,
        // create a new provider to handle that
        if (direction !== this._direction) {
            // TODO
        } else {
            // Otherwise, we can - let's wrap up the split in a provider
            const singleSplitProvider = new SingleSplitProvider(split)
            this._splitProviders.push(singleSplitProvider)
        }

        return true
    }

    public move(split: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {

        if (!split) {
            if (this._direction === "horizontal") {
                const index = direction === "left" ? this._splitProviders.length - 1 : 0
                return this._splitProviders[index].move(split, direction)
            } else {
                const index = direction === "up" ? this._splitProviders.length - 1 : 0
                return this._splitProviders[index].move(split, direction)
            }
        }

        const containingSplit = this._getProviderForSplit(split)

        if (!containingSplit) {
            return null
        }

        const result = containingSplit.move(split, direction)

        if (result) {
            return result
        }

        if (!this._canHandleMove(direction)) {
            return null
        }

        // Since this wasn't handled by the containing split, let's try and handle it
        const index = this._splitProviders.indexOf(containingSplit)

        let increment = -1

        if ((this._direction === "horizontal" && direction === "right" )
            || (this._direction === "vertical" && direction === "down") ) {
                increment = 1
            }

        const newIndex = index +  increment

        if (newIndex < 0 || newIndex >= this._splitProviders.length) {
            return null
        }

        // Move into the next split over
        return this._splitProviders[newIndex].move(null, direction)
    }

//     private _getOppositeOrientation(): SplitDirection {
//         if (this._direction === "horizontal") {
//             return "vertical"
//         } else {
//             return "horizontal"
//         }
//     }

    private _canHandleMove(direction: Direction): boolean {
        switch (direction) {
            case "up":
                return this._direction === "vertical"
            case "down":
                return this._direction === "vertical"
            case "left":
                return this._direction === "horizontal"
            case "right":
                return this._direction === "horizontal"
            default:
                return false
        }
    }

    private _getProviderForSplit(split: Oni.IWindowSplit): IWindowSplitProvider {
        const providers = this._splitProviders.filter((prov) => prov.contains(split))

        return providers.length > 0 ? providers[0] : null
    }
}
