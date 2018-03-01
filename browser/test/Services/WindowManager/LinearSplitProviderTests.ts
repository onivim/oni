/**
 * LinearSplitProviderTests.ts
 */

import * as assert from "assert"

import { LinearSplitProvider, ISplitLeaf, ISplitInfo } from "./../../../src/Services/WindowManager"

export class MockWindowSplit {
    constructor(private _id: string = "mock.window") {}

    public get id(): string {
        return this._id
    }

    public get innerSplit(): any {
        return null
    }

    public render(): JSX.Element {
        return null
    }
}

describe("LinearSplitProviderTests", () => {
    let split1: MockWindowSplit
    let split2: MockWindowSplit
    // let split1Provider: SingleSplitProvider
    // let split2Provider: SingleSplitProvider

    let horizontalSplits: LinearSplitProvider
    let verticalSplits: LinearSplitProvider

    beforeEach(() => {
        split1 = new MockWindowSplit()
        split2 = new MockWindowSplit()

        horizontalSplits = new LinearSplitProvider("horizontal")
        horizontalSplits.split(split1, "vertical")
        horizontalSplits.split(split2, "vertical", split1)

        verticalSplits = new LinearSplitProvider("vertical")
        verticalSplits.split(split1, "horizontal")
        verticalSplits.split(split2, "horizontal")
    })

    it("contains returns true for included splits", () => {
        assert.strictEqual(true, horizontalSplits.contains(split1))
        assert.strictEqual(true, horizontalSplits.contains(split2))
    })

    describe("move", () => {
        describe("horizontal split", () => {
            describe("null split", () => {
                it("moves in from left", () => {
                    // Because we're moving in from the left, split2 should be the active split
                    const result = horizontalSplits.move(null, "left")
                    assert.strictEqual(result, split2)
                })

                it("moves in from right", () => {
                    // Because we're moving in from the left, split2 should be the active split
                    const result = horizontalSplits.move(null, "right")
                    assert.strictEqual(result, split1)
                })
            })

            describe("moving between splits", () => {
                it("moves left->right", () => {
                    const result = horizontalSplits.move(split1, "right")
                    assert.strictEqual(result, split2)
                })

                it("moves right->left", () => {
                    const result = horizontalSplits.move(split1, "right")
                    assert.strictEqual(result, split2)
                })
            })
        })

        describe("vertical split", () => {
            describe("null split", () => {
                it("handles up", () => {
                    // Because we're moving in from the bottom (upwards), split2 should be the active split
                    const result = verticalSplits.move(null, "up")
                    assert.strictEqual(result, split2)
                })
            })
        })
    })

    describe("split", () => {
        it("creates nested split for different orientation", () => {
            const newSplit = new MockWindowSplit()
            horizontalSplits.split(newSplit, "vertical", split2)
        })

        it("switches orientation if there is no child", () => {
            const splitProvider = new LinearSplitProvider("vertical")
            const newSplit = new MockWindowSplit()
            splitProvider.split(newSplit, "vertical")

            const state = splitProvider.getState()

            assert.strictEqual(state.direction, "horizontal")
        })

        it("simple vertical split case", () => {
            const splitProvider = new LinearSplitProvider("horizontal")

            const split0 = new MockWindowSplit()
            const split1 = new MockWindowSplit()

            splitProvider.split(split0, "vertical")
            splitProvider.split(split1, "vertical", split0)

            const state = splitProvider.getState()

            const splitState0: ISplitLeaf<MockWindowSplit> = state.splits[0] as any
            const splitState1: ISplitLeaf<MockWindowSplit> = state.splits[1] as any

            assert.strictEqual(state.direction, "horizontal")
            assert.strictEqual(splitState0.contents, split0)
            assert.strictEqual(splitState1.contents, split1)
        })

        it("simple horizontal split case", () => {
            const splitProvider = new LinearSplitProvider("vertical")

            const split0 = new MockWindowSplit()
            const split1 = new MockWindowSplit()

            splitProvider.split(split0, "horizontal")
            splitProvider.split(split1, "horizontal", split0)

            const state = splitProvider.getState()

            const splitState0: ISplitLeaf<MockWindowSplit> = state.splits[0] as any
            const splitState1: ISplitLeaf<MockWindowSplit> = state.splits[1] as any

            assert.strictEqual(state.direction, "vertical")
            assert.strictEqual(splitState0.contents, split0)
            assert.strictEqual(splitState1.contents, split1)
        })

        // Test split arrangement like:
        // 0|1
        // ---
        // 0|2
        it("nested horizontal split case", () => {
            const splitProvider = new LinearSplitProvider("horizontal")

            const split0 = new MockWindowSplit()
            const split1 = new MockWindowSplit()

            splitProvider.split(split0, "vertical")
            splitProvider.split(split1, "vertical", split0)

            // Now, add a horizontal split against split1
            const split2 = new MockWindowSplit()

            splitProvider.split(split2, "horizontal", split1)

            const state = splitProvider.getState()

            assert.strictEqual(state.direction, "horizontal", "Verify root is still horizontal")
            const verticalSplitLeft = state.splits[0] as ISplitLeaf<MockWindowSplit>
            assert.strictEqual(verticalSplitLeft.type, "Leaf")
            assert.strictEqual(verticalSplitLeft.contents, split0)

            const verticalSplitRight = state.splits[1] as ISplitInfo<MockWindowSplit>
            assert.strictEqual(verticalSplitRight.type, "Split")
            assert.strictEqual(verticalSplitRight.direction, "vertical", "Verify child is vertical")

            const verticalSplitRightChild0: ISplitLeaf<MockWindowSplit> = verticalSplitRight
                .splits[0] as any
            const verticalSplitRightChild1: ISplitLeaf<MockWindowSplit> = verticalSplitRight
                .splits[1] as any

            assert.strictEqual(verticalSplitRightChild0.contents, split1)
            assert.strictEqual(verticalSplitRightChild1.contents, split2)
        })

        // Test split arrangement like:
        // 0|2
        // ---
        // 111

        it("nested vertical split case", () => {
            const splitProvider = new LinearSplitProvider("vertical")

            const split0 = new MockWindowSplit("split0")
            const split1 = new MockWindowSplit("split1")

            splitProvider.split(split0, "horizontal")
            splitProvider.split(split1, "horizontal", split0)

            // Now, add a horizontal split against split1
            const split2 = new MockWindowSplit("split2")

            splitProvider.split(split2, "vertical", split0)

            const state = splitProvider.getState()

            assert.strictEqual(state.direction, "vertical", "Verify root is still vertical")

            // Verify bottom leaf is as expected
            const horizontalSplitBottom = state.splits[1] as ISplitLeaf<MockWindowSplit>
            assert.strictEqual(horizontalSplitBottom.type, "Leaf")
            assert.strictEqual(horizontalSplitBottom.contents, split1)

            const horizontalSplitTop = state.splits[0] as ISplitInfo<MockWindowSplit>
            assert.strictEqual(horizontalSplitTop.type, "Split")
            assert.strictEqual(
                horizontalSplitTop.direction,
                "horizontal",
                "Verify child is horizontal",
            )

            const horizontalSplitTopChild0: ISplitLeaf<MockWindowSplit> = horizontalSplitTop
                .splits[0] as any
            const horizontalSplitTopChild1: ISplitLeaf<MockWindowSplit> = horizontalSplitTop
                .splits[1] as any

            assert.strictEqual(horizontalSplitTopChild0.contents, split0)
            assert.strictEqual(horizontalSplitTopChild1.contents, split2)
        })
    })
})
