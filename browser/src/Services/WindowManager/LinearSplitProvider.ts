/**
 * TreeSplitProvider.ts
 *
 * Composite split provider responsible for managing
 * a tree-based hierarchy of horizontal and vertical splits
 */

import {
    Direction,
    IAugmentedSplitInfo,
    ISplitInfo,
    IWindowSplitProvider,
    SingleSplitProvider,
    SplitDirection,
} from "./index"

export const getInverseDirection = (splitDirection: SplitDirection): SplitDirection => {
    switch (splitDirection) {
        case "horizontal":
            return "vertical"
        case "vertical":
        default:
            return "horizontal"
    }
}

export class LinearSplitProvider implements IWindowSplitProvider {
    constructor(
        private _direction: SplitDirection,
        private _splitProviders: IWindowSplitProvider[] = [],
    ) {}

    public contains(split: IAugmentedSplitInfo): boolean {
        return this._getProviderForSplit(split) != null
    }

    public close(split: IAugmentedSplitInfo): boolean {
        const containingSplit = this._getProviderForSplit(split)

        if (!containingSplit) {
            return false
        }

        const handled = containingSplit.close(split)

        if (handled) {
            return true
        }

        // If it was unhandled by the split provider, but the provider contains it, then we'll remove the provider
        this._splitProviders = this._splitProviders.filter(prov => prov !== containingSplit)
        return true
    }

    public split(
        split: IAugmentedSplitInfo,
        direction: SplitDirection,
        referenceSplit?: IAugmentedSplitInfo,
    ): boolean {
        // If there are no children, we can just match direction
        if (this._splitProviders.length === 0) {
            this._direction = getInverseDirection(direction)
            this._splitProviders.push(new SingleSplitProvider(split))
            return true
        }

        // If there is no reference split, we can just tack this split on
        if (!referenceSplit) {
            this._splitProviders.push(new SingleSplitProvider(split))
            return true
        }

        const containingSplit = this._getProviderForSplit(referenceSplit)

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
            const singleSplitProvider = new SingleSplitProvider(split)
            this._splitProviders.push(singleSplitProvider)
        } else {
            // Otherwise, we can - let's wrap up the split in a provider

            const previousIndex = this._splitProviders.indexOf(containingSplit)
            const elementsBefore = this._splitProviders.slice(0, previousIndex)
            const elementsAfter = this._splitProviders.slice(
                previousIndex + 1,
                this._splitProviders.length,
            )

            const children = [containingSplit, new SingleSplitProvider(split)]
            const childSplitProvider = new LinearSplitProvider(
                getInverseDirection(this._direction),
                children,
            )

            this._splitProviders = [...elementsBefore, childSplitProvider, ...elementsAfter]
        }

        return true
    }

    public move(split: IAugmentedSplitInfo, direction: Direction): IAugmentedSplitInfo {
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
        const originalIndex = this._splitProviders.indexOf(containingSplit)

        let increment = -1

        if (
            (this._direction === "horizontal" && direction === "right") ||
            (this._direction === "vertical" && direction === "down")
        ) {
            increment = 1
        }

        const newIndex = originalIndex + increment

        if (newIndex < 0 || newIndex >= this._splitProviders.length) {
            return null
        }

        // Move into the next split over
        return this._splitProviders[newIndex].move(null, direction)
    }

    public getState(): ISplitInfo<IAugmentedSplitInfo> {
        return {
            type: "Split",
            direction: this._direction,
            splits: this._splitProviders.map(sp => sp.getState()),
        }
    }

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

    private _getProviderForSplit(split: IAugmentedSplitInfo): IWindowSplitProvider {
        const providers = this._splitProviders.filter(prov => prov.contains(split))

        return providers.length > 0 ? providers[0] : null
    }
}
