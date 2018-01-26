/**
 * RelationalSplitProvider.ts
 *
 * Composite split provider responsible for managing
 * navigation relationships between other split provdiers
 */

import * as Oni from "oni-api"

import { Direction, getInverseDirection, IWindowSplitNavigator } from "./index"

export interface WindowSplitRelationship {
    from: IWindowSplitNavigator
    to: IWindowSplitNavigator
    direction: string
}

export class RelationalSplitNavigator implements IWindowSplitNavigator {
    private _relationships: WindowSplitRelationship[] = []
    private _providers: IWindowSplitNavigator[] = []

    public setRelationship(
        from: IWindowSplitNavigator,
        to: IWindowSplitNavigator,
        direction: Direction,
    ): void {
        this._relationships.push({
            from,
            to,
            direction,
        })

        // Also push the inverse
        this._relationships.push({
            from: to,
            to: from,
            direction: getInverseDirection(direction),
        })

        this._addToProvidersIfNeeded(from)
        this._addToProvidersIfNeeded(to)
    }

    public contains(split: Oni.IWindowSplit): boolean {
        return this._getContainingSplit(split) !== null
    }

    public move(split: Oni.IWindowSplit, direction: Direction): Oni.IWindowSplit {
        // If there is no current split, that means we are entering
        if (split === null) {
            // Need to find the furthest split in the *reverse* direction.
            // For example, if we are moving *right* into this split,
            // we want to grab the furthest *left* split
            const reverseDirection = getInverseDirection(direction)
            const splitProvider = this._getFurthestSplitInDirection(reverseDirection, null)
            return splitProvider.move(null, direction)
        }

        const containingSplit = this._getContainingSplit(split)

        if (!containingSplit) {
            return null
        }

        // Check if the containing split handled it
        const moveResult = containingSplit.move(split, direction)
        if (moveResult) {
            return moveResult
        }

        // The containing split couldn't handle it, so let's see if there is a relationship from the containing split
        const applicableRelationship = this._relationships.filter(
            rel => rel.from === containingSplit && rel.direction === direction,
        )

        if (applicableRelationship.length > 0) {
            return applicableRelationship[0].to.move(null, direction)
        } else {
            return null
        }
    }

    private _getFurthestSplitInDirection(
        direction: Direction,
        split: IWindowSplitNavigator,
    ): IWindowSplitNavigator {
        const splits = this._relationships.filter(
            rel => (rel.direction === direction && rel.from === split) || split === null,
        )

        // Base case - there are no further splits in that direction, so return the current one
        if (splits.length === 0) {
            return split
        }

        // Recursive case - take the 'to' split and see if there is anything further
        const currentRelationship = splits[0]
        return this._getFurthestSplitInDirection(direction, currentRelationship.to)
    }

    private _getContainingSplit(split: Oni.IWindowSplit): IWindowSplitNavigator {
        const providers = this._providers.filter(s => s.contains(split))
        return providers.length === 0 ? null : providers[0]
    }

    private _addToProvidersIfNeeded(provider: IWindowSplitNavigator): void {
        if (this._providers.indexOf(provider) === -1) {
            this._providers.push(provider)
        }
    }
}
