import * as assert from "assert"

import * as WindowSplit from "./../../src/Services/WindowSplit"

function getRoot<T>() { return WindowSplit.createSplitRoot<T>(WindowSplit.SplitDirection.Horizontal, null) }

describe("WindowSplit", () => {

    describe("applySplit", () => {
        it("adds split to empty root", () => {
             const root = getRoot<number>()

             const leaf = WindowSplit.createSplitLeaf(1)

             const result = WindowSplit.applySplit(root, WindowSplit.SplitDirection.Horizontal, leaf)

             assert.strictEqual(result.splits.length, 1)
             assert.strictEqual(result.splits[0], leaf)
        })
    })

    describe("closeSplit", () => {
        it("removes split from array", () => {
             const root = getRoot<number>()
             const leaf = WindowSplit.createSplitLeaf(1)
             const result = WindowSplit.applySplit(root, WindowSplit.SplitDirection.Horizontal, leaf)

             const resultAfterClose = WindowSplit.closeSplit(result, 1)

             assert.strictEqual(resultAfterClose.splits.length, 0)
        })
    })
})
