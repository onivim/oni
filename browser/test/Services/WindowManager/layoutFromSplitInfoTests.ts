/**
 * layoutFromSplitInfoTests.ts
 */

import * as assert from "assert"
import * as Oni from "oni-api"

import { ISplitInfo, layoutFromSplitInfo } from "./../../../src/Services/WindowManager"

import { MockWindowSplit } from "./../../Mocks"

const resultFromSplitAndRect = (rectangle: Oni.Shapes.Rectangle, split: MockWindowSplit) => ({
    split,
    rectangle,
})

describe("layoutFromSplitInfoTests", () => {
    it("returns empty if no splits", () => {
        const emptySplit: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [] as any,
            direction: "horizontal",
        }

        const result = layoutFromSplitInfo(emptySplit, 100, 100)
        assert.deepEqual(result, {})
    })

    it("gives full layout to a single item", () => {
        const split1 = new MockWindowSplit("windowSplit1")
        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: split1,
                },
            ] as any,
            direction: "horizontal",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(0, 0, 100, 100),
                split1,
            ),
        })
    })

    it("splits layout between two vertical items", () => {
        const split1 = new MockWindowSplit("windowSplit1")
        const split2 = new MockWindowSplit("windowSplit2")
        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: split1,
                },
                {
                    type: "Leaf",
                    contents: split2,
                },
            ] as any,
            direction: "horizontal",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(0, 0, 50, 100),
                split1,
            ),
            windowSplit2: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(50, 0, 50, 100),
                split2,
            ),
        })
    })

    it("splits layout between two horizontal items", () => {
        const split1 = new MockWindowSplit("windowSplit1")
        const split2 = new MockWindowSplit("windowSplit2")

        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: split1,
                },
                {
                    type: "Leaf",
                    contents: split2,
                },
            ] as any,
            direction: "vertical",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(0, 0, 100, 50),
                split1,
            ),
            windowSplit2: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(0, 50, 100, 50),
                split2,
            ),
        })
    })

    it("nested layout - splits between a vertical item, and then nested horizontal items", () => {
        // 1|2
        // ---
        // 1|3
        const split1 = new MockWindowSplit("windowSplit1")
        const split2 = new MockWindowSplit("windowSplit2")
        const split3 = new MockWindowSplit("windowSplit3")

        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: split1,
                },
                {
                    type: "Split",
                    splits: [
                        {
                            type: "Leaf",
                            contents: split2,
                        },
                        {
                            type: "Leaf",
                            contents: split3,
                        },
                    ],
                    direction: "vertical",
                },
            ] as any,
            direction: "horizontal",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(0, 0, 50, 100),
                split1,
            ),
            windowSplit2: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(50, 0, 50, 50),
                split2,
            ),
            windowSplit3: resultFromSplitAndRect(
                Oni.Shapes.Rectangle.create(50, 50, 50, 50),
                split3,
            ),
        })
    })
})
