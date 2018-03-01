/**
 * layoutFromSplitInfoTests.ts
 */

import * as assert from "assert"
import * as Oni from "oni-api"

import { ISplitInfo, layoutFromSplitInfo } from "./../../../src/Services/WindowManager"

import { MockWindowSplit } from "./LinearSplitProviderTests"

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
        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: new MockWindowSplit("windowSplit1"),
                },
            ] as any,
            direction: "horizontal",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: Oni.Shapes.Rectangle.create(0, 0, 100, 100),
        })
    })

    it("splits layout between two vertical items", () => {
        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: new MockWindowSplit("windowSplit1"),
                },
                {
                    type: "Leaf",
                    contents: new MockWindowSplit("windowSplit2"),
                },
            ] as any,
            direction: "horizontal",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: Oni.Shapes.Rectangle.create(0, 0, 50, 100),
            windowSplit2: Oni.Shapes.Rectangle.create(50, 0, 50, 100),
        })
    })

    it("splits layout between two horizontal items", () => {
        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: new MockWindowSplit("windowSplit1"),
                },
                {
                    type: "Leaf",
                    contents: new MockWindowSplit("windowSplit2"),
                },
            ] as any,
            direction: "vertical",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: Oni.Shapes.Rectangle.create(0, 0, 100, 50),
            windowSplit2: Oni.Shapes.Rectangle.create(0, 50, 100, 50),
        })
    })

    it("nested layout - splits between a vertical item, and then nested horizontal items", () => {
        // 1|2
        // ---
        // 1|3

        const split: ISplitInfo<MockWindowSplit> = {
            type: "Split",
            splits: [
                {
                    type: "Leaf",
                    contents: new MockWindowSplit("windowSplit1"),
                },
                {
                    type: "Split",
                    splits: [
                        {
                            type: "Leaf",
                            contents: new MockWindowSplit("windowSplit2"),
                        },
                        {
                            type: "Leaf",
                            contents: new MockWindowSplit("windowSplit3"),
                        },
                    ],
                    direction: "vertical",
                },
            ] as any,
            direction: "horizontal",
        }

        const result = layoutFromSplitInfo(split, 100, 100)

        assert.deepEqual(result, {
            windowSplit1: Oni.Shapes.Rectangle.create(0, 0, 50, 100),
            windowSplit2: Oni.Shapes.Rectangle.create(50, 0, 50, 50),
            windowSplit3: Oni.Shapes.Rectangle.create(50, 50, 50, 50),
        })
    })
})
