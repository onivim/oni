/**
 * LinearSplitProviderTests.ts
 */

import * as assert from "assert"

import { LinearSplitProvider } from "./../../../src/Services/WindowManager"

export class MockWindowSplit {
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
        horizontalSplits.split(split1, "horizontal")
        horizontalSplits.split(split2, "horizontal", split1)

        verticalSplits = new LinearSplitProvider("vertical")
        verticalSplits.split(split1, "vertical")
        verticalSplits.split(split2, "vertical")
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
    })
})
