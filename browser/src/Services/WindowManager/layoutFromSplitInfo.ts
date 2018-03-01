/**
 * layoutFromSplitInfo.ts
 *
 * Function to layout splits into a particular window
 */

import * as Oni from "oni-api"

import { IAugmentedSplitInfo, ISplitInfo, SplitOrLeaf } from "./WindowManagerStore"

export type LayoutResult = { [windowId: string]: Oni.Shapes.Rectangle }

export const layoutFromSplitInfo = (
    splits: ISplitInfo<IAugmentedSplitInfo>,
    width: number,
    height: number,
): LayoutResult => {
    return layoutFromSplitInfoHelper(splits, Oni.Shapes.Rectangle.create(0, 0, width, height))
}

const layoutFromSplitInfoHelper = (
    split: SplitOrLeaf<IAugmentedSplitInfo>,
    rectangle: Oni.Shapes.Rectangle,
): LayoutResult => {
    // Base case..
    if (split.type === "Leaf") {
        return { [split.contents.id]: rectangle }
    }

    if (split.splits.length === 0) {
        return {}
    }

    // Recursive case
    const splitWidth =
        split.direction === "horizontal" ? rectangle.width / split.splits.length : rectangle.width
    const splitHeight =
        split.direction === "vertical" ? rectangle.height / split.splits.length : rectangle.height

    let ret = {}

    for (let i = 0; i < split.splits.length; i++) {
        const x = split.direction === "horizontal" ? rectangle.x + splitWidth * i : rectangle.x
        const y = split.direction === "vertical" ? rectangle.y + splitHeight * i : rectangle.y

        const rect = Oni.Shapes.Rectangle.create(x, y, splitWidth, splitHeight)

        ret = {
            ...ret,
            ...layoutFromSplitInfoHelper(split.splits[i], rect),
        }
    }

    return ret
}
